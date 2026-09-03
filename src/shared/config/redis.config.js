import Redis from "ioredis";
import config from './env.js';

const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        if (times > 3) {
            return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
    }
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});

export { redis };