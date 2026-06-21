const logger = require("../utils/logger");

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let code = "INTERNAL_SERVER_ERROR";

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

  logger.error(`[TraceID: ${req.traceId}] ${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (process.env.NODE_ENV !== "production") {
    logger.error(`[TraceID: ${req.traceId}] ${err.stack}`);
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
