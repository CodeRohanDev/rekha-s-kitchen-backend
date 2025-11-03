const express = require('express');
const CouponController = require('../controllers/couponController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateQuery, schemas, querySchemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for coupon endpoints
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

// All routes require authentication
router.use(authenticate);
router.use(generalLimiter);

// ===== CUSTOMER ROUTES =====

// Validate coupon (Customers)
router.post('/validate',
  authorize(['customer']),
  validate(schemas.validateCoupon),
  CouponController.validateCoupon
);

// Get available coupons for customer
router.get('/available',
  authorize(['customer']),
  CouponController.getAvailableCoupons
);

// ===== ADMIN ROUTES =====

// Create coupon (Super Admin and Outlet Admin only)
router.post('/',
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.coupon),
  CouponController.createCoupon
);

// Get all coupons (Admin only)
router.get('/',
  authorize(['super_admin', 'outlet_admin']),
  validateQuery(querySchemas.pagination),
  CouponController.getCoupons
);

// Get single coupon (Admin only)
router.get('/:couponId',
  authorize(['super_admin', 'outlet_admin']),
  CouponController.getCoupon
);

// Update coupon (Admin only)
router.put('/:couponId',
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.couponUpdate),
  CouponController.updateCoupon
);

// Delete coupon (Admin only)
router.delete('/:couponId',
  authorize(['super_admin', 'outlet_admin']),
  CouponController.deleteCoupon
);

// Get coupon statistics (Admin only)
router.get('/:couponId/stats',
  authorize(['super_admin', 'outlet_admin']),
  CouponController.getCouponStats
);

module.exports = router;