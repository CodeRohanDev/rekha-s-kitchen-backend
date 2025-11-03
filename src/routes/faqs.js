const express = require('express');
const FAQController = require('../controllers/faqController');
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

// ===== PUBLIC/MOBILE ENDPOINTS =====

// Get active FAQs (grouped by category)
router.get('/',
  FAQController.getActiveFAQs
);

// Search FAQs
router.get('/search',
  FAQController.searchFAQs
);

// Get FAQ categories
router.get('/categories',
  FAQController.getCategories
);

// ===== ADMIN ENDPOINTS =====

// Get all FAQs (Admin - includes inactive)
router.get('/admin/all',
  authenticate,
  authorize(['super_admin']),
  FAQController.getAllFAQsAdmin
);

// Get single FAQ by ID
router.get('/admin/:faqId',
  authenticate,
  authorize(['super_admin']),
  FAQController.getFAQById
);

// Create FAQ
router.post('/admin',
  authenticate,
  authorize(['super_admin']),
  validate(schemas.faq),
  FAQController.createFAQ
);

// Update FAQ
router.put('/admin/:faqId',
  authenticate,
  authorize(['super_admin']),
  validate(schemas.faqUpdate),
  FAQController.updateFAQ
);

// Delete FAQ
router.delete('/admin/:faqId',
  authenticate,
  authorize(['super_admin']),
  FAQController.deleteFAQ
);

// Toggle FAQ status
router.patch('/admin/:faqId/toggle',
  authenticate,
  authorize(['super_admin']),
  validate(schemas.toggleFAQStatus),
  FAQController.toggleFAQStatus
);

// Reorder FAQs
router.post('/admin/reorder',
  authenticate,
  authorize(['super_admin']),
  validate(schemas.reorderFAQs),
  FAQController.reorderFAQs
);

module.exports = router;
