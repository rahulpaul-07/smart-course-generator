const winston = require("winston");

const isProduction = process.env.NODE_ENV === "production";

/**
 * Logs go to stdout/stderr, which is what the host (Render) collects and shows.
 * Production writes one JSON object per line; development gets a readable,
 * colourised line. The previous config wrote production logs only to files on
 * the instance's ephemeral disk, so access and 5xx logs never reached the
 * platform log stream and vanished on every deploy.
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "test" ? "error" : "info"),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    isProduction
      ? winston.format.json()
      : winston.format.combine(winston.format.colorize(), winston.format.simple())
  ),
  defaultMeta: { service: "courseai-api" },
  transports: [new winston.transports.Console({ stderrLevels: ["error"] })],
});

module.exports = logger;
