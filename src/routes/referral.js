const express = require('express');
const ReferralController = require('../controllers/referralController');
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
router.use(authenticate);

// ===== USER OPERATIONS =====

// Get referral account
router.get('/account',
  ReferralController.getReferralAccount
);

// Get my referral code
router.get('/my-code',
  ReferralController.getMyReferralCode
);

// Apply referral code
router.post('/apply',
  validate(schemas.applyReferralCode),
  ReferralController.applyReferralCode
);

// Get my referrals
router.get('/my-referrals',
  ReferralController.getMyReferrals
);

// Get my rewards
router.get('/rewards',
  ReferralController.getMyRewards
);

// Claim reward
router.post('/claim',
  validate(schemas.claimReferralReward),
  ReferralController.claimReward
);

// ===== ADMIN OPERATIONS =====

// Get program configuration
router.get('/program',
  authorize(['super_admin', 'admin']),
  ReferralController.getProgram
);

// Configure program
router.post('/program/configure',
  authorize(['super_admin']),
  validate(schemas.configureReferralProgram),
  ReferralController.configureProgram
);

// Get all accounts
router.get('/admin/accounts',
  authorize(['super_admin', 'admin']),
  ReferralController.getAllAccounts
);

// Get analytics
router.get('/admin/analytics',
  authorize(['super_admin', 'admin']),
  ReferralController.getAnalytics
);

module.exports = router;
