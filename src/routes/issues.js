const express = require('express');
const IssueController = require('../controllers/issueController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
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

// ===== CUSTOMER ENDPOINTS =====

// Report a new issue (with optional image attachments)
router.post('/',
  upload.array('images', 5), // Allow up to 5 images
  handleMulterError,
  IssueController.reportIssue
);

// Get user's issues
router.get('/my-issues',
  IssueController.getMyIssues
);

// Get single issue details
router.get('/:issueId',
  IssueController.getIssue
);

// Add comment to issue
router.post('/:issueId/comments',
  IssueController.addComment
);

// ===== ADMIN ENDPOINTS =====

// Get all issues (Admin)
router.get('/admin/all',
  authorize(['super_admin', 'admin']),
  IssueController.getAllIssues
);

// Get issue statistics (Admin)
router.get('/admin/statistics',
  authorize(['super_admin', 'admin']),
  IssueController.getStatistics
);

// Update issue status (Admin)
router.patch('/:issueId/status',
  authorize(['super_admin', 'admin']),
  IssueController.updateIssueStatus
);

// Assign issue to staff (Admin)
router.patch('/:issueId/assign',
  authorize(['super_admin', 'admin']),
  IssueController.assignIssue
);

// Update issue priority (Admin)
router.patch('/:issueId/priority',
  authorize(['super_admin', 'admin']),
  IssueController.updatePriority
);

// Add internal note (Admin)
router.post('/:issueId/internal-notes',
  authorize(['super_admin', 'admin']),
  IssueController.addInternalNote
);

module.exports = router;
