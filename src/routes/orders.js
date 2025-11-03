const express = require('express');
const OrderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateQuery, schemas, querySchemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for order endpoints
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

// All routes require authentication
router.use(authenticate);
router.use(generalLimiter);

// ===== CUSTOMER ROUTES =====

// Create new order (Customers only)
router.post('/',
  authorize(['customer']),
  validate(schemas.order),
  OrderController.createOrder
);

// Get customer's orders
router.get('/my-orders',
  authorize(['customer']),
  OrderController.getCustomerOrders
);

// ===== ADMIN/STAFF ROUTES =====

// Get all orders (Admin and Staff)
router.get('/',
  authorize(['super_admin', 'outlet_admin', 'kitchen_staff', 'delivery_boy']),
  validateQuery(querySchemas.orderFilters),
  OrderController.getAllOrders
);

// Get order statistics
router.get('/stats',
  authorize(['super_admin', 'outlet_admin']),
  OrderController.getOrderStats
);

// Get single order
router.get('/:orderId',
  OrderController.getOrder
);

// Update order status (Admin and Staff)
router.patch('/:orderId/status',
  authorize(['super_admin', 'outlet_admin', 'kitchen_staff', 'delivery_boy']),
  validate(schemas.updateOrderStatus),
  OrderController.updateOrderStatus
);

// Cancel order
router.post('/:orderId/cancel',
  validate(schemas.cancelOrder),
  OrderController.cancelOrder
);

// Assign delivery person (Admin only)
router.post('/:orderId/assign-delivery',
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.assignDelivery),
  OrderController.assignDelivery
);

module.exports = router;