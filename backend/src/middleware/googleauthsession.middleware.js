import crypto from "crypto";
import { sessionCookieOptions } from "../shared/utils/cookieUtils.js";
import { RedisSessionStore } from "../shared/utils/redisSessionStore.js";

function generateSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

export const sessionMiddleware = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId || generateSessionId();

    if (!req.cookies.sessionId) {
      res.cookie("sessionId", sessionId, sessionCookieOptions);
    }

    let sessionData = await RedisSessionStore.get(sessionId);

    if (!sessionData) {
      sessionData = {};
      await RedisSessionStore.set(sessionId, sessionData);
    }

    req.session = sessionData;
    req.sessionId = sessionId;

    next();
  } catch (error) {
    req.session = {};
    req.sessionId = generateSessionId();
    next();
  }
};

export const setOAuthState = async (state, data) => {
  return RedisSessionStore.setOAuthState(state, data);
};

export const getOAuthState = async (state) => {
  return RedisSessionStore.getOAuthState(state);
};

export const consumeOAuthState = async (state) => {
  return RedisSessionStore.consumeOAuthState(state);
};

export { generateSessionId };