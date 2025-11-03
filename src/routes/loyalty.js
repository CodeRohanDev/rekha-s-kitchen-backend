const express = require('express');
const LoyaltyController = require('../controllers/loyaltyController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateQuery, schemas, querySchemas } = require('../middleware/validation');
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

// ===== PROGRAM MANAGEMENT =====

// Get all programs (Public for customers to see options)
router.get('/programs',
  LoyaltyController.getPrograms
);

// Configure program (Admin only)
router.post('/programs/configure',
  authorize(['super_admin']),
  validate(schemas.loyaltyProgramConfig),
  LoyaltyController.configureProgramAdmin
);

// Toggle program (Admin only)
router.patch('/programs/:programId/toggle',
  authorize(['super_admin']),
  validate(schemas.toggleProgram),
  LoyaltyController.toggleProgram
);

// ===== USER ACCOUNT =====

// Get loyalty account
router.get('/account',
  LoyaltyController.getAccount
);

// ===== POINTS PROGRAM - REMOVED =====
// Points program has been removed. Only milestone program is available.

// ===== MILESTONE PROGRAM =====

// Get milestone progress
router.get('/milestone/progress',
  LoyaltyController.getMilestoneProgress
);

// Get available rewards
router.get('/milestone/rewards',
  LoyaltyController.getMilestoneRewards
);

// Claim reward
router.post('/milestone/claim',
  validate(schemas.claimMilestoneReward),
  LoyaltyController.claimMilestoneReward
);

// ===== TRANSACTIONS =====

// Get transactions
router.get('/transactions',
  LoyaltyController.getTransactions
);

// ===== ADMIN MANAGEMENT =====

// Get all users' loyalty accounts (Admin)
router.get('/admin/accounts',
  authorize(['super_admin', 'admin']),
  LoyaltyController.getAllUserAccounts
);

// Get specific user's loyalty account (Admin)
router.get('/admin/accounts/:userId',
  authorize(['super_admin', 'admin']),
  LoyaltyController.getUserAccount
);

// Manually enroll user in loyalty program (Admin)
router.post('/admin/accounts/:userId/enroll',
  authorize(['super_admin', 'admin']),
  validate(schemas.enrollUser),
  LoyaltyController.enrollUser
);

// Reset or freeze user's account (Admin)
router.post('/admin/accounts/:userId/manage',
  authorize(['super_admin', 'admin']),
  validate(schemas.manageUserAccount),
  LoyaltyController.manageUserAccount
);

// View all loyalty transactions across users (Admin)
router.get('/admin/transactions',
  authorize(['super_admin', 'admin']),
  LoyaltyController.getAllTransactions
);

// Generate loyalty reports and analytics (Admin)
router.get('/admin/analytics',
  authorize(['super_admin', 'admin']),
  LoyaltyController.getAnalytics
);

module.exports = router;