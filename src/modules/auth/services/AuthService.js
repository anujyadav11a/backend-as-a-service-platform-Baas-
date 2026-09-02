import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ConsoleSession } from '../models/ConsoleSession.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { parseUserAgent, getLocationFromIP } from '../../../shared/utils/authHelpers.js';
import { setAuthCookies, clearAuthCookies } from '../../../shared/utils/cookieUtils.js';
import crypto from 'crypto';
import { eventBus } from '../../../shared/events/EventBus.js';
import { AuthEvents } from '../../../shared/events/authEvents.js';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            logger.error('User not found during token generation', { userId });
            throw ApiError.notFound("User not found");
        }
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshtoken = refreshToken;
        await user.save({ validateBeforeSave: false });

        logger.info('Tokens generated successfully', { userId });
        return { accessToken, refreshToken };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        logger.error('Token generation failed', { userId, error: error.message });
        throw ApiError.internal("Failed to generate authentication tokens");
    }
};

const rotateRefreshToken = async (userId, oldRefreshToken, req) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            logger.error('User not found during token rotation', { userId });
            throw ApiError.notFound("User not found");
        }

        // Verify the old refresh token matches
        const isValid = await user.compareRefreshToken(oldRefreshToken);
        if (!isValid) {
            // REUSE DETECTION: Token doesn't match - possible theft
            logger.warn('Refresh token reuse detected - revoking all sessions', { userId });
            
            // Revoke all user sessions
            await ConsoleSession.invalidateAllUserSessions(userId);
            await User.findByIdAndUpdate(userId, { refreshtoken: null });
            
            // Emit security event
            eventBus.emit(AuthEvents.REFRESH_TOKEN_REUSE_DETECTED, {
                userId,
                ip: req?.ip,
                userAgent: req?.headers?.['user-agent']
            });
            
            throw ApiError.unauthorized("Token reuse detected. All sessions revoked for security.");
        }

        // Generate new token pair
        const accessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();
        
        // Update user with new refresh token
        user.refreshtoken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        // Update session with new refresh token
        const session = await ConsoleSession.findOne({
            user_id: userId,
            is_active: true
        });
        
        if (session) {
            session.refresh_token = newRefreshToken;
            await session.save();
        }

        logger.info('Refresh token rotated successfully', { userId });
        return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        logger.error('Token rotation failed', { userId, error: error.message });
        throw ApiError.internal("Failed to rotate authentication tokens");
    }
};

const createUserSession = async (user, req, sessionToken, refreshToken) => {
    try {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const deviceInfo = parseUserAgent(userAgent);
        
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
        
        const session = new ConsoleSession({
            user_id: user._id,
            session_token: sessionToken,
            refresh_token: refreshToken,
            ip_address: ipAddress,
            user_agent: userAgent,
            device_info: deviceInfo,
            location: await getLocationFromIP(ipAddress),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            login_method: 'email_password',
            is_active: true
        });

        const savedSession = await session.save();
        
        logger.info('User session created', {
            userId: user._id,
            sessionId: savedSession._id,
            ipAddress,
            deviceType: deviceInfo.device_type
        });

        return savedSession;
    } catch (error) {
        logger.error('Failed to create user session', {
            userId: user._id,
            error: error.message
        });
        throw ApiError.internal("Failed to create user session");
    }
};

export class AuthService {
    static async register({ name, email, password }) {
        logger.info('User registration attempt', { email });

        const sanitizedName = name.trim();
        const sanitizedEmail = email.toLowerCase().trim();

        const userExist = await User.findOne({ email: sanitizedEmail });
        if (userExist) {
            logger.warn('Registration attempt with existing email', { email: sanitizedEmail });
            throw ApiError.conflict("User already exists with this email");
        }

        const user = await User.create({
            name: sanitizedName,
            email: sanitizedEmail,
            password
        });

        const createdUser = await User.findById(user._id).select("-password -refreshtoken");

        if (!createdUser) {
            logger.error('User creation failed', { email: sanitizedEmail });
            throw ApiError.internal("User registration failed, please try again");
        }

        logger.info('User registered successfully', { 
            userId: createdUser._id, 
            email: sanitizedEmail 
        });

        // Emit domain event
        eventBus.emit(AuthEvents.USER_REGISTERED, {
            userId: createdUser._id,
            email: sanitizedEmail,
            name: sanitizedName
        });

        return createdUser;
    }

