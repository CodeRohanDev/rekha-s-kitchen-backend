const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Add item to favorites
router.post('/', FavoriteController.addFavorite);

// Get all favorite items
router.get('/', FavoriteController.getFavorites);

// Get favorites count
router.get('/count', FavoriteController.getFavoritesCount);

// Check if item is favorite
router.get('/check/:item_id', FavoriteController.checkFavorite);

// Remove item from favorites
router.delete('/:item_id', FavoriteController.removeFavorite);

// Clear all favorites
router.delete('/', FavoriteController.clearFavorites);

module.exports = router;
