const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { setupKinde } = require('@kinde-oss/kinde-node-express');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
const { errorHandler } = require('./src/middleware/error');
const userRoutes = require('./src/routes/user.routes');

require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3001',
  credentials: true
}));

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Kinde Auth Configuration
const kindeConfig = {
  clientId: process.env.KINDE_CLIENT_ID,
  issuerBaseUrl: process.env.KINDE_DOMAIN,
  siteUrl: process.env.SITE_URL || 'http://localhost:5001',
  secret: process.env.KINDE_CLIENT_SECRET,
  redirectUrl: process.env.KINDE_REDIRECT_URL,
  scope: 'openid profile email offline',
  grantType: 'AUTHORIZATION_CODE',
  unAuthorisedUrl: '/unauthorised',
  postLogoutRedirectUrl: process.env.KINDE_POST_LOGOUT_REDIRECT_URL
};

setupKinde(kindeConfig, app);

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/users', userRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Server is healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global Error Handler
app.use(errorHandler);

// Handle Uncaught Exceptions
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle Unhandled Rejections
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

const PORT = process.env.PORT || 5001;

let server;
if (process.env.NODE_ENV !== 'lambda') {
  server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// For AWS Lambda
module.exports = app; 