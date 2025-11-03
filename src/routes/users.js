const express = require('express');
const UserController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateQuery, schemas, querySchemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting
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

// Apply rate limiting to all routes
router.use(generalLimiter);

// Profile management routes
router.put('/profile',
  authenticate,
  validate(schemas.updateProfile),
  UserController.updateProfile
);

// Customer address management
router.post('/addresses',
  authenticate,
  authorize(['customer']),
  validate(schemas.address),
  UserController.addAddress
);

router.put('/addresses/:addressId',
  authenticate,
  authorize(['customer']),
  validate(schemas.address),
  UserController.updateAddress
);

router.delete('/addresses/:addressId',
  authenticate,
  authorize(['customer']),
  UserController.deleteAddress
);

// Staff management routes (Admin only)
router.get('/staff',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  validateQuery(querySchemas.pagination),
  UserController.getStaff
);

router.put('/staff/:staffId',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  UserController.updateStaff
);

router.delete('/staff/:staffId',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  UserController.deactivateStaff
);

module.exports = router;