    static async login({ email, password, req }) {
        logger.info('User login attempt', { 
            email, 
            ip: req.ip, 
            userAgent: req.headers['user-agent'] 
        });

        const sanitizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: sanitizedEmail });
        if (!user) {
            logger.warn('Login attempt with non-existent email', { email: sanitizedEmail });
            throw ApiError.unauthorized("Invalid email or password");
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            logger.warn('Login attempt with invalid password', { 
                userId: user._id, 
                email: sanitizedEmail 
            });
            throw ApiError.unauthorized("Invalid email or password");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        const sessionToken = crypto.randomBytes(32).toString('hex');
        const session = await createUserSession(user, req, sessionToken, refreshToken);

        const loggedInUser = await User.findById(user._id).select("-password -refreshtoken");

        const tokens = {
            accessToken,
            refreshToken,
            sessionToken
        };

        // Emit domain event
        eventBus.emit(AuthEvents.USER_LOGGED_IN, {
            userId: user._id,
            email: sanitizedEmail,
            authType: 'console',
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        return {
            user: loggedInUser,
            session: {
                id: session._id,
                expires_at: session.expires_at,
                device_info: session.device_info,
                location: session.location
            },
            tokens: {
                accessToken,
                refreshToken,
                sessionToken
            }
        };
    }

    

    static async getSessions(userId) {
        const sessions = await ConsoleSession.findActiveSessions(userId);

        return sessions.map(session => ({
            id: session._id,
            ip_address: session.ip_address,
            device_info: session.device_info,
            location: session.location,
            login_method: session.login_method,
            last_activity: session.last_activity,
            created_at: session.createdAt,
        }));
    }

    static async revokeSession(sessionId, userId) {
        const session = await ConsoleSession.findOne({
            _id: sessionId,
            user_id: userId,
            is_active: true
        });

        if (!session) {
            throw ApiError.notFound("Session not found");
        }

        await session.invalidate();

        logger.info('Session revoked', { sessionId, userId });

        return { success: true };
    }

    static async refreshToken(refreshToken, req) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const userId = decoded._id;

            const { accessToken, refreshToken: newRefreshToken } = await rotateRefreshToken(userId, refreshToken, req);

            return {
                tokens: {
                    accessToken,
                    refreshToken: newRefreshToken,
                    sessionToken: req.cookies?.sessionId
                }
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                throw ApiError.unauthorized("Invalid or expired refresh token");
            }
            logger.error('Token refresh failed', { error: error.message });
            throw ApiError.internal("Failed to refresh token");
}
    }

    static async logout({ refreshToken, userId }) {
        logger.info('Console user logout attempt', { userId, hasRefreshToken: !!refreshToken });

        if (refreshToken) {
            const sessions = await ConsoleSession.findActiveSessions(userId);

            let matchedSession = null;
            for (const session of sessions) {
                const isMatch = await session.compareRefreshToken(refreshToken);
                if (isMatch) {
                    matchedSession = session;
                    break;
                }
            }

            if (matchedSession) {
                await matchedSession.invalidate();

                logger.info('Console session invalidated on logout', {
                    sessionId: matchedSession._id,
                    userId: matchedSession.user_id
                });

                // Emit domain event
                eventBus.emit(AuthEvents.USER_LOGGED_OUT, {
                    userId: matchedSession.user_id,
                    sessionId: matchedSession._id
                });
            }
        }

        logger.info('Console user logged out successfully', { userId });

        return { success: true };
    }
}