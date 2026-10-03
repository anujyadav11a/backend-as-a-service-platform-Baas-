import { redis } from "../config/redis.config.js";
import { logger } from "./Logger.js";

const SESSION_PREFIX = "session:";
const OAUTH_STATE_PREFIX = "oauth_state:";
const DEFAULT_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const OAUTH_STATE_TTL = 15 * 60; // 15 minutes in seconds

export class RedisSessionStore {
  static getSessionKey(sessionId) {
    return `${SESSION_PREFIX}${sessionId}`;
  }

  static getOAuthStateKey(state) {
    return `${OAUTH_STATE_PREFIX}${state}`;
  }

  static async get(sessionId) {
    try {
      const key = this.getSessionKey(sessionId);
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      logger.error("Redis session get error", { sessionId, error: error.message });
      return null;
    }
  }

  static async set(sessionId, sessionData, ttl = DEFAULT_TTL) {
    try {
      const key = this.getSessionKey(sessionId);
      await redis.setex(key, ttl, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      logger.error("Redis session set error", { sessionId, error: error.message });
      return false;
    }
  }

  static async destroy(sessionId) {
    try {
      const key = this.getSessionKey(sessionId);
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error("Redis session destroy error", { sessionId, error: error.message });
      return false;
    }
  }

  static async touch(sessionId, ttl = DEFAULT_TTL) {
    try {
      const key = this.getSessionKey(sessionId);
      const exists = await redis.exists(key);
      if (exists) {
        await redis.expire(key, ttl);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Redis session touch error", { sessionId, error: error.message });
      return false;
    }
  }

  static async setOAuthState(state, data, ttl = OAUTH_STATE_TTL) {
    const maxRetries = 3;
    const baseDelay = 50;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const key = this.getOAuthStateKey(state);
            await redis.setex(key, ttl, JSON.stringify(data));
            
            // Verify the write
            const verified = await redis.get(key);
            if (verified) {
                return true;
            }
            
            logger.warn('OAuth state write verification failed, retrying', { 
                state, 
                attempt 
            });
        } catch (error) {
            logger.error("Redis OAuth state set error", { 
                state, 
                error: error.message,
                attempt 
            });
            
            if (attempt === maxRetries) {
                return false;
            }
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, baseDelay * attempt));
    }
    
    return false;
  }

  static async getOAuthState(state) {
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const key = this.getOAuthStateKey(state);
            const data = await redis.get(key);
            if (!data) return null;
            return JSON.parse(data);
        } catch (error) {
            logger.error("Redis OAuth state get error", { 
                state, 
                error: error.message,
                attempt 
            });
            
            if (attempt === maxRetries) {
                return null;
            }
            
            await new Promise(resolve => setTimeout(resolve, 50 * attempt));
        }
    }
    return null;
  }

  static async consumeOAuthState(state) {
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const key = this.getOAuthStateKey(state);
            const data = await redis.get(key);
            if (!data) return null;
            await redis.del(key);
            return JSON.parse(data);
        } catch (error) {
            logger.error("Redis OAuth state consume error", { 
                state, 
                error: error.message,
                attempt 
            });
            
            if (attempt === maxRetries) {
                return null;
            }
            
            await new Promise(resolve => setTimeout(resolve, 50 * attempt));
        }
    }
    return null;
  }

  static getOAuthCodeKey(code) {
    return `oauth_code:${code}`;
  }

  static async markCodeProcessed(code, sessionData, ttl = 600) {
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const key = this.getOAuthCodeKey(code);
            await redis.setex(key, ttl, JSON.stringify(sessionData));
            
            const verified = await redis.get(key);
            if (verified) {
                return true;
            }
            
            logger.warn('OAuth code cache write verification failed, retrying', { 
                code, 
                attempt 
            });
        } catch (error) {
            logger.error("Redis markCodeProcessed error", { 
                code, 
                error: error.message,
                attempt 
            });
            
            if (attempt === maxRetries) {
                return false;
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 50 * attempt));
    }
    
    return false;
  }

  static async getProcessedCode(code) {
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const key = this.getOAuthCodeKey(code);
            const data = await redis.get(key);
            if (!data) return null;
            return JSON.parse(data);
        } catch (error) {
            logger.error("Redis getProcessedCode error", { 
                code, 
                error: error.message,
                attempt 
            });
            
            if (attempt === maxRetries) {
                return null;
            }
            
            await new Promise(resolve => setTimeout(resolve, 50 * attempt));
        }
    }
    return null;
  }

  static async isCodeProcessed(code) {
    try {
      const key = this.getOAuthCodeKey(code);
      return await redis.exists(key) === 1;
    } catch (error) {
      logger.error("Redis isCodeProcessed error", { code, error: error.message });
      return false;
    }
  }
}

export default RedisSessionStore;