import { TenantUser } from '../models/TenantUser.js';
import { TenantSession } from '../models/TenantSession.js';
import { Project } from '../../project/models/Project.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { parseUserAgent, getLocationFromIP } from '../../../shared/utils/authHelpers.js';
import { setAuthCookies, clearAuthCookies } from '../../../shared/utils/cookieUtils.js';
import crypto from 'crypto';
import { eventBus } from '../../../shared/events/EventBus.js';
import { AuthEvents } from '../../../shared/events/authEvents.js';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await TenantUser.findById(userId);
        if (!user) {
            logger.error('Tenant user not found during token generation', { userId });
            throw ApiError.notFound("User not found");
        }
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        logger.info('Tenant tokens generated successfully', { userId, projectId: user.project_id });
        return { accessToken, refreshToken };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        logger.error('Tenant token generation failed', { userId, error: error.message });
        throw ApiError.internal("Failed to generate authentication tokens");
    }
};

const createTenantSession = async (user, req, refreshToken) => {
    try {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const deviceInfo = parseUserAgent(userAgent);

        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

        const locationData = await getLocationFromIP(ipAddress);

        const sessionData = {
            user_id: user._id,
            project_id: user.project_id,
            refresh_token: refreshToken,
            device_info: deviceInfo,
            location: {
                ip_address: ipAddress,
                ...locationData
            }
        };

        const session = await TenantSession.createSession(sessionData);

        logger.info('Tenant session created', {
            userId: user._id,
            projectId: user.project_id,
            sessionId: session._id,
            ipAddress,
            deviceType: deviceInfo.device_type
        });

        return session;
    } catch (error) {
        logger.error('Failed to create tenant session', {
            userId: user._id,
            projectId: user.project_id,
            error: error.message
        });
        throw ApiError.internal("Failed to create user session");
    }
};

export class TenantAuthService {
    static async register({ username, email, password, projectId, apiKey }) {
        logger.info('Tenant user registration attempt', { email, projectId });

        const sanitizedUsername = username.trim();
        const sanitizedEmail = email.toLowerCase().trim();

        const project = await Project.findOne({ 
            project_id: projectId, 
            api_key: apiKey, 
            status: 'active' 
        });
        
        if (!project) {
            logger.warn('Registration attempt with invalid project credentials', { 
                project_id: projectId, 
                email: sanitizedEmail 
            });
            throw ApiError.unauthorized("Invalid project credentials");
        }

        const userExist = await TenantUser.findByProjectAndEmail(projectId, sanitizedEmail);
        if (userExist) {
            logger.warn('Registration attempt with existing email in project', { 
                email: sanitizedEmail, 
                project_id: projectId 
            });
            throw ApiError.conflict("User already exists with this email in this project");
        }

        const usernameExist = await TenantUser.findByProjectAndUsername(projectId, sanitizedUsername);
        if (usernameExist) {
            logger.warn('Registration attempt with existing username in project', { 
                username: sanitizedUsername, 
                project_id: projectId 
            });
            throw ApiError.conflict("Username already taken in this project");
        }

        const user = await TenantUser.create({
            username: sanitizedUsername,
            email: sanitizedEmail,
            password,
            project_id: projectId
        });

        const createdUser = await TenantUser.findById(user._id).select("-password");

        if (!createdUser) {
            logger.error('Tenant user creation failed', { email: sanitizedEmail, project_id: projectId });
            throw ApiError.internal("User registration failed, please try again");
        }

        logger.info('Tenant user registered successfully', { 
            userId: createdUser._id, 
            email: sanitizedEmail,
            project_id: projectId
        });

        // Emit domain event
        eventBus.emit(AuthEvents.TENANT_USER_REGISTERED, {
            userId: createdUser._id,
            email: sanitizedEmail,
            username: sanitizedUsername,
            projectId
        });

        return createdUser;
    }

