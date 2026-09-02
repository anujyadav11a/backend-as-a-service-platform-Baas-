import { logger } from './Logger.js';

export class SagaRunner {
  static async run(steps, context = {}) {
    const completedSteps = [];
    const sagaContext = { ...context, completedSteps };

    for (const step of steps) {
      const { name, execute, compensate } = step;
      
      logger.debug(`Saga step started: ${name}`, { sagaContext });
      
      try {
        await execute(sagaContext);
        completedSteps.push({ name, compensate });
        logger.debug(`Saga step completed: ${name}`, { sagaContext });
      } catch (error) {
        logger.error(`Saga step failed: ${name}`, { error: error.message, sagaContext });
        
        // Run compensations in reverse order
        await this._compensate(completedSteps, sagaContext);
        
        throw new SagaError(`Saga failed at step: ${name}`, error, completedSteps);
      }
    }

    return { success: true, context: sagaContext };
  }

  static async _compensate(completedSteps, context) {
    for (const step of completedSteps.reverse()) {
      if (step.compensate) {
        logger.debug(`Running compensation for: ${step.name}`, { context });
        try {
          await step.compensate(context);
          logger.debug(`Compensation completed: ${step.name}`);
        } catch (compError) {
          logger.error(`Compensation failed: ${step.name}`, { 
            error: compError.message, 
            context 
          });
        }
      }
    }
  }
}

export class SagaError extends Error {
  constructor(message, originalError, completedSteps) {
    super(message);
    this.name = 'SagaError';
    this.originalError = originalError;
    this.completedSteps = completedSteps;
  }
}