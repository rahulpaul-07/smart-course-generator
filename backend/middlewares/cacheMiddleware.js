const NodeCache = require("node-cache");

// useClones is off because node-cache's deep clone walks class instances by
// assignment. Handed an array of Mongoose documents, that fired schema setters
// on half-built documents and threw a CastError -- GET /collab/templates
// returned 500 as soon as a single public course existed. Bodies are
// snapshotted to plain JSON on the way in instead, which is also exactly what
// the client receives.
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320, useClones: false });

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
        // Only successful responses are cached; an error must not be replayed
        // to every caller for the next minute.
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(key, JSON.parse(JSON.stringify(body)), durationSec);
        }
        // Call the original res.json
        originalJson.call(res, body);
      };
      next();
    }
  };
};

module.exports = { cacheMiddleware, cache };
