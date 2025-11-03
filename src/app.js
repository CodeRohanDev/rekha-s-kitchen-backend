const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const outletRoutes = require('./routes/outlets');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const couponRoutes = require('./routes/coupons');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');
const loyaltyRoutes = require('./routes/loyalty');
const referralRoutes = require('./routes/referral');
const deliveryRoutes = require('./routes/delivery');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const bannerRoutes = require('./routes/banners');
const favoriteRoutes = require('./routes/favorites');
const issueRoutes = require('./routes/issues');
const faqRoutes = require('./routes/faqs');

// Import middleware
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5050',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window per IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(globalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Rekha\'s Kitchen API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/outlets', outletRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/v1/referral', referralRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/issues', issueRoutes);
app.use('/api/v1/faqs', faqRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isDevelopment ? error.message : 'Internal server error',
      ...(isDevelopment && { stack: error.stack })
    }
  });
});

module.exports = app;