const logger = require('../utils/logger.cjs');

// ── Request logger middleware ─────────────────────────
// Runs on every request before it hits the route handler
// Logs: method, path, status, response time, IP
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  // When the response finishes, log the result
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    // Choose log level based on status code
    // 5xx errors → error level
    // 4xx errors → warn level  
    // Everything else → info level
    if (statusCode >= 500) {
      logger.error(`${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip}`);
    } else if (statusCode >= 400) {
      logger.warn(`${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip}`);
    } else {
      logger.info(`${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip}`);
    }
  });

  next(); // pass to next middleware
};

module.exports = { requestLogger };
