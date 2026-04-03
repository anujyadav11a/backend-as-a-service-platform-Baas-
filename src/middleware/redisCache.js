// redis key generated accordingly to type of request
// for auth based request - "auth:userId"
// for resource based request - "resource:resourceId"
// for query based request - "query:queryParams"
// for fallback - "fallback:originalUrl"


import { redis } from "../config/redis.config.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";

export const cacheMiddleware = (prefix) => asyncHandler(async (req, res, next) => {
    let key;

    if (req.user) {
      // 🔐 Auth-based key
      key = `${prefix}:${req.user.id}`;
    } else if (req.params.id) {
      // 📦 Resource-based key
      key = `${prefix}:${req.params.id}`;
    } else if (Object.keys(req.query).length > 0) {
      // 🔍 Query-based key
      key = `${prefix}:${JSON.stringify(req.query)}`;
    } else {
      // 🌐 Fallback
      key = `${prefix}:${req.originalUrl}`;
    }

    try {
        const cacheData = await redis.get(key);

        if (cacheData) {
            const responseData = JSON.parse(cacheData);
            return res
                .status(200)
                .json(new ApiResponse(200, responseData, "Data from cache"));
        }

        console.log("Data not found in cache, proceeding to controller");

        // override response method
        res.sendResponse = async (data) => {
            try {
                await redis.set(key, JSON.stringify(data), "EX", 3600);
                return res
                    .status(200)
                    .json(new ApiResponse(200, data, "Data from controller"));
            } catch (error) {
                console.error("Redis set error:", error);
                // If Redis fails, still send response
                return res
                    .status(200)
                    .json(new ApiResponse(200, data, "Data from controller"));
            }
        };

        next();
    } catch (error) {
        console.error("Redis get error:", error);
        // If Redis fails, skip cache and proceed to controller
        res.sendResponse = async (data) => {
            return res
                .status(200)
                .json(new ApiResponse(200, data, "Data from controller"));
        };
        next();
    }
});





