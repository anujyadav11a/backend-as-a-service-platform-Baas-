import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ConsoleSession } from '../models/ConsoleSession.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { parseUserAgent, getLocationFromIP } from '../../../shared/utils/authHelpers.js';
import crypto from 'crypto';
import { eventBus } from '../../../shared/events/EventBus.js';
import { AuthEvents } from '../../../shared/events/authEvents.js';
import config from '../../../shared/config/env.js';
import { generateAccessAndRefreshToken, rotateRefreshToken } from '../utils/tokenUtils.js';
import { createUserSession } from '../utils/sessionUtils.js';

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
            const decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret);
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