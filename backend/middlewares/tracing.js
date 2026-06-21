const crypto = require('crypto');

const requestTracing = (req, res, next) => {
  req.traceId = req.headers['x-trace-id'] || crypto.randomUUID();
  res.setHeader('x-trace-id', req.traceId);
  next();
};

module.exports = { requestTracing };
