const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Health check handler ──────────────────────────────
// Called by Render every 30 seconds to verify the service is alive
// Also useful for you to manually check the server state
const healthCheck = async (req, res) => {
  const startTime = Date.now();

  // Check database connectivity
  let dbStatus = 'healthy';
  let dbResponseTime = null;

  try {
    const dbStart = Date.now();
    // Run a simple query — if this works, DB is connected
    await prisma.$queryRaw`SELECT 1`;
    dbResponseTime = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'unhealthy';
  }

  // Get memory usage
  const memoryUsage = process.memoryUsage();

  // Get uptime in human-readable format
  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  const health = {
    status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: {
        status: dbStatus,
        responseTime: dbResponseTime ? `${dbResponseTime}ms` : null,
      },
    },
    memory: {
      // Convert bytes to MB for readability
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    },
    responseTime: `${Date.now() - startTime}ms`,
  };

  // Return 200 if healthy, 503 if degraded
  // Render uses this status code to decide if the service needs restarting
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
};

module.exports = { healthCheck };
