const express = require('express');
const MenuController = require('../controllers/menuController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateQuery, schemas, querySchemas } = require('../middleware/validation');
const { upload, handleMulterError } = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for menu endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window (higher for menu browsing)
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

router.use(generalLimiter);

// ===== PUBLIC ROUTES (No authentication required) =====

// Get full menu (public access for customers)
router.get('/full',
  MenuController.getFullMenu
);

// Get all categories (public)
router.get('/categories',
  MenuController.getCategories
);

// Get single category (public)
router.get('/categories/:categoryId',
  MenuController.getCategory
);

// Get menu items (public)
router.get('/items',
  validateQuery(querySchemas.menuItems),
  MenuController.getMenuItems
);

// Get single menu item (public)
router.get('/items/:itemId',
  MenuController.getMenuItem
);

// ===== PROTECTED ROUTES (Authentication required) =====

router.use(authenticate);

// ===== CATEGORY MANAGEMENT =====

// Create category (Super Admin and Outlet Admin only)
router.post('/categories',
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.menuCategory),
  MenuController.createCategory
);

// Update category (Super Admin and Outlet Admin only)
router.put('/categories/:categoryId',
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.menuCategoryUpdate),
  MenuController.updateCategory
);

// Delete category (Super Admin and Outlet Admin only)
router.delete('/categories/:categoryId',
  authorize(['super_admin', 'outlet_admin']),
  MenuController.deleteCategory
);

// ===== MENU ITEM MANAGEMENT =====

// Upload menu item image only (Super Admin and Outlet Admin only)
router.post('/items/upload-image',
  authorize(['super_admin', 'outlet_admin']),
  upload.single('image'),
  handleMulterError,
  MenuController.uploadMenuItemImage
);

// Upload image AND create menu item in one step (Super Admin and Outlet Admin only)
router.post('/items/upload-and-create',
  authorize(['super_admin', 'outlet_admin']),
  upload.single('image'),
  handleMulterError,
  MenuController.uploadAndCreateMenuItem
);

// Delete menu item image from storage (Super Admin and Outlet Admin only)
router.delete('/items/delete-image',
  authorize(['super_admin', 'outlet_admin']),
  MenuController.deleteMenuItemImage
);

// Create menu item (Super Admin and Outlet Admin only)
router.post('/items',
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.menuItem),
  MenuController.createMenuItem
);

// Update menu item (Super Admin and Outlet Admin only)
router.put('/items/:itemId',
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.menuItemUpdate),
  MenuController.updateMenuItem
);

// Delete menu item (Super Admin and Outlet Admin only)
router.delete('/items/:itemId',
  authorize(['super_admin', 'outlet_admin']),
  MenuController.deleteMenuItem
);

// Toggle item availability (Super Admin, Outlet Admin, and Kitchen Staff)
router.patch('/items/:itemId/availability',
  authorize(['super_admin', 'outlet_admin', 'kitchen_staff']),
  validate(schemas.toggleAvailability),
  MenuController.toggleAvailability
);

module.exports = router;