    static async login({ email, password, projectId, apiKey, req }) {
        logger.info('Tenant user login attempt', { 
            email, 
            project_id: projectId,
            ip: req.ip, 
            userAgent: req.headers['user-agent'] 
        });

        const sanitizedEmail = email.toLowerCase().trim();

        const project = await Project.findOne({ 
            project_id: projectId, 
            api_key: apiKey, 
            status: 'active' 
        });
        
        if (!project) {
            logger.warn('Login attempt with invalid project credentials', { 
                project_id: projectId, 
                email: sanitizedEmail 
            });
            throw ApiError.unauthorized("Invalid project credentials");
        }

        const user = await TenantUser.findByProjectAndEmail(projectId, sanitizedEmail);
        if (!user) {
            logger.warn('Login attempt with non-existent email in project', { 
                email: sanitizedEmail, 
                project_id: projectId 
            });
            throw ApiError.unauthorized("Invalid email or password");
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            logger.warn('Login attempt with invalid password', { 
                userId: user._id, 
                email: sanitizedEmail,
                project_id: projectId
            });
            throw ApiError.unauthorized("Invalid email or password");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        const session = await createTenantSession(user, req, refreshToken);

        const loggedInUser = await TenantUser.findById(user._id).select("-password");

        const tokens = {
            accessToken,
            refreshToken,
            sessionToken: session._id.toString()
        };

        // Emit domain event
        eventBus.emit(AuthEvents.TENANT_USER_LOGGED_IN, {
            userId: user._id,
            email: sanitizedEmail,
            projectId,
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
                accessToken
            },
            cookies: setAuthCookies(null, tokens, 'tenant')
        };
    }

    static async logout({ refreshToken, userId }) {
        logger.info('Tenant user logout attempt', { userId, hasRefreshToken: !!refreshToken });

        if (refreshToken) {
            const sessions = await TenantSession.find({ 
                user_id: userId,
                status: 'active' 
            });

            let matchedSession = null;
            for (const session of sessions) {
                const isMatch = await session.compareRefreshToken(refreshToken);
                if (isMatch) {
                    matchedSession = session;
                    break;
                }
            }

            if (matchedSession) {
                matchedSession.status = 'revoked';
                matchedSession.logout_time = new Date();
                await matchedSession.save();
                
                logger.info('Tenant session invalidated on logout', { 
                    sessionId: matchedSession._id, 
                    userId: matchedSession.user_id,
                    projectId: matchedSession.project_id
                });

                // Emit domain event
                eventBus.emit(AuthEvents.TENANT_USER_LOGGED_OUT, {
                    userId: matchedSession.user_id,
                    projectId: matchedSession.project_id,
                    sessionId: matchedSession._id
                });
            }
        }

        logger.info('Tenant user logged out successfully', { userId });

        return clearAuthCookies(null, 'tenant');
    }

    static async getSessions(userId, projectId) {
        const sessions = await TenantSession.find({
            user_id: userId,
            status: 'active'
        }).sort({ login_time: -1 });

        return sessions.map(session => ({
            id: session._id,
            device_info: session.device_info,
            location: session.location,
            login_time: session.login_time,
            last_activity: session.last_activity,
            expires_at: session.expires_at,
        }));
    }

    static async revokeSession(sessionId, userId) {
        const session = await TenantSession.findOne({
            _id: sessionId,
            user_id: userId,
            status: 'active'
        });

        if (!session) {
            throw ApiError.notFound("Session not found");
        }

        session.status = 'revoked';
        session.logout_time = new Date();
        await session.save();

        logger.info('Tenant session revoked', { 
            sessionId, 
            userId,
            projectId: session.project_id
        });

        return { success: true };
    }

    static async getCurrentUser(userId) {
        const user = await TenantUser.findById(userId).select("-password");

        if (!user) {
            logger.error('Current tenant user not found', { userId });
            throw ApiError.notFound("User not found");
        }

        logger.info('Retrieved current tenant user', {
            userId,
            email: user.email
        });

        return user;
    }
}