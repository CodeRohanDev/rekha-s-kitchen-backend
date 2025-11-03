const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');

class DeliveryController {
  // ===== PUBLIC ENDPOINTS =====

  // Calculate delivery fee for customer
  static async calculateDeliveryFee(req, res) {
    try {
      const { order_value, distance_km, outlet_id } = req.body;

      // Get active fee configuration
      const configs = await dbHelpers.getDocs(collections.DELIVERY_FEE_CONFIG, [
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);

      if (configs.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'No active delivery fee configuration found'
          }
        });
      }

      const config = configs[0];
      const result = DeliveryController.calculateFee(order_value, distance_km, config);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Calculate delivery fee error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to calculate delivery fee'
        }
      });
    }
  }

  // Get delivery fee structure (public)
  static async getFeeStructure(req, res) {
    try {
      const configs = await dbHelpers.getDocs(collections.DELIVERY_FEE_CONFIG, [
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);

      if (configs.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'No active delivery fee configuration found'
          }
        });
      }

      res.json({
        success: true,
        data: {
          config: configs[0]
        }
      });
    } catch (error) {
      logger.error('Get fee structure error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get fee structure'
        }
      });
    }
  }

  // ===== ADMIN ENDPOINTS =====

  // Get delivery fee configuration
  static async getFeeConfig(req, res) {
    try {
      const configs = await dbHelpers.getDocs(collections.DELIVERY_FEE_CONFIG);

      res.json({
        success: true,
        data: { configs }
      });
    } catch (error) {
      logger.error('Get fee config error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get fee configuration'
        }
      });
    }
  }

  // Update delivery fee configuration
  static async updateFeeConfig(req, res) {
    try {
      const { name, description, is_active, tiers } = req.body;
      const { user: currentUser } = req;

      // Deactivate all existing configs if this one is active
      if (is_active) {
        const existingConfigs = await dbHelpers.getDocs(collections.DELIVERY_FEE_CONFIG, [
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);

        for (const config of existingConfigs) {
          await dbHelpers.updateDoc(collections.DELIVERY_FEE_CONFIG, config.id, {
            is_active: false
          });
        }
      }

      // Create new configuration
      const configData = {
        name,
        description,
        is_active,
        tiers,
        created_by: currentUser.id,
        created_at: new Date()
      };

      const config = await dbHelpers.createDoc(collections.DELIVERY_FEE_CONFIG, configData);

      logger.info('Delivery fee config updated', {
        configId: config.id,
        updatedBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Delivery fee configuration updated successfully',
        data: { config }
      });
    } catch (error) {
      logger.error('Update fee config error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update fee configuration'
        }
      });
    }
  }

  // Get payout configuration
  static async getPayoutConfig(req, res) {
    try {
      const configs = await dbHelpers.getDocs(collections.DELIVERY_PAYOUT_CONFIG);

      res.json({
        success: true,
        data: { configs }
      });
    } catch (error) {
      logger.error('Get payout config error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get payout configuration'
        }
      });
    }
  }

  // Update payout configuration
  static async updatePayoutConfig(req, res) {
    try {
      const { name, description, is_active, tiers } = req.body;
      const { user: currentUser } = req;

      // Deactivate all existing configs if this one is active
      if (is_active) {
        const existingConfigs = await dbHelpers.getDocs(collections.DELIVERY_PAYOUT_CONFIG, [
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);

        for (const config of existingConfigs) {
          await dbHelpers.updateDoc(collections.DELIVERY_PAYOUT_CONFIG, config.id, {
            is_active: false
          });
        }
      }

      // Create new configuration
      const configData = {
        name,
        description,
        is_active,
        tiers,
        created_by: currentUser.id,
        created_at: new Date()
      };

      const config = await dbHelpers.createDoc(collections.DELIVERY_PAYOUT_CONFIG, configData);

      logger.info('Delivery payout config updated', {
        configId: config.id,
        updatedBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Delivery payout configuration updated successfully',
        data: { config }
      });
    } catch (error) {
      logger.error('Update payout config error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update payout configuration'
        }
      });
    }
  }

  // Get global payout schedule
  static async getGlobalSchedule(req, res) {
    try {
      const schedules = await dbHelpers.getDocs(collections.PAYOUT_SCHEDULES, [
        { type: 'where', field: 'applies_to', operator: '==', value: 'all' },
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);

      res.json({
        success: true,
        data: {
          schedule: schedules.length > 0 ? schedules[0] : null
        }
      });
    } catch (error) {
      logger.error('Get global schedule error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get global schedule'
        }
      });
    }
  }

  // Update global payout schedule
  static async updateGlobalSchedule(req, res) {
    try {
      const { schedule_type, day_of_week, day_of_month, custom_days, time, is_active } = req.body;
      const { user: currentUser } = req;

      // Deactivate existing global schedule
      const existingSchedules = await dbHelpers.getDocs(collections.PAYOUT_SCHEDULES, [
        { type: 'where', field: 'applies_to', operator: '==', value: 'all' }
      ]);

      for (const schedule of existingSchedules) {
        await dbHelpers.updateDoc(collections.PAYOUT_SCHEDULES, schedule.id, {
          is_active: false
        });
      }

      // Create new global schedule
      const scheduleData = {
        schedule_type,
        day_of_week: day_of_week || null,
        day_of_month: day_of_month || null,
        custom_days: custom_days || null,
        time,
        is_active,
        applies_to: 'all',
        created_by: currentUser.id,
        created_at: new Date()
      };

      const schedule = await dbHelpers.createDoc(collections.PAYOUT_SCHEDULES, scheduleData);

      logger.info('Global payout schedule updated', {
        scheduleId: schedule.id,
        scheduleType: schedule_type,
        updatedBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Global payout schedule updated successfully',
        data: { schedule }
      });
    } catch (error) {
      logger.error('Update global schedule error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update global schedule'
        }
      });
    }
  }

  // Get individual payout schedules
  static async getIndividualSchedules(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const schedules = await dbHelpers.getDocs(
        collections.PAYOUT_SCHEDULES,
        [
          { type: 'where', field: 'applies_to', operator: '==', value: 'individual' },
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ],
        { field: 'created_at', direction: 'desc' },
        parseInt(limit)
      );

      // Get user details for each schedule
      const schedulesWithUsers = await Promise.all(
        schedules.map(async (schedule) => {
          const user = await dbHelpers.getDoc(collections.USERS, schedule.user_id);
          return {
            ...schedule,
            user_info: user ? {
              id: user.id,
              name: `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim(),
              email: user.email,
              phone: user.phone
            } : null
          };
        })
      );

      res.json({
        success: true,
        data: {
          schedules: schedulesWithUsers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: schedulesWithUsers.length
          }
        }
      });
    } catch (error) {
      logger.error('Get individual schedules error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get individual schedules'
        }
      });
    }
  }

  // Set individual payout schedule
  static async setIndividualSchedule(req, res) {
    try {
      const { user_id, schedule_type, day_of_week, day_of_month, custom_days, time, overrides_global, is_active } = req.body;
      const { user: currentUser } = req;

      // Check if user exists and is a delivery partner
      const user = await dbHelpers.getDoc(collections.USERS, user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      if (user.role !== 'delivery_boy') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User must be a delivery partner'
          }
        });
      }

      // Deactivate existing individual schedule for this user
      const existingSchedules = await dbHelpers.getDocs(collections.PAYOUT_SCHEDULES, [
        { type: 'where', field: 'user_id', operator: '==', value: user_id },
        { type: 'where', field: 'applies_to', operator: '==', value: 'individual' }
      ]);

      for (const schedule of existingSchedules) {
        await dbHelpers.updateDoc(collections.PAYOUT_SCHEDULES, schedule.id, {
          is_active: false
        });
      }

      // Create new individual schedule
      const scheduleData = {
        user_id,
        schedule_type,
        day_of_week: day_of_week || null,
        day_of_month: day_of_month || null,
        custom_days: custom_days || null,
        time,
        is_active,
        applies_to: 'individual',
        overrides_global,
        created_by: currentUser.id,
        created_at: new Date()
      };

      const schedule = await dbHelpers.createDoc(collections.PAYOUT_SCHEDULES, scheduleData);

      logger.info('Individual payout schedule set', {
        scheduleId: schedule.id,
        userId: user_id,
        scheduleType: schedule_type,
        setBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Individual payout schedule set successfully',
        data: { schedule }
      });
    } catch (error) {
      logger.error('Set individual schedule error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to set individual schedule'
        }
      });
    }
  }

  // Delete individual payout schedule
  static async deleteIndividualSchedule(req, res) {
    try {
      const { scheduleId } = req.params;
      const { user: currentUser } = req;

      const schedule = await dbHelpers.getDoc(collections.PAYOUT_SCHEDULES, scheduleId);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Schedule not found'
          }
        });
      }

      if (schedule.applies_to !== 'individual') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cannot delete global schedule using this endpoint'
          }
        });
      }

      await dbHelpers.updateDoc(collections.PAYOUT_SCHEDULES, scheduleId, {
        is_active: false,
        deleted_at: new Date(),
        deleted_by: currentUser.id
      });

      logger.info('Individual schedule deleted', {
        scheduleId,
        userId: schedule.user_id,
        deletedBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Individual schedule deleted. User will follow global schedule.'
      });
    } catch (error) {
      logger.error('Delete individual schedule error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete schedule'
        }
      });
    }
  }

  // ===== HELPER METHODS =====

  // Calculate delivery fee based on configuration
  static calculateFee(orderValue, distanceKm, config) {
    let deliveryFee = 0;
    let breakdown = {
      tier: '',
      base_fee: 0,
      distance_fee: 0,
      discount: 0,
      calculation: ''
    };

    // Find applicable tier
    for (const tier of config.tiers) {
      if (distanceKm >= tier.distance_min && distanceKm <= tier.distance_max) {
        breakdown.tier = tier.tier_name;

        // Find applicable bracket
        for (const bracket of tier.brackets) {
          const orderMin = bracket.order_min;
          const orderMax = bracket.order_max || Infinity;

          if (orderValue >= orderMin && orderValue < orderMax) {
            const baseFee = bracket.base_fee || 0;
            const perKmFee = bracket.per_km_fee || 0;
            const discountPercent = bracket.discount_percent || 0;

            breakdown.base_fee = baseFee;

            if (distanceKm > tier.distance_min) {
              const extraDistance = distanceKm - tier.distance_min;
              breakdown.distance_fee = extraDistance * perKmFee;
            }

            deliveryFee = breakdown.base_fee + breakdown.distance_fee;

            if (discountPercent > 0) {
              breakdown.discount = deliveryFee * (discountPercent / 100);
              deliveryFee = deliveryFee - breakdown.discount;
            }

            // Build calculation string
            if (breakdown.distance_fee > 0) {
              breakdown.calculation = `₹${baseFee} + (${distanceKm} - ${tier.distance_min}) × ₹${perKmFee}`;
              if (discountPercent > 0) {
                breakdown.calculation += ` × ${100 - discountPercent}%`;
              }
              breakdown.calculation += ` = ₹${deliveryFee.toFixed(2)}`;
            } else {
              breakdown.calculation = `₹${deliveryFee.toFixed(2)} (flat fee)`;
            }

            break;
          }
        }
        break;
      }
    }

    // Find free delivery threshold
    let freeDeliveryAt = null;
    for (const tier of config.tiers) {
      for (const bracket of tier.brackets) {
        if (bracket.base_fee === 0 && bracket.per_km_fee === 0) {
          freeDeliveryAt = bracket.order_min;
          break;
        }
      }
      if (freeDeliveryAt) break;
    }

    return {
      order_value: orderValue,
      distance_km: distanceKm,
      delivery_fee: Math.round(deliveryFee * 100) / 100,
      breakdown,
      free_delivery_at: freeDeliveryAt
    };
  }

  // Calculate delivery partner payout
  static calculatePayout(distanceKm, config) {
    let payout = 0;

    for (const tier of config.tiers) {
      if (distanceKm >= tier.distance_min && distanceKm <= tier.distance_max) {
        const basePayout = tier.base_payout || 0;
        const perKmPayout = tier.per_km_payout || 0;

        payout = basePayout;

        if (distanceKm > tier.distance_min) {
          const extraDistance = distanceKm - tier.distance_min;
          payout += extraDistance * perKmPayout;
        }

        break;
      }
    }

    return Math.round(payout * 100) / 100;
  }
}

module.exports = DeliveryController;
