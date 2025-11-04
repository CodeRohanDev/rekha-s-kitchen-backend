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
  validate(schemas.register),
  AuthController.register
);

router.post('/login',
  validate(schemas.login),
  AuthController.login
);

router.post('/refresh-token',
  AuthController.refreshToken
);

// Mobile OTP Authentication
router.post('/otp/send',
  validate(schemas.sendOTP),
  AuthController.sendOTP
);

router.post('/otp/verify',
  validate(schemas.verifyOTP),
  AuthController.verifyOTP
);

router.post('/otp/resend',
  validate(schemas.resendOTP),
  AuthController.resendOTP
);

// Protected routes
router.post('/logout',
  authenticate,
  AuthController.logout
);

router.get('/profile',
  authenticate,
  AuthController.getProfile
);

router.get('/me/outlets',
  authenticate,
  AuthController.getUserOutlets
);

// Admin only routes
router.post('/staff',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.createStaff),
  AuthController.createStaff
);

// Development only - Create super admin (remove in production)
if (process.env.NODE_ENV === 'development') {
  router.post('/create-super-admin',
    validate(schemas.createSuperAdmin),
    AuthController.createSuperAdmin
  );
}

module.exports = router;