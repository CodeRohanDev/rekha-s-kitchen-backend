const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All analytics routes require super_admin authentication
router.use(authenticate);
router.use(authorize(['super_admin']));

// Dashboard Overview
router.get('/dashboard', AnalyticsController.getDashboardOverview);

// Active Users Analytics
router.get('/active-users', AnalyticsController.getActiveUsers);
router.get('/active-users/trend', AnalyticsController.getActiveUsersTrend);

// Customer Order Behavior Analytics
router.get('/customer-behavior', AnalyticsController.getCustomerOrderBehavior);
router.get('/customer-behavior/:userId', AnalyticsController.getCustomerBehaviorById);
router.get('/customer-cohorts', AnalyticsController.getCustomerCohorts);

// Revenue Analytics
router.get('/revenue/trends', AnalyticsController.getRevenueTrends);

// Popular Items Analytics
router.get('/popular-items', AnalyticsController.getPopularItems);

module.exports = router;
