function errorHandler(error, _req, res, _next) {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).json({ error: "Invalid identifier" });
  }

  if (error.name === "ValidationError") {
    const firstError = Object.values(error.errors)[0];
    return res.status(400).json({ error: firstError?.message || "Invalid request" });
  }

  if (error.code === 11000) {
    return res.status(409).json({ error: "A record with that value already exists" });
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  return res.status(statusCode).json({ error: message });
}

module.exports = { errorHandler };
