const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logsRouter = require('./server/routes/logs');
const requestLogger = require('./server/middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow React app to work properly
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (before rate limiting to log all attempts)
app.use(requestLogger);

// Rate limiting to prevent DDoS
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator to use our extracted IP
  keyGenerator: (req) => {
    return req.requestMetadata?.ip || req.ip || 'unknown';
  },
  // Log when rate limit is hit
  onLimitReached: (req, res, options) => {
    console.warn(`🚨 RATE LIMIT HIT: IP ${req.requestMetadata?.ip || req.ip} exceeded ${options.max} requests per ${options.windowMs}ms`);
  },
});

// Apply rate limiting to all routes except static files
app.use((req, res, next) => {
  // Skip rate limiting for static assets
  if (req.path.startsWith('/static/') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  limiter(req, res, next);
});

// API routes
app.use('/api', logsRouter);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve React app for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

