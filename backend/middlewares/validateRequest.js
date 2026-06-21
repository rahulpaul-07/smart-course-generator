const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const parsedBody = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Override req data with parsed/sanitized values
      req.body = parsedBody.body || req.body;
      req.query = parsedBody.query || req.query;
      req.params = parsedBody.params || req.params;

      next();
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: {
            message: "Validation Error",
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
      }
      next(error);
    }
  };
};

module.exports = { validateRequest };
