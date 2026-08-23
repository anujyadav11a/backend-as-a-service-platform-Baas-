import { EventEmitter } from 'events';

export class AuthEventBus extends EventEmitter {
    static EVENTS = {
        USER_REGISTERED: 'user.registered',
        USER_LOGGED_IN: 'user.logged_in',
        USER_LOGGED_OUT: 'user.logged_out',
        TENANT_USER_REGISTERED: 'tenant.user.registered',
        TENANT_USER_LOGGED_IN: 'tenant.user.logged_in',
        TENANT_USER_LOGGED_OUT: 'tenant.user.logged_out',
    };
}

export const authEventBus = new AuthEventBus();

authEventBus.on(AuthEventBus.EVENTS.USER_REGISTERED, (data) => {
    console.log('[Auth Event] User registered:', data);
});

authEventBus.on(AuthEventBus.EVENTS.USER_LOGGED_IN, (data) => {
    console.log('[Auth Event] User logged in:', data);
});

authEventBus.on(AuthEventBus.EVENTS.TENANT_USER_REGISTERED, (data) => {
    console.log('[Auth Event] Tenant user registered:', data);
});

authEventBus.on(AuthEventBus.EVENTS.TENANT_USER_LOGGED_IN, (data) => {
    console.log('[Auth Event] Tenant user logged in:', data);
});

export const emitUserRegistered = (data) => authEventBus.emit(AuthEventBus.EVENTS.USER_REGISTERED, data);
export const emitUserLoggedIn = (data) => authEventBus.emit(AuthEventBus.EVENTS.USER_LOGGED_IN, data);
export const emitUserLoggedOut = (data) => authEventBus.emit(AuthEventBus.EVENTS.USER_LOGGED_OUT, data);
export const emitTenantUserRegistered = (data) => authEventBus.emit(AuthEventBus.EVENTS.TENANT_USER_REGISTERED, data);
export const emitTenantUserLoggedIn = (data) => authEventBus.emit(AuthEventBus.EVENTS.TENANT_USER_LOGGED_IN, data);
export const emitTenantUserLoggedOut = (data) => authEventBus.emit(AuthEventBus.EVENTS.TENANT_USER_LOGGED_OUT, data);