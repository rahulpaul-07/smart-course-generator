const NodeCache = require("node-cache");

// Standard cache for 5 minutes
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

const cacheMiddleware = (durationSec) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    } else {
      // Hijack the send response to store in cache
      const originalJson = res.json;
      res.json = (body) => {
        // Cache the response body
        cache.set(key, body, durationSec);
        // Call the original res.json
        originalJson.call(res, body);
      };
      next();
    }
  };
};

module.exports = { cacheMiddleware };
