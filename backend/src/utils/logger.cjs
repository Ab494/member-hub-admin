const path = require('path');
const fs = require('fs');
const { createLogger, format, transports } = require('winston');

// ── Create logs directory if it doesn't exist ─────────
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ── Log format for files (JSON) ───────────────────────
// JSON format is machine-readable — easy to search and filter
// Example: {"level":"error","message":"DB connection failed","timestamp":"2026-04-09T...","service":"memberhub-backend"}
const fileFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),  // include stack trace on errors
  format.json()
);

// ── Log format for console (human-readable) ───────────
// Colorized and easy to read during development
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp, stack }) => {
    // If there's a stack trace (error), show it
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`;
  })
);

// ── Create the logger ─────────────────────────────────
const logger = createLogger({
  // Read log level from env — 'debug' locally, 'warn' in production
  level: process.env.LOG_LEVEL || 'info',

  // Add service name to every log entry
  defaultMeta: { service: 'memberhub-backend' },

  transports: [
    // Console — always on, format depends on environment
    new transports.Console({
      format: process.env.NODE_ENV === 'production' ? fileFormat : consoleFormat,
    }),

    // Combined log — every level (info, warn, error)
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024,  // 10MB max per file
      maxFiles: 5,                 // keep last 5 files then rotate
    }),

    // Error log — only errors (easier to scan for problems)
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
