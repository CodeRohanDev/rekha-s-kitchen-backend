const express = require('express');
const CartController = require('../controllers/cartController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
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
router.use(authorize(['customer']));
router.use(generalLimiter);

// Cart management
router.post('/', CartController.createCart);
router.get('/', CartController.getUserCarts);
router.get('/:cartId', CartController.getCart);
router.put('/:cartId', CartController.updateCart);
router.delete('/:cartId', CartController.deleteCart);

// Cart items
router.post('/:cartId/items', CartController.addItem);
router.put('/:cartId/items/:itemId', CartController.updateItem);
router.delete('/:cartId/items/:itemId', CartController.removeItem);
router.post('/:cartId/clear', CartController.clearCart);

// Cart actions
router.post('/:cartId/duplicate', CartController.duplicateCart);
router.post('/:cartId/calculate-price', CartController.calculatePrice);
router.post('/:cartId/checkout', CartController.checkoutCart);

module.exports = router;
