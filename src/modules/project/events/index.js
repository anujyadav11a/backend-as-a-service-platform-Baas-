import { EventEmitter } from 'events';

export class ProjectEventBus extends EventEmitter {
    static EVENTS = {
        PROJECT_CREATED: 'project.created',
        PROJECT_UPDATED: 'project.updated',
        PROJECT_DELETED: 'project.deleted',
        API_KEY_GENERATED: 'project.apikey.generated',
        API_KEY_REVOKED: 'project.apikey.revoked',
    };
}

export const projectEventBus = new ProjectEventBus();

projectEventBus.on(ProjectEventBus.EVENTS.PROJECT_CREATED, (data) => {
    console.log('[Project Event] Project created:', data);
});

projectEventBus.on(ProjectEventBus.EVENTS.PROJECT_DELETED, (data) => {
    console.log('[Project Event] Project deleted:', data);
});

projectEventBus.on(ProjectEventBus.EVENTS.API_KEY_GENERATED, (data) => {
    console.log('[Project Event] API key generated:', data);
});

export const emitProjectCreated = (data) => projectEventBus.emit(ProjectEventBus.EVENTS.PROJECT_CREATED, data);
export const emitProjectUpdated = (data) => projectEventBus.emit(ProjectEventBus.EVENTS.PROJECT_UPDATED, data);
export const emitProjectDeleted = (data) => projectEventBus.emit(ProjectEventBus.EVENTS.PROJECT_DELETED, data);
export const emitApiKeyGenerated = (data) => projectEventBus.emit(ProjectEventBus.EVENTS.API_KEY_GENERATED, data);
export const emitApiKeyRevoked = (data) => projectEventBus.emit(ProjectEventBus.EVENTS.API_KEY_REVOKED, data);