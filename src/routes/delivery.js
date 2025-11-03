const express = require('express');
const DeliveryController = require('../controllers/deliveryController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

router.use(generalLimiter);

// ===== PUBLIC ENDPOINTS =====

// Calculate delivery fee (no auth required)
router.post('/calculate-fee',
  validate(schemas.calculateDeliveryFee),
  DeliveryController.calculateDeliveryFee
);

// Get fee structure (no auth required)
router.get('/fee-structure',
  DeliveryController.getFeeStructure
);

// ===== ADMIN ENDPOINTS =====

router.use(authenticate);
router.use(authorize(['super_admin']));

// Delivery fee configuration
router.get('/admin/fee-config',
  DeliveryController.getFeeConfig
);

router.post('/admin/fee-config',
  validate(schemas.updateDeliveryFeeConfig),
  DeliveryController.updateFeeConfig
);

// Payout configuration
router.get('/admin/payout-config',
  DeliveryController.getPayoutConfig
);

router.post('/admin/payout-config',
  validate(schemas.updatePayoutConfig),
  DeliveryController.updatePayoutConfig
);

// Global payout schedule
router.get('/admin/payout-schedule/global',
  DeliveryController.getGlobalSchedule
);

router.post('/admin/payout-schedule/global',
  validate(schemas.updateGlobalSchedule),
  DeliveryController.updateGlobalSchedule
);

// Individual payout schedules
router.get('/admin/payout-schedule/individual',
  DeliveryController.getIndividualSchedules
);

router.post('/admin/payout-schedule/individual',
  validate(schemas.setIndividualSchedule),
  DeliveryController.setIndividualSchedule
);

router.delete('/admin/payout-schedule/individual/:scheduleId',
  DeliveryController.deleteIndividualSchedule
);

module.exports = router;
