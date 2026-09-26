const logger = require("../utils/logger");

const CODES_BY_STATUS = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  429: "RATE_LIMIT_EXCEEDED",
};

const notFound =(req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Services signal expected failures with `err.statusCode` (e.g. getOwnedLesson
// throws 403/404); a status already set on the response by the controller takes
// the same role. `err.status` is honoured only for errors marked `expose`
// (body-parser / http-errors), never for arbitrary upstream SDK errors -- a
// provider's 401 must not reach the client as a session-expiry 401.
function resolveStatus(err, res) {
  const fromError = Number(err.statusCode ?? (err.expose ? err.status : undefined));
  if (Number.isInteger(fromError) && fromError >= 400 && fromError < 600) return fromError;
  return res.statusCode >= 400 ? res.statusCode : 500;
}

const errorHandler = (err, req, res, next) => {
  let statusCode = resolveStatus(err, res);
  let message = err.message;
  let code = CODES_BY_STATUS[statusCode] || (statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR");

  // MongoDB Cast Error
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
    code = "NOT_FOUND";
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
    code = "DUPLICATE_RESOURCE";
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
    code = "VALIDATION_ERROR";
  }

  // Only 4xx messages are deliberate and user-facing. Server-side failures
  // carry driver/provider text that must not reach the client in production
  // (the same rule as safeErrorMessage in courseAiController).
  if (statusCode >= 500 && process.env.NODE_ENV === "production") {
    message = "An unexpected error occurred. Please try again later.";
  }

  // Client errors (404 for a favicon, a failed login) are expected traffic;
  // logging them as errors with a stack buried real failures in noise.
  const line = `[TraceID: ${req.traceId}] ${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`;
  if (statusCode >= 500) {
    logger.error(line);
    if (process.env.NODE_ENV !== "production") logger.error(`[TraceID: ${req.traceId}] ${err.stack}`);
  } else if (process.env.NODE_ENV !== "test") {
    logger.warn(line);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      traceId: req.traceId,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    }
  });
};

module.exports = { notFound, errorHandler };
