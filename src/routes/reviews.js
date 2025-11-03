const express = require('express');
const ReviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateQuery, schemas, querySchemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for review endpoints
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

router.use(generalLimiter);

// ===== PUBLIC ROUTES =====

// Get reviews for menu item (public)
router.get('/menu-items/:itemId',
  ReviewController.getMenuItemReviews
);

// Get reviews for outlet (public)
router.get('/outlets/:outletId',
  ReviewController.getOutletReviews
);

// Get single review (public)
router.get('/:reviewId',
  ReviewController.getReview
);

// Get review statistics (public)
router.get('/stats/summary',
  ReviewController.getReviewStats
);

// Get top-rated food items (public)
router.get('/top-rated',
  ReviewController.getTopRatedFood
);

// Get outlet-specific top rated items (public)
router.get('/outlets/:outletId/top-rated',
  ReviewController.getOutletTopRated
);

// ===== PROTECTED ROUTES =====

router.use(authenticate);

// ===== CUSTOMER ROUTES =====

// Create review (Customers only)
router.post('/',
  authorize(['customer']),
  validate(schemas.review),
  ReviewController.createReview
);

// Get customer's reviews
router.get('/my/reviews',
  authorize(['customer']),
  ReviewController.getCustomerReviews
);

// Update review (Customer who created it)
router.put('/:reviewId',
  authorize(['customer']),
  validate(schemas.reviewUpdate),
  ReviewController.updateReview
);

// Delete review (Customer or Admin)
router.delete('/:reviewId',
  ReviewController.deleteReview
);

// Mark review as helpful
router.post('/:reviewId/helpful',
  ReviewController.markHelpful
);

// Report review
router.post('/:reviewId/report',
  validate(schemas.reportReview),
  ReviewController.reportReview
);

// ===== ADMIN ROUTES =====

// Respond to review (Admin only)
router.post('/:reviewId/respond',
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.reviewResponse),
  ReviewController.respondToReview
);

module.exports = router;