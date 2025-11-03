const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');

class CouponController {
  // Create coupon
  static async createCoupon(req, res) {
    try {
      const {
        code,
        description,
        discount_type,
        discount_value,
        min_order_value,
        max_discount,
        usage_limit,
        usage_per_user,
        valid_from,
        valid_until,
        applicable_outlets,
        applicable_items,
        applicable_categories,
        first_order_only,
        is_active = true
      } = req.body;
      const { user: currentUser } = req;

      // Check if coupon code already exists
      const existingCoupons = await dbHelpers.getDocs(collections.COUPONS, [
        { type: 'where', field: 'code', operator: '==', value: code.toUpperCase() }
      ]);

      if (existingCoupons.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Coupon code already exists'
          }
        });
      }

      // Validate discount value
      if (discount_type === 'percentage' && discount_value > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Percentage discount cannot exceed 100%'
          }
        });
      }

      // Determine applicable outlets based on user role
      let finalApplicableOutlets = [];
      
      if (currentUser.role === 'super_admin') {
        // Super admin: can create coupons for all outlets or specific outlets
        finalApplicableOutlets = applicable_outlets || []; // Empty array = all outlets
      } else if (currentUser.role === 'outlet_admin') {
        // Outlet admin: can only create coupons for their assigned outlet
        const userOutlets = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);
        
        if (userOutlets.length === 0) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'No outlet assigned to you'
            }
          });
        }
        
        // Restrict to outlet admin's outlet only
        finalApplicableOutlets = [userOutlets[0].outlet_id];
      }

      // Create coupon
      const couponData = {
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value: parseFloat(discount_value),
        min_order_value: min_order_value ? parseFloat(min_order_value) : 0,
        max_discount: max_discount ? parseFloat(max_discount) : null,
        usage_limit: usage_limit || null,
        usage_per_user: usage_per_user || 1,
        valid_from: valid_from ? new Date(valid_from) : new Date(),
        valid_until: valid_until ? new Date(valid_until) : null,
        applicable_outlets: finalApplicableOutlets,
        applicable_items: applicable_items || [],
        applicable_categories: applicable_categories || [],
        first_order_only: first_order_only || false,
        is_active,
        is_global: currentUser.role === 'super_admin' && (!applicable_outlets || applicable_outlets.length === 0),
        total_usage: 0,
        total_discount_given: 0,
        created_by: currentUser.id,
        created_by_role: currentUser.role
      };

      const coupon = await dbHelpers.createDoc(collections.COUPONS, couponData);

      logger.info('Coupon created successfully', {
        couponId: coupon.id,
        code: coupon.code,
        createdBy: currentUser.id
      });

      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: {
          coupon_id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          valid_from: coupon.valid_from,
          valid_until: coupon.valid_until
        }
      });
    } catch (error) {
      logger.error('Coupon creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create coupon'
        }
      });
    }
  }

  // Get all coupons
  static async getCoupons(req, res) {
    try {
      const { is_active, page = 1, limit = 20 } = req.query;

      let queries = [];

      if (is_active !== undefined) {
        queries.push({ type: 'where', field: 'is_active', operator: '==', value: is_active === 'true' });
      }

      const coupons = await dbHelpers.getDocs(
        collections.COUPONS,
        queries,
        { field: 'created_at', direction: 'desc' },
        parseInt(limit)
      );

      res.json({
        success: true,
        data: {
          coupons,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: coupons.length
          }
        }
      });
    } catch (error) {
      logger.error('Get coupons error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get coupons'
        }
      });
    }
  }

  // Get single coupon
  static async getCoupon(req, res) {
    try {
      const { couponId } = req.params;

      const coupon = await dbHelpers.getDoc(collections.COUPONS, couponId);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Coupon not found'
          }
        });
      }

      res.json({
        success: true,
        data: { coupon }
      });
    } catch (error) {
      logger.error('Get coupon error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get coupon'
        }
      });
    }
  }

  // Update coupon
  static async updateCoupon(req, res) {
    try {
      const { couponId } = req.params;
      const { user: currentUser } = req;
      const updateData = req.body;

      const coupon = await dbHelpers.getDoc(collections.COUPONS, couponId);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Coupon not found'
          }
        });
      }

      // Don't allow changing code if coupon has been used
      if (updateData.code && coupon.total_usage > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cannot change code of a used coupon'
          }
        });
      }

      // Convert dates if provided
      if (updateData.valid_from) {
        updateData.valid_from = new Date(updateData.valid_from);
      }
      if (updateData.valid_until) {
        updateData.valid_until = new Date(updateData.valid_until);
      }

      // Convert numeric values
      if (updateData.discount_value) {
        updateData.discount_value = parseFloat(updateData.discount_value);
      }
      if (updateData.min_order_value) {
        updateData.min_order_value = parseFloat(updateData.min_order_value);
      }
      if (updateData.max_discount) {
        updateData.max_discount = parseFloat(updateData.max_discount);
      }

      const updatedCoupon = await dbHelpers.updateDoc(collections.COUPONS, couponId, {
        ...updateData,
        updated_by: currentUser.id
      });

      logger.info('Coupon updated successfully', {
        couponId,
        updatedBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Coupon updated successfully',
        data: { coupon: updatedCoupon }
      });
    } catch (error) {
      logger.error('Update coupon error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update coupon'
        }
      });
    }
  }

  // Delete coupon
  static async deleteCoupon(req, res) {
    try {
      const { couponId } = req.params;
      const { user: currentUser } = req;

      const coupon = await dbHelpers.getDoc(collections.COUPONS, couponId);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Coupon not found'
          }
        });
      }

      // Soft delete - deactivate instead of actual deletion
      await dbHelpers.updateDoc(collections.COUPONS, couponId, {
        is_active: false,
        deleted_by: currentUser.id,
        deleted_at: new Date()
      });

      logger.info('Coupon deleted successfully', {
        couponId,
        deletedBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Coupon deleted successfully'
      });
    } catch (error) {
      logger.error('Delete coupon error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete coupon'
        }
      });
    }
  }

  // Validate coupon
  static async validateCoupon(req, res) {
    try {
      const { code, outlet_id, order_total, items } = req.body;
      const { user: currentUser } = req;

      // Find coupon by code
      const coupons = await dbHelpers.getDocs(collections.COUPONS, [
        { type: 'where', field: 'code', operator: '==', value: code.toUpperCase() }
      ]);

      if (coupons.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Invalid coupon code'
          }
        });
      }

      const coupon = coupons[0];

      // Check if coupon is active
      if (!coupon.is_active) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Coupon is not active'
          }
        });
      }

      // Check validity dates
      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Coupon is not yet valid'
          }
        });
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Coupon has expired'
          }
        });
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.total_usage >= coupon.usage_limit) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Coupon usage limit reached'
          }
        });
      }

      // Check user usage limit
      const userUsage = await dbHelpers.getDocs(collections.ORDERS, [
        { type: 'where', field: 'customer_id', operator: '==', value: currentUser.id },
        { type: 'where', field: 'coupon_code', operator: '==', value: code.toUpperCase() }
      ]);

      if (userUsage.length >= coupon.usage_per_user) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'You have already used this coupon the maximum number of times'
          }
        });
      }

      // Check first order only
      if (coupon.first_order_only) {
        const customerOrders = await dbHelpers.getDocs(collections.ORDERS, [
          { type: 'where', field: 'customer_id', operator: '==', value: currentUser.id },
          { type: 'where', field: 'status', operator: 'in', value: ['delivered', 'completed'] }
        ]);

        if (customerOrders.length > 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Coupon is only valid for first order'
            }
          });
        }
      }

      // Check minimum order value
      if (coupon.min_order_value && order_total < coupon.min_order_value) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Minimum order value of $${coupon.min_order_value} required`
          }
        });
      }

      // Check outlet applicability
      if (coupon.applicable_outlets.length > 0 && !coupon.applicable_outlets.includes(outlet_id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Coupon not applicable for this outlet'
          }
        });
      }

      // Check item/category applicability
      if (coupon.applicable_items.length > 0 || coupon.applicable_categories.length > 0) {
        let hasApplicableItem = false;

        for (const item of items) {
          const menuItem = await dbHelpers.getDoc(collections.MENU_ITEMS, item.menu_item_id);
          
          if (coupon.applicable_items.includes(item.menu_item_id) ||
              coupon.applicable_categories.includes(menuItem.category_id)) {
            hasApplicableItem = true;
            break;
          }
        }

        if (!hasApplicableItem) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Coupon not applicable for selected items'
            }
          });
        }
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (order_total * coupon.discount_value) / 100;
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }
      } else if (coupon.discount_type === 'fixed') {
        discount = coupon.discount_value;
        if (discount > order_total) {
          discount = order_total;
        }
      }

      res.json({
        success: true,
        message: 'Coupon is valid',
        data: {
          coupon_id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          calculated_discount: parseFloat(discount.toFixed(2)),
          description: coupon.description
        }
      });
    } catch (error) {
      logger.error('Validate coupon error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to validate coupon'
        }
      });
    }
  }

  // Apply coupon (called during order creation)
  static async applyCoupon(couponCode, customerId, orderTotal, outletId, items) {
    try {
      // Find coupon
      const coupons = await dbHelpers.getDocs(collections.COUPONS, [
        { type: 'where', field: 'code', operator: '==', value: couponCode.toUpperCase() }
      ]);

      if (coupons.length === 0) {
        return { valid: false, error: 'Invalid coupon code', discount: 0 };
      }

      const coupon = coupons[0];

      // Perform all validations (similar to validateCoupon)
      if (!coupon.is_active) {
        return { valid: false, error: 'Coupon is not active', discount: 0 };
      }

      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        return { valid: false, error: 'Coupon is not yet valid', discount: 0 };
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        return { valid: false, error: 'Coupon has expired', discount: 0 };
      }

      if (coupon.usage_limit && coupon.total_usage >= coupon.usage_limit) {
        return { valid: false, error: 'Coupon usage limit reached', discount: 0 };
      }

      if (coupon.min_order_value && orderTotal < coupon.min_order_value) {
        return { valid: false, error: `Minimum order value of $${coupon.min_order_value} required`, discount: 0 };
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (orderTotal * coupon.discount_value) / 100;
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }
      } else if (coupon.discount_type === 'fixed') {
        discount = coupon.discount_value;
        if (discount > orderTotal) {
          discount = orderTotal;
        }
      }

      // Update coupon usage
      await dbHelpers.updateDoc(collections.COUPONS, coupon.id, {
        total_usage: (coupon.total_usage || 0) + 1,
        total_discount_given: (coupon.total_discount_given || 0) + discount
      });

      return {
        valid: true,
        discount: parseFloat(discount.toFixed(2)),
        coupon_id: coupon.id
      };
    } catch (error) {
      logger.error('Apply coupon error:', error);
      return { valid: false, error: 'Failed to apply coupon', discount: 0 };
    }
  }

  // Get coupon statistics
  static async getCouponStats(req, res) {
    try {
      const { couponId } = req.params;

      const coupon = await dbHelpers.getDoc(collections.COUPONS, couponId);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Coupon not found'
          }
        });
      }

      // Get orders using this coupon
      const orders = await dbHelpers.getDocs(collections.ORDERS, [
        { type: 'where', field: 'coupon_code', operator: '==', value: coupon.code }
      ]);

      const stats = {
        coupon_id: coupon.id,
        code: coupon.code,
        total_usage: coupon.total_usage || 0,
        total_discount_given: coupon.total_discount_given || 0,
        usage_limit: coupon.usage_limit,
        remaining_uses: coupon.usage_limit ? coupon.usage_limit - (coupon.total_usage || 0) : 'Unlimited',
        orders_count: orders.length,
        average_discount: orders.length > 0 
          ? (coupon.total_discount_given || 0) / orders.length 
          : 0
      };

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get coupon stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get coupon statistics'
        }
      });
    }
  }

  // Get available coupons for customer
  static async getAvailableCoupons(req, res) {
    try {
      const { user: currentUser } = req;
      const { outlet_id, order_total } = req.query;

      const now = new Date();

      // Get all active coupons
      let coupons = await dbHelpers.getDocs(collections.COUPONS, [
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);

      // Filter coupons based on validity and applicability
      const availableCoupons = [];

      for (const coupon of coupons) {
        // Check validity dates
        if (coupon.valid_from && new Date(coupon.valid_from) > now) continue;
        if (coupon.valid_until && new Date(coupon.valid_until) < now) continue;

        // Check usage limit
        if (coupon.usage_limit && coupon.total_usage >= coupon.usage_limit) continue;

        // Check minimum order value
        if (order_total && coupon.min_order_value && parseFloat(order_total) < coupon.min_order_value) continue;

        // Check outlet applicability
        if (outlet_id && coupon.applicable_outlets.length > 0 && !coupon.applicable_outlets.includes(outlet_id)) continue;

        // Check user usage
        const userUsage = await dbHelpers.getDocs(collections.ORDERS, [
          { type: 'where', field: 'customer_id', operator: '==', value: currentUser.id },
          { type: 'where', field: 'coupon_code', operator: '==', value: coupon.code }
        ]);

        if (userUsage.length >= coupon.usage_per_user) continue;

        availableCoupons.push({
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          min_order_value: coupon.min_order_value,
          max_discount: coupon.max_discount,
          valid_until: coupon.valid_until
        });
      }

      res.json({
        success: true,
        data: {
          coupons: availableCoupons,
          count: availableCoupons.length
        }
      });
    } catch (error) {
      logger.error('Get available coupons error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get available coupons'
        }
      });
    }
  }
}

module.exports = CouponController;