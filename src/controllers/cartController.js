const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');

class CartController {
  // Create a new cart
  static async createCart(req, res) {
    try {
      const { name, outlet_id, notes } = req.body;
      const { user: currentUser } = req;

      // Verify outlet exists
      if (outlet_id) {
        const outlet = await dbHelpers.getDoc(collections.OUTLETS, outlet_id);
        if (!outlet || !outlet.is_active) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Outlet not found or inactive'
            }
          });
        }
      }

      // Create cart
      const cartData = {
        user_id: currentUser.id,
        name: name || 'My Cart',
        outlet_id: outlet_id || null,
        items: [],
        subtotal: 0,
        item_count: 0,
        notes: notes || null,
        is_active: true
      };

      const cart = await dbHelpers.createDoc(collections.CARTS, cartData);

      logger.info('Cart created', { cartId: cart.id, userId: currentUser.id });

      res.status(201).json({
        success: true,
        message: 'Cart created successfully',
        data: { cart }
      });
    } catch (error) {
      logger.error('Create cart error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create cart'
        }
      });
    }
  }

  // Get all user's carts
  static async getUserCarts(req, res) {
    try {
      const { user: currentUser } = req;
      const { is_active = 'true' } = req.query;

      let queries = [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ];

      if (is_active !== 'all') {
        queries.push({ 
          type: 'where', 
          field: 'is_active', 
          operator: '==', 
          value: is_active === 'true' 
        });
      }

      const carts = await dbHelpers.getDocs(
        collections.CARTS,
        queries,
        { field: 'updated_at', direction: 'desc' }
      );

      res.json({
        success: true,
        data: { 
          carts,
          total: carts.length
        }
      });
    } catch (error) {
      logger.error('Get user carts error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get carts'
        }
      });
    }
  }

  // Get single cart
  static async getCart(req, res) {
    try {
      const { cartId } = req.params;
      const { user: currentUser } = req;

      const cart = await dbHelpers.getDoc(collections.CARTS, cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cart not found'
          }
        });
      }

      // Verify ownership
      if (cart.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      res.json({
        success: true,
        data: { cart }
      });
    } catch (error) {
      logger.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get cart'
        }
      });
    }
  }

  // Add item to cart
  static async addItem(req, res) {
    try {
      const { cartId } = req.params;
      const { menu_item_id, quantity, special_instructions } = req.body;
      const { user: currentUser } = req;

      const cart = await dbHelpers.getDoc(collections.CARTS, cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cart not found'
          }
        });
      }

      // Verify ownership
      if (cart.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      // Get menu item details
      const menuItem = await dbHelpers.getDoc(collections.MENU_ITEMS, menu_item_id);

      if (!menuItem || !menuItem.is_active || !menuItem.is_available) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Menu item is not available'
          }
        });
      }

      // Check minimum order quantity
      const minOrderQty = menuItem.min_order_quantity || 1;
      if (quantity < minOrderQty) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `${menuItem.name} requires a minimum order quantity of ${minOrderQty}`
          }
        });
      }

      // Check if cart has outlet and item matches
      if (cart.outlet_id && menuItem.outlet_specific) {
        if (!menuItem.outlet_ids.includes(cart.outlet_id)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Item not available at this outlet'
            }
          });
        }
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.menu_item_id === menu_item_id
      );

      let updatedItems = [...cart.items];

      if (existingItemIndex >= 0) {
        // Update quantity
        updatedItems[existingItemIndex].quantity += quantity;
        updatedItems[existingItemIndex].subtotal = 
          updatedItems[existingItemIndex].quantity * menuItem.price;
      } else {
        // Add new item
        updatedItems.push({
          menu_item_id,
          name: menuItem.name,
          price: menuItem.price,
          quantity,
          special_instructions: special_instructions || null,
          subtotal: menuItem.price * quantity,
          image_url: menuItem.image_url,
          min_order_quantity: menuItem.min_order_quantity || 1
        });
      }

      // Calculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      // Update cart
      const updatedCart = await dbHelpers.updateDoc(collections.CARTS, cartId, {
        items: updatedItems,
        subtotal,
        item_count: itemCount
      });

      logger.info('Item added to cart', { cartId, menuItemId: menu_item_id });

      res.json({
        success: true,
        message: 'Item added to cart',
        data: { cart: updatedCart }
      });
    } catch (error) {
      logger.error('Add item to cart error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add item to cart'
        }
      });
    }
  }

  // Update item quantity in cart
  static async updateItem(req, res) {
    try {
      const { cartId, itemId } = req.params;
      const { quantity, special_instructions } = req.body;
      const { user: currentUser } = req;

      const cart = await dbHelpers.getDoc(collections.CARTS, cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cart not found'
          }
        });
      }

      // Verify ownership
      if (cart.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      const itemIndex = cart.items.findIndex(item => item.menu_item_id === itemId);

      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Item not found in cart'
          }
        });
      }

      // Check minimum order quantity
      const minQty = cart.items[itemIndex].min_order_quantity || 1;
      if (quantity < minQty) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Minimum order quantity is ${minQty}`
          }
        });
      }

      let updatedItems = [...cart.items];
      updatedItems[itemIndex].quantity = quantity;
      updatedItems[itemIndex].subtotal = quantity * updatedItems[itemIndex].price;
      
      if (special_instructions !== undefined) {
        updatedItems[itemIndex].special_instructions = special_instructions;
      }

      // Calculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      // Update cart
      const updatedCart = await dbHelpers.updateDoc(collections.CARTS, cartId, {
        items: updatedItems,
        subtotal,
        item_count: itemCount
      });

      res.json({
        success: true,
        message: 'Cart item updated',
        data: { cart: updatedCart }
      });
    } catch (error) {
      logger.error('Update cart item error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update cart item'
        }
      });
    }
  }

  // Remove item from cart
  static async removeItem(req, res) {
    try {
      const { cartId, itemId } = req.params;
      const { user: currentUser } = req;

      const cart = await dbHelpers.getDoc(collections.CARTS, cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cart not found'
          }
        });
      }

      // Verify ownership
      if (cart.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      const updatedItems = cart.items.filter(item => item.menu_item_id !== itemId);

      // Calculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      // Update cart
      const updatedCart = await dbHelpers.updateDoc(collections.CARTS, cartId, {
        items: updatedItems,
        subtotal,
        item_count: itemCount
      });

      res.json({
        success: true,
        message: 'Item removed from cart',
        data: { cart: updatedCart }
      });
    } catch (error) {
      logger.error('Remove cart item error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to remove item from cart'
        }
      });
    }
  }

  // Clear cart
  static async clearCart(req, res) {
    try {
      const { cartId } = req.params;
      const { user: currentUser } = req;

      const cart = await dbHelpers.getDoc(collections.CARTS, cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cart not found'
          }
        });
      }

      // Verify ownership
      if (cart.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      const updatedCart = await dbHelpers.updateDoc(collections.CARTS, cartId, {
        items: [],
        subtotal: 0,
        item_count: 0
      });

      res.json({
        success: true,
        message: 'Cart cleared',
        data: { cart: updatedCart }
      });
    } catch (error) {
      logger.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to clear cart'
        }
      });
    }
  }

  // Update cart details
  static async updateCart(req, res) {
    try {
      const { cartId } = req.params;
      const { name, notes, outlet_id } = req.body;
      const { user: currentUser } = req;

      const cart = await dbHelpers.getDoc(collections.CARTS, cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cart not found'
          }
        });
      }

      // Verify ownership
      if (cart.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (notes !== undefined) updateData.notes = notes;
      if (outlet_id !== undefined) updateData.outlet_id = outlet_id;

      const updatedCart = await dbHelpers.updateDoc(collections.CARTS, cartId, updateData);

      res.json({
        success: true,
        message: 'Cart updated',
        data: { cart: updatedCart }
      });
    } catch (error) {
      logger.error('Update cart error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update cart'
        }
      });
    }
  }

  // Delete cart
  static async deleteCart(req, res) {
    try {
      const { cartId } = req.params;
      const { user: currentUser } = req;

      const cart = await dbHelpers.getDoc(collections.CARTS, cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cart not found'
          }
        });
      }

      // Verify ownership
      if (cart.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      // Soft delete
      await dbHelpers.updateDoc(collections.CARTS, cartId, {
        is_active: false,
        deleted_at: new Date()
      });

      res.json({
        success: true,
        message: 'Cart deleted'
      });
    } catch (error) {
      logger.error('Delete cart error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete cart'
        }
      });
    }
  }

  // Duplicate cart
  static async duplicateCart(req, res) {
    try {
      const { cartId } = req.params;
      const { name } = req.body;
      const { user: currentUser } = req;

      const cart = await dbHelpers.getDoc(collections.CARTS, cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cart not found'
          }
        });
      }

      // Verify ownership
      if (cart.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      // Create duplicate
      const newCartData = {
        user_id: currentUser.id,
        name: name || `${cart.name} (Copy)`,
        outlet_id: cart.outlet_id,
        items: cart.items,
        subtotal: cart.subtotal,
        item_count: cart.item_count,
        notes: cart.notes,
        is_active: true
      };

      const newCart = await dbHelpers.createDoc(collections.CARTS, newCartData);

      res.status(201).json({
        success: true,
        message: 'Cart duplicated',
        data: { cart: newCart }
      });
    } catch (error) {
      logger.error('Duplicate cart error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to duplicate cart'
        }
      });
    }
  }

  // Calculate price with delivery charges
  static async calculatePrice(req, res) {
    try {
      const { cartId } = req.params;
      const { order_type, coupon_code } = req.body;
      const { user: currentUser } = req;

      const cart = await dbHelpers.getDoc(collections.CARTS, cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cart not found'
          }
        });
      }

      // Verify ownership
      if (cart.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      if (cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cart is empty'
          }
        });
      }

      const subtotal = cart.subtotal;

      // Calculate delivery fee
      let deliveryFee = 0;
      if (order_type === 'delivery') {
        deliveryFee = subtotal > 500 ? 0 : 50;
      }

      // Calculate tax (8%)
      const tax = subtotal * 0.08;

      // Apply coupon if provided
      let discount = 0;
      let couponApplied = null;
      if (coupon_code) {
        const CouponController = require('./couponController');
        const couponResult = await CouponController.applyCoupon(
          coupon_code,
          currentUser.id,
          subtotal,
          cart.outlet_id,
          cart.items
        );

        if (couponResult.valid) {
          discount = couponResult.discount;
          couponApplied = {
            code: coupon_code.toUpperCase(),
            discount_type: couponResult.discount_type || 'percentage',
            discount_value: couponResult.discount_value || 0,
            discount_amount: discount
          };
        } else {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: couponResult.error || 'Invalid coupon code'
            }
          });
        }
      }

      // Calculate total
      const total = subtotal + deliveryFee + tax - discount;

      // Delivery info
      const deliveryInfo = {
        is_free_delivery: order_type === 'delivery' && subtotal > 500,
        free_delivery_threshold: 500,
        amount_for_free_delivery: order_type === 'delivery' && subtotal < 500 ? 500 - subtotal : 0
      };

      res.json({
        success: true,
        data: {
          price_breakdown: {
            subtotal: parseFloat(subtotal.toFixed(2)),
            delivery_fee: parseFloat(deliveryFee.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            discount: parseFloat(discount.toFixed(2)),
            total: parseFloat(total.toFixed(2))
          },
          delivery_info: deliveryInfo,
          coupon_applied: couponApplied,
          items_count: cart.item_count,
          estimated_delivery_time: order_type === 'delivery' ? 45 : 30
        }
      });
    } catch (error) {
      logger.error('Calculate price error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to calculate price'
        }
      });
    }
  }

  // Checkout cart (convert to order)
  static async checkoutCart(req, res) {
    try {
      const { cartId } = req.params;
      const { 
        order_type, 
        delivery_address, 
        payment_method, 
        coupon_code,
        special_instructions 
      } = req.body;
      const { user: currentUser } = req;

      const cart = await dbHelpers.getDoc(collections.CARTS, cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cart not found'
          }
        });
      }

      // Verify ownership
      if (cart.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      if (cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cart is empty'
          }
        });
      }

      if (!cart.outlet_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please select an outlet'
          }
        });
      }

      // Create order using OrderController logic
      const OrderController = require('./orderController');
      
      // Prepare order data
      req.body = {
        outlet_id: cart.outlet_id,
        order_type,
        delivery_address,
        items: cart.items.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_instructions: item.special_instructions
        })),
        payment_method,
        coupon_code,
        special_instructions: special_instructions || cart.notes
      };

      // Call order creation
      await OrderController.createOrder(req, res);

      // If order created successfully, clear the cart
      if (res.statusCode === 201) {
        await dbHelpers.updateDoc(collections.CARTS, cartId, {
          items: [],
          subtotal: 0,
          item_count: 0
        });
      }
    } catch (error) {
      logger.error('Checkout cart error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to checkout cart'
        }
      });
    }
  }
}

module.exports = CartController;
