const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const config = require('./config/index.cjs');
const logger = require('./utils/logger.cjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Routes
const authRoutes = require('./routes/authRoutes.cjs');
const membersRoutes = require('./routes/membersRoutes.cjs');
const packagesRoutes = require('./routes/packagesRoutes.cjs');
const paymentsRoutes = require('./routes/paymentsRoutes.cjs');
const renewalsRoutes = require('./routes/renewalsRoutes.cjs');
const dashboardRoutes = require('./routes/dashboardRoutes.cjs');

const app = express();

const allowedOrigins = config.frontend.url ? config.frontend.url.split(',') : ['http://localhost:5173', 'http://localhost:8080'];

// Middleware
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(compression());
app.use(morgan('combined', { stream: { write: (m) => logger.info(m.trim()) } }));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { success: false, message: 'Too many requests' },
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/renewals', renewalsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ success: false, message: 'Internal error' });
});

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(() => { prisma.$disconnect(); process.exit(0); });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...');
  server.close(() => { prisma.$disconnect(); process.exit(0); });
});
