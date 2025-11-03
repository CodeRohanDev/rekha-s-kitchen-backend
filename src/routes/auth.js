const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

// Public routes
router.post('/register', 
  authLimiter,
  validate(schemas.register),
  AuthController.register
);

router.post('/login',
  authLimiter,
  validate(schemas.login),
  AuthController.login
);

router.post('/refresh-token',
  generalLimiter,
  AuthController.refreshToken
);

// Mobile OTP Authentication
router.post('/otp/send',
  authLimiter,
  validate(schemas.sendOTP),
  AuthController.sendOTP
);

router.post('/otp/verify',
  authLimiter,
  validate(schemas.verifyOTP),
  AuthController.verifyOTP
);

router.post('/otp/resend',
  authLimiter,
  validate(schemas.resendOTP),
  AuthController.resendOTP
);

// Protected routes
router.post('/logout',
  generalLimiter,
  authenticate,
  AuthController.logout
);

router.get('/profile',
  generalLimiter,
  authenticate,
  AuthController.getProfile
);

router.get('/me/outlets',
  generalLimiter,
  authenticate,
  AuthController.getUserOutlets
);

// Admin only routes
router.post('/staff',
  generalLimiter,
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.createStaff),
  AuthController.createStaff
);

// Development only - Create super admin (remove in production)
if (process.env.NODE_ENV === 'development') {
  router.post('/create-super-admin',
    generalLimiter,
    validate(schemas.createSuperAdmin),
    AuthController.createSuperAdmin
  );
}

module.exports = router;