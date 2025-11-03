const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');
const StorageUtils = require('../utils/storage');

class MenuController {
  // ===== MENU CATEGORIES =====

  // Create menu category
  static async createCategory(req, res) {
    try {
      const { name, description, display_order, is_active = true, outlet_id } = req.body;
      const { user: currentUser } = req;

      // Validate outlet_id is provided
      if (!outlet_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'outlet_id is required'
          }
        });
      }

      // Verify outlet exists
      const outlet = await dbHelpers.getDoc(collections.OUTLETS, outlet_id);
      if (!outlet) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Outlet not found'
          }
        });
      }

      // Check if category with same name exists for this outlet
      const existingCategories = await dbHelpers.getDocs(collections.MENU_CATEGORIES, [
        { type: 'where', field: 'name', operator: '==', value: name },
        { type: 'where', field: 'outlet_id', operator: '==', value: outlet_id }
      ]);

      if (existingCategories.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Category with this name already exists for this outlet'
          }
        });
      }

      // Create category
      const categoryData = {
        name,
        description,
        display_order: display_order || 0,
        is_active,
        outlet_id,
        created_by: currentUser.id,
        item_count: 0
      };

      const category = await dbHelpers.createDoc(collections.MENU_CATEGORIES, categoryData);

      logger.info('Menu category created successfully', { 
        categoryId: category.id, 
        name,
        outletId: outlet_id,
        createdBy: currentUser.id 
      });

      res.status(201).json({
        success: true,
        message: 'Menu category created successfully',
        data: {
          category_id: category.id,
          name: category.name,
          description: category.description,
          display_order: category.display_order,
          outlet_id: category.outlet_id,
          is_active: category.is_active
        }
      });
    } catch (error) {
      logger.error('Category creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create category'
        }
      });
    }
  }

  // Get all categories
  static async getCategories(req, res) {
    try {
      const { is_active, include_items = false, outlet_id } = req.query;

      let queries = [];
      
      if (is_active !== undefined) {
        queries.push({ type: 'where', field: 'is_active', operator: '==', value: is_active === 'true' });
      }

      if (outlet_id) {
        queries.push({ type: 'where', field: 'outlet_id', operator: '==', value: outlet_id });
      }

      const categories = await dbHelpers.getDocs(
        collections.MENU_CATEGORIES,
        queries,
        { field: 'display_order', direction: 'asc' }
      );

      // Include menu items if requested
      if (include_items === 'true') {
        // Optimize: Fetch all items at once
        let itemQueries = [
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ];

        if (outlet_id) {
          itemQueries.push({ type: 'where', field: 'outlet_id', operator: '==', value: outlet_id });
        }

        const allItems = await dbHelpers.getDocs(collections.MENU_ITEMS, itemQueries);

        // Group items by category
        const itemsByCategory = {};
        allItems.forEach(item => {
          if (!itemsByCategory[item.category_id]) {
            itemsByCategory[item.category_id] = [];
          }
          itemsByCategory[item.category_id].push(item);
        });

        // Assign items to categories
        categories.forEach(category => {
          category.items = itemsByCategory[category.id] || [];
        });
      }

      res.json({
        success: true,
        data: { 
          categories,
          outlet_id: outlet_id || 'all'
        }
      });
    } catch (error) {
      logger.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get categories'
        }
      });
    }
  }

  // Get single category
  static async getCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { include_items = false } = req.query;

      const category = await dbHelpers.getDoc(collections.MENU_CATEGORIES, categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        });
      }

      // Include menu items if requested
      if (include_items === 'true') {
        const items = await dbHelpers.getDocs(collections.MENU_ITEMS, [
          { type: 'where', field: 'category_id', operator: '==', value: categoryId },
          { type: 'where', field: 'outlet_id', operator: '==', value: category.outlet_id },
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);
        category.items = items;
      }

      res.json({
        success: true,
        data: { category }
      });
    } catch (error) {
      logger.error('Get category error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get category'
        }
      });
    }
  }

  // Update category
  static async updateCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { user: currentUser } = req;
      const updateData = req.body;

      const category = await dbHelpers.getDoc(collections.MENU_CATEGORIES, categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        });
      }

      // Check for name conflicts if name is being updated
      if (updateData.name && updateData.name !== category.name) {
        const existingCategories = await dbHelpers.getDocs(collections.MENU_CATEGORIES, [
          { type: 'where', field: 'name', operator: '==', value: updateData.name },
          { type: 'where', field: 'outlet_id', operator: '==', value: category.outlet_id }
        ]);

        if (existingCategories.length > 0) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'CONFLICT',
              message: 'Category with this name already exists for this outlet'
            }
          });
        }
      }

      const updatedCategory = await dbHelpers.updateDoc(collections.MENU_CATEGORIES, categoryId, {
        ...updateData,
        updated_by: currentUser.id
      });

      logger.info('Category updated successfully', { 
        categoryId, 
        updatedBy: currentUser.id 
      });

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category: updatedCategory }
      });
    } catch (error) {
      logger.error('Update category error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update category'
        }
      });
    }
  }

  // Delete category
  static async deleteCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { user: currentUser } = req;

      const category = await dbHelpers.getDoc(collections.MENU_CATEGORIES, categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        });
      }

      // Check if category has active menu items
      const activeItems = await dbHelpers.getDocs(collections.MENU_ITEMS, [
        { type: 'where', field: 'category_id', operator: '==', value: categoryId },
        { type: 'where', field: 'outlet_id', operator: '==', value: category.outlet_id },
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);

      if (activeItems.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cannot delete category with active menu items'
          }
        });
      }

      // Soft delete - deactivate instead of actual deletion
      await dbHelpers.updateDoc(collections.MENU_CATEGORIES, categoryId, {
        is_active: false,
        deleted_by: currentUser.id,
        deleted_at: new Date()
      });

      logger.info('Category deleted successfully', { 
        categoryId, 
        deletedBy: currentUser.id 
      });

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      logger.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete category'
        }
      });
    }
  }

  // ===== MENU ITEMS =====

  // Upload menu item image only
  static async uploadMenuItemImage(req, res) {
    try {
      const { user: currentUser } = req;

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No image file provided'
          }
        });
      }

      // Validate file
      const validation = StorageUtils.validateImageFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE',
            message: validation.error
          }
        });
      }

      // Generate filename
      const fileExtension = StorageUtils.getFileExtension(req.file.mimetype);
      const fileName = `menu-item-${Date.now()}.${fileExtension}`;

      // Upload to Cloudinary
      const imageUrl = await StorageUtils.uploadFile(
        req.file.buffer,
        fileName,
        'menu-items',
        req.file.mimetype
      );

      logger.info('Menu item image uploaded successfully', {
        fileName,
        imageUrl,
        uploadedBy: currentUser.id
      });

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          image_url: imageUrl,
          file_name: fileName,
          file_size: req.file.size,
          mime_type: req.file.mimetype
        }
      });
    } catch (error) {
      logger.error('Upload menu item image error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Failed to upload image'
        }
      });
    }
  }

  // Upload image AND create menu item in one step
  static async uploadAndCreateMenuItem(req, res) {
    try {
      const { user: currentUser } = req;

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No image file provided'
          }
        });
      }

      // Validate file
      const validation = StorageUtils.validateImageFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE',
            message: validation.error
          }
        });
      }

      // Get menu item data from form fields
      const { 
        category_id, 
        name, 
        description, 
        price, 
        is_vegetarian = false,
        is_vegan = false,
        is_gluten_free = false,
        spice_level = 'mild',
        preparation_time,
        ingredients,
        nutritional_info,
        is_available = true,
        min_order_quantity = 1
      } = req.body;

      // Validate required fields
      if (!category_id || !name || !price) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'category_id, name, and price are required'
          }
        });
      }

      // Verify category exists
      const category = await dbHelpers.getDoc(collections.MENU_CATEGORIES, category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        });
      }

      // Get outlet_id from category
      const outlet_id = category.outlet_id;

      // Check if item with same name exists
      const existingItems = await dbHelpers.getDocs(collections.MENU_ITEMS, [
        { type: 'where', field: 'category_id', operator: '==', value: category_id },
        { type: 'where', field: 'outlet_id', operator: '==', value: outlet_id },
        { type: 'where', field: 'name', operator: '==', value: name }
      ]);

      if (existingItems.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Menu item with this name already exists in this category'
          }
        });
      }

      // Generate filename
      const fileExtension = StorageUtils.getFileExtension(req.file.mimetype);
      const fileName = `menu-item-${Date.now()}.${fileExtension}`;

      // Upload to Cloudinary
      const imageUrl = await StorageUtils.uploadFile(
        req.file.buffer,
        fileName,
        'menu-items',
        req.file.mimetype
      );

      // Parse JSON fields if they're strings
      const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : (ingredients || []);
      const parsedNutritionalInfo = typeof nutritional_info === 'string' ? JSON.parse(nutritional_info) : (nutritional_info || {});

      // Create menu item
      const itemData = {
        category_id,
        outlet_id,
        name,
        description: description || null,
        price: parseFloat(price),
        is_vegetarian: is_vegetarian === 'true' || is_vegetarian === true,
        is_vegan: is_vegan === 'true' || is_vegan === true,
        is_gluten_free: is_gluten_free === 'true' || is_gluten_free === true,
        spice_level,
        preparation_time: preparation_time ? parseInt(preparation_time) : null,
        ingredients: parsedIngredients,
        nutritional_info: parsedNutritionalInfo,
        image_url: imageUrl,
        is_available: is_available === 'true' || is_available === true,
        is_active: true,
        min_order_quantity: parseInt(min_order_quantity) || 1,
        created_by: currentUser.id,
        total_orders: 0,
        average_rating: 0,
        review_count: 0
      };

      const item = await dbHelpers.createDoc(collections.MENU_ITEMS, itemData);

      // Update category item count
      await dbHelpers.updateDoc(collections.MENU_CATEGORIES, category_id, {
        item_count: (category.item_count || 0) + 1
      });

      logger.info('Menu item created successfully with image', { 
        itemId: item.id, 
        name, 
        imageUrl,
        categoryId: category_id,
        outletId: outlet_id,
        createdBy: currentUser.id 
      });

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: {
          item_id: item.id,
          item: { id: item.id, ...itemData }
        }
      });
    } catch (error) {
      logger.error('Upload and create menu item error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create menu item'
        }
      });
    }
  }

  // Delete menu item image from storage
  static async deleteMenuItemImage(req, res) {
    try {
      const { user: currentUser } = req;
      const { image_url } = req.body;

      if (!image_url) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_URL',
            message: 'Image URL is required'
          }
        });
      }

      // Verify it's a Cloudinary URL
      if (!image_url.includes('cloudinary.com')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Only Cloudinary URLs can be deleted'
          }
        });
      }

      // Delete from storage
      const deleted = await StorageUtils.deleteFile(image_url);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Image not found in storage'
          }
        });
      }

      logger.info('Menu item image deleted from storage', { image_url, deletedBy: currentUser.id });

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      logger.error('Delete menu item image error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete image'
        }
      });
    }
  }

  // Create menu item
  static async createMenuItem(req, res) {
    try {
      const { 
        category_id, 
        name, 
        description, 
        price, 
        is_vegetarian = false,
        is_vegan = false,
        is_gluten_free = false,
        spice_level = 'mild',
        preparation_time,
        ingredients = [],
        nutritional_info = {},
        image_url = null,
        is_available = true,
        min_order_quantity = 1
      } = req.body;
      const { user: currentUser } = req;

      // Verify category exists
      const category = await dbHelpers.getDoc(collections.MENU_CATEGORIES, category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        });
      }

      // Get outlet_id from category
      const outlet_id = category.outlet_id;

      // Check if item with same name exists in category for this outlet
      const existingItems = await dbHelpers.getDocs(collections.MENU_ITEMS, [
        { type: 'where', field: 'category_id', operator: '==', value: category_id },
        { type: 'where', field: 'outlet_id', operator: '==', value: outlet_id },
        { type: 'where', field: 'name', operator: '==', value: name }
      ]);

      if (existingItems.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Menu item with this name already exists in this category'
          }
        });
      }

      // Create menu item
      const itemData = {
        category_id,
        outlet_id,
        name,
        description,
        price: parseFloat(price),
        is_vegetarian,
        is_vegan,
        is_gluten_free,
        spice_level,
        preparation_time: parseInt(preparation_time),
        ingredients,
        nutritional_info,
        image_url,
        is_available,
        is_active: true,
        min_order_quantity: parseInt(min_order_quantity) || 1,
        created_by: currentUser.id,
        total_orders: 0,
        average_rating: 0,
        review_count: 0
      };

      const item = await dbHelpers.createDoc(collections.MENU_ITEMS, itemData);

      // Update category item count
      await dbHelpers.updateDoc(collections.MENU_CATEGORIES, category_id, {
        item_count: (category.item_count || 0) + 1
      });

      logger.info('Menu item created successfully', { 
        itemId: item.id, 
        name, 
        categoryId: category_id,
        outletId: outlet_id,
        createdBy: currentUser.id 
      });

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: {
          item_id: item.id,
          name: item.name,
          category_id: item.category_id,
          outlet_id: item.outlet_id,
          price: item.price,
          is_available: item.is_available
        }
      });
    } catch (error) {
      logger.error('Menu item creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create menu item'
        }
      });
    }
  }

  // Get menu items
  static async getMenuItems(req, res) {
    try {
      const { 
        category_id, 
        is_available, 
        is_vegetarian, 
        is_vegan,
        spice_level,
        outlet_id,
        page = 1, 
        limit = 20 
      } = req.query;

      let queries = [];

      if (category_id) {
        queries.push({ type: 'where', field: 'category_id', operator: '==', value: category_id });
      }

      if (outlet_id) {
        queries.push({ type: 'where', field: 'outlet_id', operator: '==', value: outlet_id });
      }

      if (is_available !== undefined) {
        queries.push({ type: 'where', field: 'is_available', operator: '==', value: is_available === 'true' });
      }

      if (is_vegetarian !== undefined) {
        queries.push({ type: 'where', field: 'is_vegetarian', operator: '==', value: is_vegetarian === 'true' });
      }

      if (is_vegan !== undefined) {
        queries.push({ type: 'where', field: 'is_vegan', operator: '==', value: is_vegan === 'true' });
      }

      if (spice_level) {
        queries.push({ type: 'where', field: 'spice_level', operator: '==', value: spice_level });
      }

      // Always show active items
      queries.push({ type: 'where', field: 'is_active', operator: '==', value: true });

      let items = await dbHelpers.getDocs(
        collections.MENU_ITEMS,
        queries,
        { field: 'name', direction: 'asc' },
        parseInt(limit)
      );

      // Optimize: Fetch all active categories once and create a map
      let categoryQueries = [
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ];

      if (outlet_id) {
        categoryQueries.push({ type: 'where', field: 'outlet_id', operator: '==', value: outlet_id });
      }

      const categories = await dbHelpers.getDocs(collections.MENU_CATEGORIES, categoryQueries);
      
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.id] = cat.name;
      });

      // Add category names to items
      items.forEach(item => {
        item.category_name = categoryMap[item.category_id] || 'Unknown';
      });

      res.json({
        success: true,
        data: {
          items,
          outlet_id: outlet_id || 'all',
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: items.length
          }
        }
      });
    } catch (error) {
      logger.error('Get menu items error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get menu items'
        }
      });
    }
  }

  // Get single menu item
  static async getMenuItem(req, res) {
    try {
      const { itemId } = req.params;

      const item = await dbHelpers.getDoc(collections.MENU_ITEMS, itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Menu item not found'
          }
        });
      }

      // Get category information
      const category = await dbHelpers.getDoc(collections.MENU_CATEGORIES, item.category_id);
      item.category_name = category ? category.name : 'Unknown';

      res.json({
        success: true,
        data: { item }
      });
    } catch (error) {
      logger.error('Get menu item error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get menu item'
        }
      });
    }
  }

  // Update menu item
  static async updateMenuItem(req, res) {
    try {
      const { itemId } = req.params;
      const { user: currentUser } = req;
      const updateData = req.body;

      const item = await dbHelpers.getDoc(collections.MENU_ITEMS, itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Menu item not found'
          }
        });
      }

      // Convert price to float if provided
      if (updateData.price) {
        updateData.price = parseFloat(updateData.price);
      }

      // Convert preparation_time to int if provided
      if (updateData.preparation_time) {
        updateData.preparation_time = parseInt(updateData.preparation_time);
      }

      // Convert min_order_quantity to int if provided
      if (updateData.min_order_quantity) {
        updateData.min_order_quantity = parseInt(updateData.min_order_quantity);
      }

      const updatedItem = await dbHelpers.updateDoc(collections.MENU_ITEMS, itemId, {
        ...updateData,
        updated_by: currentUser.id
      });

      logger.info('Menu item updated successfully', { 
        itemId, 
        updatedBy: currentUser.id 
      });

      res.json({
        success: true,
        message: 'Menu item updated successfully',
        data: { item: updatedItem }
      });
    } catch (error) {
      logger.error('Update menu item error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update menu item'
        }
      });
    }
  }

  // Delete menu item
  static async deleteMenuItem(req, res) {
    try {
      const { itemId } = req.params;
      const { user: currentUser } = req;

      const item = await dbHelpers.getDoc(collections.MENU_ITEMS, itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Menu item not found'
          }
        });
      }

      // Delete image from Cloudinary if it exists
      if (item.image_url && item.image_url.includes('cloudinary.com')) {
        try {
          await StorageUtils.deleteFile(item.image_url);
          logger.info('Menu item image deleted from Cloudinary', { itemId, imageUrl: item.image_url });
        } catch (error) {
          logger.warn('Failed to delete image from Cloudinary', { itemId, error: error.message });
          // Continue with item deletion even if image deletion fails
        }
      }

      // Soft delete - deactivate instead of actual deletion
      await dbHelpers.updateDoc(collections.MENU_ITEMS, itemId, {
        is_active: false,
        is_available: false,
        deleted_by: currentUser.id,
        deleted_at: new Date()
      });

      // Update category item count
      const category = await dbHelpers.getDoc(collections.MENU_CATEGORIES, item.category_id);
      if (category) {
        await dbHelpers.updateDoc(collections.MENU_CATEGORIES, item.category_id, {
          item_count: Math.max((category.item_count || 1) - 1, 0)
        });
      }

      logger.info('Menu item deleted successfully', { 
        itemId, 
        deletedBy: currentUser.id 
      });

      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } catch (error) {
      logger.error('Delete menu item error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete menu item'
        }
      });
    }
  }

  // Toggle item availability
  static async toggleAvailability(req, res) {
    try {
      const { itemId } = req.params;
      const { is_available } = req.body;
      const { user: currentUser } = req;

      const item = await dbHelpers.getDoc(collections.MENU_ITEMS, itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Menu item not found'
          }
        });
      }

      const updatedItem = await dbHelpers.updateDoc(collections.MENU_ITEMS, itemId, {
        is_available: is_available,
        updated_by: currentUser.id
      });

      logger.info('Menu item availability updated', { 
        itemId, 
        isAvailable: is_available,
        updatedBy: currentUser.id 
      });

      res.json({
        success: true,
        message: `Menu item ${is_available ? 'enabled' : 'disabled'} successfully`,
        data: { 
          item_id: itemId,
          is_available: updatedItem.is_available 
        }
      });
    } catch (error) {
      logger.error('Toggle availability error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update item availability'
        }
      });
    }
  }

  // Get full menu (categories with items)
  static async getFullMenu(req, res) {
    try {
      const { outlet_id, include_unavailable = false } = req.query;

      // Validate outlet_id is provided
      if (!outlet_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'outlet_id is required'
          }
        });
      }

      // Get active categories for this outlet
      const categories = await dbHelpers.getDocs(collections.MENU_CATEGORIES, [
        { type: 'where', field: 'is_active', operator: '==', value: true },
        { type: 'where', field: 'outlet_id', operator: '==', value: outlet_id }
      ], { field: 'display_order', direction: 'asc' });

      // Optimize: Fetch all items at once for this outlet
      let itemQueries = [
        { type: 'where', field: 'is_active', operator: '==', value: true },
        { type: 'where', field: 'outlet_id', operator: '==', value: outlet_id }
      ];

      if (include_unavailable !== 'true') {
        itemQueries.push({ type: 'where', field: 'is_available', operator: '==', value: true });
      }

      const allItems = await dbHelpers.getDocs(collections.MENU_ITEMS, itemQueries);

      // Group items by category
      const itemsByCategory = {};
      allItems.forEach(item => {
        if (!itemsByCategory[item.category_id]) {
          itemsByCategory[item.category_id] = [];
        }
        itemsByCategory[item.category_id].push(item);
      });

      // Assign items to categories
      categories.forEach(category => {
        category.items = itemsByCategory[category.id] || [];
      });

      res.json({
        success: true,
        data: {
          menu: categories,
          outlet_id: outlet_id
        }
      });
    } catch (error) {
      logger.error('Get full menu error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get menu'
        }
      });
    }
  }
}

module.exports = MenuController;
