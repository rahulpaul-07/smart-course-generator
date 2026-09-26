const crypto = require('crypto');

// A caller-supplied trace ID is echoed in a response header and written into
// every log line for the request, so only a short, plain token is accepted.
const TRACE_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

const requestTracing = (req, res, next) => {
  const supplied = req.headers['x-trace-id'];
  req.traceId = typeof supplied === 'string' && TRACE_ID_PATTERN.test(supplied) ? supplied : crypto.randomUUID();
  res.setHeader('x-trace-id', req.traceId);
  next();
};

module.exports = { requestTracing, TRACE_ID_PATTERN };
