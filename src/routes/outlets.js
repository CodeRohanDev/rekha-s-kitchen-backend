const express = require('express');
const OutletController = require('../controllers/outletController');
const { authenticate, authorize, authorizeOutlet } = require('../middleware/auth');
const { validate, validateQuery, schemas, querySchemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for outlet endpoints
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

// ===== PUBLIC ROUTES (No authentication required) =====

// Get nearby outlets based on location
router.get('/nearby',
  generalLimiter,
  OutletController.getNearbyOutlets
);

// Check serviceability for a location
router.post('/check-serviceability',
  generalLimiter,
  OutletController.checkServiceability
);

// Get all service areas
router.get('/service-areas',
  generalLimiter,
  OutletController.getServiceAreas
);

// Get public outlet details
router.get('/public/:outletId',
  generalLimiter,
  OutletController.getPublicOutletDetails
);

// ===== PROTECTED ROUTES (Authentication required) =====

router.use(authenticate);
router.use(generalLimiter);

// Create outlet (Super Admin only)
router.post('/',
  authorize(['super_admin']),
  validate(schemas.outlet),
  OutletController.createOutlet
);

// Get all outlets (Super Admin and Outlet Admin)
router.get('/',
  authorize(['super_admin', 'outlet_admin']),
  validateQuery(querySchemas.pagination),
  OutletController.getOutlets
);

// Get single outlet
router.get('/:outletId',
  authorize(['super_admin', 'outlet_admin', 'kitchen_staff', 'delivery_boy']),
  authorizeOutlet,
  OutletController.getOutlet
);

// Update outlet
router.put('/:outletId',
  authorize(['super_admin', 'outlet_admin']),
  authorizeOutlet,
  validate(schemas.outletUpdate),
  OutletController.updateOutlet
);

// Delete/Deactivate outlet (Super Admin only)
router.delete('/:outletId',
  authorize(['super_admin']),
  OutletController.deleteOutlet
);

// Get outlet statistics
router.get('/:outletId/stats',
  authorize(['super_admin', 'outlet_admin']),
  authorizeOutlet,
  OutletController.getOutletStats
);

// Get outlet staff
router.get('/:outletId/staff',
  authorize(['super_admin', 'outlet_admin']),
  authorizeOutlet,
  OutletController.getOutletStaff
);

module.exports = router;