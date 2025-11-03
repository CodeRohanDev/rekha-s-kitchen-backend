const express = require('express');
const NotificationController = require('../controllers/notificationController');
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

// ===== USER ROUTES =====

// Get user notifications
router.get('/',
  NotificationController.getUserNotifications
);

// Mark notification as read
router.patch('/:notificationId/read',
  NotificationController.markAsRead
);

// Mark all as read
router.post('/mark-all-read',
  NotificationController.markAllAsRead
);

// Delete notification
router.delete('/:notificationId',
  NotificationController.deleteNotification
);

// Get notification preferences
router.get('/preferences',
  NotificationController.getPreferences
);

// Update notification preferences
router.put('/preferences',
  validate(schemas.notificationPreferences),
  NotificationController.updatePreferences
);

// ===== ADMIN ROUTES =====

// Send notification (Admin)
router.post('/send',
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.sendNotification),
  NotificationController.sendNotification
);

// Send bulk notifications (Admin)
router.post('/send-bulk',
  authorize(['super_admin']),
  validate(schemas.sendBulkNotification),
  NotificationController.sendBulkNotifications
);

// Get notification statistics (Admin)
router.get('/stats',
  authorize(['super_admin', 'outlet_admin']),
  NotificationController.getStatistics
);

module.exports = router;