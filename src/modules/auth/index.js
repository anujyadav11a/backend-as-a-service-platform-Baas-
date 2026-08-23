export * from './models/User.js';
export * from './models/ConsoleSession.js';
export * from './models/Identity.js';
export * from './models/TenantUser.js';
export * from './models/TenantSession.js';
export * from './models/TenantIdentity.js';

export { AuthService } from './services/AuthService.js';
export { TenantAuthService } from './services/TenantAuthService.js';
export { OAuthService } from './services/OAuthService.js';

export { AuthController } from './controllers/AuthController.js';
export { TenantAuthController } from './controllers/TenantAuthController.js';
export { OAuthController } from './controllers/OAuthController.js';

export { default as authRoutes } from './routes/auth.routes.js';

export { 
    authEventBus,
    AuthEventBus,
    emitUserRegistered,
    emitUserLoggedIn,
    emitUserLoggedOut,
    emitTenantUserRegistered,
    emitTenantUserLoggedIn,
    emitTenantUserLoggedOut
} from './events/index.js';