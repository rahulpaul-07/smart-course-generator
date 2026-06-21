const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CourseAI Pro API",
      version: "1.0.0",
      description: "API documentation for the Unified Course Platform",
    },
    servers: [
      {
        url: "/api",
        description: "API Base URL",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./routes/courses/*.js", "./controllers/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
