const { dbHelpers, collections, admin } = require('../config/database');
const logger = require('../utils/logger');

class FavoriteController {
  // Add item to favorites
  static async addFavorite(req, res) {
    try {
      const { user } = req;
      const { item_id } = req.body;

      // Validate item exists
      const item = await dbHelpers.getDoc(collections.MENU_ITEMS, item_id);
      if (!item) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Menu item not found'
          }
        });
      }

      // Check if already in favorites
      const existingFavorites = await dbHelpers.getDocs(collections.FAVORITES, [
        { type: 'where', field: 'user_id', operator: '==', value: user.id },
        { type: 'where', field: 'item_id', operator: '==', value: item_id }
      ]);

      if (existingFavorites.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'ALREADY_EXISTS',
            message: 'Item already in favorites'
          }
        });
      }

      // Add to favorites
      const favoriteData = {
        user_id: user.id,
        item_id: item_id,
        item_name: item.name,
        outlet_id: item.outlet_id,
        category_id: item.category_id
      };

      const favorite = await dbHelpers.createDoc(collections.FAVORITES, favoriteData);

      logger.info('Item added to favorites', { userId: user.id, itemId: item_id });

      res.status(201).json({
        success: true,
        message: 'Item added to favorites',
        data: {
          favorite_id: favorite.id,
          item_id: favorite.item_id,
          added_at: favorite.created_at
        }
      });
    } catch (error) {
      logger.error('Add favorite error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add item to favorites'
        }
      });
    }
  }

  // Remove item from favorites
  static async removeFavorite(req, res) {
    try {
      const { user } = req;
      const { item_id } = req.params;

      // Find favorite
      const favorites = await dbHelpers.getDocs(collections.FAVORITES, [
        { type: 'where', field: 'user_id', operator: '==', value: user.id },
        { type: 'where', field: 'item_id', operator: '==', value: item_id }
      ]);

      if (favorites.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Item not found in favorites'
          }
        });
      }

      // Remove from favorites
      await dbHelpers.deleteDoc(collections.FAVORITES, favorites[0].id);

      logger.info('Item removed from favorites', { userId: user.id, itemId: item_id });

      res.json({
        success: true,
        message: 'Item removed from favorites'
      });
    } catch (error) {
      logger.error('Remove favorite error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to remove item from favorites'
        }
      });
    }
  }

  // Get all favorite items
  static async getFavorites(req, res) {
    try {
      const { user } = req;
      const { outlet_id, category_id, page = 1, limit = 20 } = req.query;

      // Build queries
      let queries = [
        { type: 'where', field: 'user_id', operator: '==', value: user.id }
      ];

      if (outlet_id) {
        queries.push({ type: 'where', field: 'outlet_id', operator: '==', value: outlet_id });
      }

      if (category_id) {
        queries.push({ type: 'where', field: 'category_id', operator: '==', value: category_id });
      }

      // Get paginated favorites
      const result = await dbHelpers.getPaginatedDocs(
        collections.FAVORITES,
        queries,
        parseInt(page),
        parseInt(limit)
      );

      // Get full item details for each favorite
      const favoritesWithDetails = await Promise.all(
        result.items.map(async (favorite) => {
          const item = await dbHelpers.getDoc(collections.MENU_ITEMS, favorite.item_id);
          
          if (!item) {
            return null; // Item might have been deleted
          }

          // Get outlet details
          const outlet = await dbHelpers.getDoc(collections.OUTLETS, item.outlet_id);

          // Get category details
          const category = await dbHelpers.getDoc(collections.MENU_CATEGORIES, item.category_id);

          return {
            favorite_id: favorite.id,
            added_at: favorite.created_at,
            item: {
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              image_url: item.image_url,
              is_available: item.is_available,
              is_active: item.is_active,
              category: category ? {
                id: category.id,
                name: category.name
              } : null,
              outlet: outlet ? {
                id: outlet.id,
                name: outlet.name,
                address: outlet.address
              } : null,
              dietary_info: item.dietary_info || {},
              customization_options: item.customization_options || []
            }
          };
        })
      );

      // Filter out null items (deleted items)
      const validFavorites = favoritesWithDetails.filter(fav => fav !== null);

      res.json({
        success: true,
        data: {
          favorites: validFavorites,
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Get favorites error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get favorites'
        }
      });
    }
  }

  // Check if item is in favorites
  static async checkFavorite(req, res) {
    try {
      const { user } = req;
      const { item_id } = req.params;

      const favorites = await dbHelpers.getDocs(collections.FAVORITES, [
        { type: 'where', field: 'user_id', operator: '==', value: user.id },
        { type: 'where', field: 'item_id', operator: '==', value: item_id }
      ]);

      res.json({
        success: true,
        data: {
          is_favorite: favorites.length > 0,
          favorite_id: favorites.length > 0 ? favorites[0].id : null
        }
      });
    } catch (error) {
      logger.error('Check favorite error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check favorite status'
        }
      });
    }
  }

  // Clear all favorites
  static async clearFavorites(req, res) {
    try {
      const { user } = req;

      // Get all user favorites
      const favorites = await dbHelpers.getDocs(collections.FAVORITES, [
        { type: 'where', field: 'user_id', operator: '==', value: user.id }
      ]);

      if (favorites.length === 0) {
        return res.json({
          success: true,
          message: 'No favorites to clear'
        });
      }

      // Delete all favorites in batch
      const operations = favorites.map(favorite => ({
        type: 'delete',
        collection: collections.FAVORITES,
        docId: favorite.id
      }));

      await dbHelpers.batchWrite(operations);

      logger.info('All favorites cleared', { userId: user.id, count: favorites.length });

      res.json({
        success: true,
        message: `${favorites.length} favorite(s) cleared successfully`
      });
    } catch (error) {
      logger.error('Clear favorites error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to clear favorites'
        }
      });
    }
  }

  // Get favorite items count
  static async getFavoritesCount(req, res) {
    try {
      const { user } = req;

      const favorites = await dbHelpers.getDocs(collections.FAVORITES, [
        { type: 'where', field: 'user_id', operator: '==', value: user.id }
      ]);

      res.json({
        success: true,
        data: {
          count: favorites.length
        }
      });
    } catch (error) {
      logger.error('Get favorites count error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get favorites count'
        }
      });
    }
  }
}

module.exports = FavoriteController;
