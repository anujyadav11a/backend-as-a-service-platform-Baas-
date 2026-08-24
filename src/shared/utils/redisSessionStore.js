import { redis } from "../config/redis.config.js";
import { logger } from "./Logger.js";

const SESSION_PREFIX = "session:";
const OAUTH_STATE_PREFIX = "oauth_state:";
const DEFAULT_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const OAUTH_STATE_TTL = 10 * 60; // 10 minutes in seconds

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
    try {
      const key = this.getOAuthStateKey(state);
      await redis.setex(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      logger.error("Redis OAuth state set error", { state, error: error.message });
      return false;
    }
  }

  static async getOAuthState(state) {
    try {
      const key = this.getOAuthStateKey(state);
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      logger.error("Redis OAuth state get error", { state, error: error.message });
      return null;
    }
  }

  static async consumeOAuthState(state) {
    try {
      const key = this.getOAuthStateKey(state);
      const data = await redis.get(key);
      if (!data) return null;
      await redis.del(key);
      return JSON.parse(data);
    } catch (error) {
      logger.error("Redis OAuth state consume error", { state, error: error.message });
      return null;
    }
  }
}

export default RedisSessionStore;