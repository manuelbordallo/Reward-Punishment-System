const express = require('express');
require('dotenv').config();

// Import routes
const apiRoutes = require('../routes');

// Import middleware
const { 
  createCorsMiddleware, 
  globalErrorHandler, 
  notFoundHandler,
  timeoutHandler
} = require('../middleware');
const { logger, requestLogger } = require('../utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Request timeout middleware (30 seconds)
app.use(timeoutHandler(30000));

// Request logging middleware
app.use(requestLogger);

// CORS middleware with mobile client support
app.use(createCorsMiddleware());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Reward-Punishment API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  console.log(`API endpoints available at: http://localhost:${PORT}/api`);
});

module.exports = app;
// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const serveFrontend = require('../serve-frontend');
  serveFrontend(app);
}
