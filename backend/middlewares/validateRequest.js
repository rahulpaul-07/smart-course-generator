const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const parsedBody = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Override req data with parsed/sanitized values
      if (parsedBody.body) req.body = parsedBody.body;
      
      // Safely override req.query which has a getter in Express
      if (parsedBody.query) {
        Object.defineProperty(req, 'query', {
          value: parsedBody.query,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
      
      if (parsedBody.params) {
        req.params = parsedBody.params;
      }

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
