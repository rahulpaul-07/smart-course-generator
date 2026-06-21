const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

// Load environment variables
dotenv.config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const routes = require("./routes/index");

const morgan = require("morgan");
const { requestTracing } = require("./middlewares/tracing");
const { apiLimiter } = require("./middlewares/rateLimit");
const logger = require("./utils/logger");

const app = express();

// Security headers
app.use(helmet());

app.use(requestTracing);

morgan.token("trace-id", (req) => req.traceId);
app.use(morgan(":remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length] \":referrer\" \":user-agent\" [TraceID: :trace-id]", {
  stream: { write: message => logger.info(message.trim()) }
}));

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.NODE_ENV !== "production" ? "http://localhost:5173" : null
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// Sanitize data
app.use(mongoSanitize());
app.use(xss());

// Apply global rate limiting
app.use("/api", apiLimiter);

const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./docs/swagger");

// Base Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Unified Course Platform API is running...",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend health check successful",
  });
});

app.get("/api/health/liveness", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

app.get("/api/health/readiness", async (req, res) => {
  const mongoose = require("mongoose");
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: "READY", database: "connected" });
  } else {
    res.status(503).json({ status: "NOT_READY", database: "disconnected" });
  }
});

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await connectDB();
    } else {
      console.log("No MONGO_URI provided. Skipping DB connection for demo mode.");
    }
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log("HTTP server closed.");
        if (process.env.MONGO_URI) {
          const mongoose = require("mongoose");
          await mongoose.connection.close();
          console.log("MongoDB connection closed.");
        }
        process.exit(0);
      });

      // Force close after 10s
      setTimeout(() => {
        console.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Global error handlers to prevent silent crashes
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = app;
