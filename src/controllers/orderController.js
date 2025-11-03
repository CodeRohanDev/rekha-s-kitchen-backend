const { dbHelpers, collections, admin } = require('../config/database');
const logger = require('../utils/logger');

class OrderController {
  // Create new order
  static async createOrder(req, res) {
    try {
      const {
        outlet_id,
        order_type,
        delivery_address,
        items,
        payment_method,
        coupon_code,
        special_instructions
      } = req.body;
      const { user: currentUser } = req;

      // Verify outlet exists and is active
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

      // Validate and calculate order items
      let orderItems = [];
      let subtotal = 0;
      let totalPreparationTime = 0;

      for (const item of items) {
        const menuItem = await dbHelpers.getDoc(collections.MENU_ITEMS, item.menu_item_id);
        
        if (!menuItem || !menuItem.is_active || !menuItem.is_available) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: `Menu item ${item.menu_item_id} is not available`
            }
          });
        }

        // Check outlet-specific availability
        if (menuItem.outlet_specific && !menuItem.outlet_ids.includes(outlet_id)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: `Menu item ${menuItem.name} is not available at this outlet`
            }
          });
        }

        // Check minimum order quantity
        const minOrderQty = menuItem.min_order_quantity || 1;
        if (item.quantity < minOrderQty) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: `${menuItem.name} requires a minimum order quantity of ${minOrderQty}. You ordered ${item.quantity}.`
            }
          });
        }

        const itemTotal = menuItem.price * item.quantity;
        subtotal += itemTotal;
        totalPreparationTime = Math.max(totalPreparationTime, menuItem.preparation_time);

        orderItems.push({
          menu_item_id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
          special_instructions: item.special_instructions || null,
          subtotal: itemTotal
        });
      }

      // Calculate delivery fee (simplified - based on order type)
      let deliveryFee = 0;
      if (order_type === 'delivery') {
        deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery over ₹500
      }

      // Apply coupon if provided
      let discount = 0;
      let appliedCoupon = null;
      if (coupon_code) {
        const CouponController = require('./couponController');
        const couponResult = await CouponController.applyCoupon(
          coupon_code,
          currentUser.id,
          subtotal,
          outlet_id,
          items
        );

        if (couponResult.valid) {
          discount = couponResult.discount;
          appliedCoupon = coupon_code.toUpperCase();
        } else {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: couponResult.error
            }
          });
        }
      }

      // Calculate totals
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + deliveryFee + tax - discount;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const orderData = {
        order_number: orderNumber,
        customer_id: currentUser.id,
        outlet_id,
        order_type,
        status: 'pending',
        payment_status: 'pending',
        payment_method,
        delivery_address: order_type === 'delivery' ? delivery_address : null,
        items: orderItems,
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        discount,
        total,
        coupon_code: appliedCoupon,
        special_instructions: special_instructions || null,
        estimated_preparation_time: totalPreparationTime,
        estimated_delivery_time: order_type === 'delivery' ? totalPreparationTime + 30 : totalPreparationTime,
        assigned_to: null,
        kitchen_notes: null,
        delivery_notes: null,
        cancelled_reason: null,
        cancelled_by: null,
        cancelled_at: null
      };

      const order = await dbHelpers.createDoc(collections.ORDERS, orderData);

      // Create order items as subcollection
      for (const item of orderItems) {
        await dbHelpers.createDoc(`${collections.ORDERS}/${order.id}/items`, item);
      }

      // Update outlet statistics
      await dbHelpers.updateDoc(collections.OUTLETS, outlet_id, {
        total_orders: (outlet.total_orders || 0) + 1
      });

      logger.info('Order created successfully', {
        orderId: order.id,
        orderNumber,
        customerId: currentUser.id,
        outletId: outlet_id,
        total
      });

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: {
          order_id: order.id,
          order_number: orderNumber,
          status: order.status,
          total: order.total,
          estimated_delivery_time: order.estimated_delivery_time
        }
      });
    } catch (error) {
      logger.error('Order creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create order'
        }
      });
    }
  }

  // Get customer orders
  static async getCustomerOrders(req, res) {
    try {
      const { user: currentUser } = req;
      const { status, page = 1, limit = 10 } = req.query;

      let queries = [
        { type: 'where', field: 'customer_id', operator: '==', value: currentUser.id }
      ];

      if (status) {
        queries.push({ type: 'where', field: 'status', operator: '==', value: status });
      }

      const orders = await dbHelpers.getDocs(
        collections.ORDERS,
        queries,
        { field: 'created_at', direction: 'desc' },
        parseInt(limit)
      );

      // Get outlet details for each order
      for (let order of orders) {
        const outlet = await dbHelpers.getDoc(collections.OUTLETS, order.outlet_id);
        order.outlet_name = outlet ? outlet.name : 'Unknown';
      }

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: orders.length
          }
        }
      });
    } catch (error) {
      logger.error('Get customer orders error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get orders'
        }
      });
    }
  }

  // Get all orders (Admin/Staff)
  static async getAllOrders(req, res) {
    try {
      const { user: currentUser } = req;
      const { status, outlet_id, order_type, date_from, date_to, page = 1, limit = 20 } = req.query;

      let queries = [];

      // Filter by outlet for outlet admins and staff
      if (currentUser.role === 'outlet_admin' || currentUser.role === 'kitchen_staff' || currentUser.role === 'delivery_boy') {
        if (outlet_id) {
          queries.push({ type: 'where', field: 'outlet_id', operator: '==', value: outlet_id });
        } else {
          // Get user's assigned outlets
          const assignments = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
            { type: 'where', field: 'is_active', operator: '==', value: true }
          ]);
          
          if (assignments.length > 0) {
            // For simplicity, filter by first assigned outlet
            queries.push({ type: 'where', field: 'outlet_id', operator: '==', value: assignments[0].outlet_id });
          }
        }
      } else if (outlet_id) {
        queries.push({ type: 'where', field: 'outlet_id', operator: '==', value: outlet_id });
      }

      if (status) {
        queries.push({ type: 'where', field: 'status', operator: '==', value: status });
      }

      if (order_type) {
        queries.push({ type: 'where', field: 'order_type', operator: '==', value: order_type });
      }

      const orders = await dbHelpers.getDocs(
        collections.ORDERS,
        queries,
        { field: 'created_at', direction: 'desc' },
        parseInt(limit)
      );

      // Get additional details
      for (let order of orders) {
        const outlet = await dbHelpers.getDoc(collections.OUTLETS, order.outlet_id);
        order.outlet_name = outlet ? outlet.name : 'Unknown';

        const customer = await dbHelpers.getDoc(collections.USER_PROFILES, order.customer_id);
        order.customer_name = customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown';
      }

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: orders.length
          }
        }
      });
    } catch (error) {
      logger.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get orders'
        }
      });
    }
  }

  // Get single order
  static async getOrder(req, res) {
    try {
      const { orderId } = req.params;
      const { user: currentUser } = req;

      const order = await dbHelpers.getDoc(collections.ORDERS, orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Order not found'
          }
        });
      }

      // Check access permissions
      if (currentUser.role === 'customer' && order.customer_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      // Get order items
      const items = await dbHelpers.getDocs(`${collections.ORDERS}/${orderId}/items`);
      order.items = items;

      // Get outlet details
      const outlet = await dbHelpers.getDoc(collections.OUTLETS, order.outlet_id);
      order.outlet_details = outlet;

      // Get customer details
      const customer = await dbHelpers.getDoc(collections.USER_PROFILES, order.customer_id);
      order.customer_details = customer;

      res.json({
        success: true,
        data: { order }
      });
    } catch (error) {
      logger.error('Get order error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get order'
        }
      });
    }
  }

  // Update order status
  static async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, notes } = req.body;
      const { user: currentUser } = req;

      const order = await dbHelpers.getDoc(collections.ORDERS, orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Order not found'
          }
        });
      }

      // Validate status transition
      const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['preparing', 'cancelled'],
        'preparing': ['ready', 'cancelled'],
        'ready': ['out_for_delivery', 'completed', 'cancelled'],
        'out_for_delivery': ['delivered', 'cancelled'],
        'delivered': [],
        'completed': [],
        'cancelled': []
      };

      if (!validTransitions[order.status].includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Cannot transition from ${order.status} to ${status}`
          }
        });
      }

      // Update order
      const updateData = {
        status,
        updated_by: currentUser.id
      };

      // Add status-specific fields
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date();
        updateData.confirmed_by = currentUser.id;
      } else if (status === 'preparing') {
        updateData.preparing_at = new Date();
      } else if (status === 'ready') {
        updateData.ready_at = new Date();
      } else if (status === 'out_for_delivery') {
        updateData.out_for_delivery_at = new Date();
        updateData.assigned_to = currentUser.id;
      } else if (status === 'delivered' || status === 'completed') {
        updateData.completed_at = new Date();
        updateData.payment_status = 'completed';
        
        // Update outlet revenue
        const outlet = await dbHelpers.getDoc(collections.OUTLETS, order.outlet_id);
        await dbHelpers.updateDoc(collections.OUTLETS, order.outlet_id, {
          total_revenue: (outlet.total_revenue || 0) + order.total
        });

        // Process loyalty rewards
        const LoyaltyHelper = require('../utils/loyaltyHelper');
        await LoyaltyHelper.processOrderLoyalty(orderId, order.customer_id, order.total);
      }

      if (notes) {
        if (currentUser.role === 'kitchen_staff') {
          updateData.kitchen_notes = notes;
        } else if (currentUser.role === 'delivery_boy') {
          updateData.delivery_notes = notes;
        }
      }

      const updatedOrder = await dbHelpers.updateDoc(collections.ORDERS, orderId, updateData);

      // Send notification to customer
      const NotificationService = require('../services/notificationService');
      await NotificationService.sendOrderNotification({
        id: orderId,
        order_number: order.order_number,
        customer_id: order.customer_id,
        order_type: order.order_type
      }, status);

      logger.info('Order status updated', {
        orderId,
        oldStatus: order.status,
        newStatus: status,
        updatedBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: {
          order_id: orderId,
          status: updatedOrder.status
        }
      });
    } catch (error) {
      logger.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update order status'
        }
      });
    }
  }

  // Cancel order
  static async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const { user: currentUser } = req;

      const order = await dbHelpers.getDoc(collections.ORDERS, orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Order not found'
          }
        });
      }

      // Check if order can be cancelled
      if (['delivered', 'completed', 'cancelled'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order cannot be cancelled'
          }
        });
      }

      // Customers can only cancel their own orders
      if (currentUser.role === 'customer' && order.customer_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      // Customers can only cancel pending or confirmed orders
      if (currentUser.role === 'customer' && !['pending', 'confirmed'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order is already being prepared and cannot be cancelled'
          }
        });
      }

      await dbHelpers.updateDoc(collections.ORDERS, orderId, {
        status: 'cancelled',
        payment_status: 'refunded',
        cancelled_reason: reason,
        cancelled_by: currentUser.id,
        cancelled_at: new Date()
      });

      logger.info('Order cancelled', {
        orderId,
        cancelledBy: currentUser.id,
        reason
      });

      res.json({
        success: true,
        message: 'Order cancelled successfully'
      });
    } catch (error) {
      logger.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to cancel order'
        }
      });
    }
  }

  // Assign delivery person
  static async assignDelivery(req, res) {
    try {
      const { orderId } = req.params;
      const { delivery_person_id } = req.body;
      const { user: currentUser } = req;

      const order = await dbHelpers.getDoc(collections.ORDERS, orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Order not found'
          }
        });
      }

      if (order.order_type !== 'delivery') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order is not a delivery order'
          }
        });
      }

      // Verify delivery person exists and has correct role
      const deliveryPerson = await dbHelpers.getDoc(collections.USERS, delivery_person_id);
      if (!deliveryPerson || deliveryPerson.role !== 'delivery_boy') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid delivery person'
          }
        });
      }

      await dbHelpers.updateDoc(collections.ORDERS, orderId, {
        assigned_to: delivery_person_id,
        assigned_at: new Date(),
        assigned_by: currentUser.id
      });

      logger.info('Delivery person assigned', {
        orderId,
        deliveryPersonId: delivery_person_id,
        assignedBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Delivery person assigned successfully'
      });
    } catch (error) {
      logger.error('Assign delivery error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to assign delivery person'
        }
      });
    }
  }

  // Get order statistics
  static async getOrderStats(req, res) {
    try {
      const { outlet_id, date_from, date_to } = req.query;
      const { user: currentUser } = req;

      let queries = [];

      // Filter by outlet
      if (outlet_id) {
        queries.push({ type: 'where', field: 'outlet_id', operator: '==', value: outlet_id });
      } else if (currentUser.role !== 'super_admin') {
        // Get user's assigned outlets
        const assignments = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);
        
        if (assignments.length > 0) {
          queries.push({ type: 'where', field: 'outlet_id', operator: '==', value: assignments[0].outlet_id });
        }
      }

      const orders = await dbHelpers.getDocs(collections.ORDERS, queries);

      // Calculate statistics
      const stats = {
        total_orders: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        total_revenue: orders
          .filter(o => ['delivered', 'completed'].includes(o.status))
          .reduce((sum, o) => sum + o.total, 0),
        average_order_value: orders.length > 0 
          ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length 
          : 0
      };

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get order stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get order statistics'
        }
      });
    }
  }
}

module.exports = OrderController;