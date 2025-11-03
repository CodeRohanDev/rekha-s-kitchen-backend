const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schemas
const schemas = {
    // User registration/login schemas
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).required(),
        first_name: Joi.string().min(2).max(50).required(),
        last_name: Joi.string().min(2).max(50).required(),
        role: Joi.string().valid('customer').default('customer')
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    // Staff creation schema
    createStaff: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).required(),
        first_name: Joi.string().min(2).max(50).required(),
        last_name: Joi.string().min(2).max(50).required(),
        role: Joi.string().valid('outlet_admin', 'kitchen_staff', 'delivery_boy').required(),
        outlet_id: Joi.string().required(),
        shift_hours: Joi.object({
            start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
            end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
        }).optional()
    }),

    // Create super admin (Development only)
    createSuperAdmin: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).required(),
        first_name: Joi.string().min(2).max(50).required(),
        last_name: Joi.string().min(2).max(50).required(),
        secret_key: Joi.string().valid('REKHAS_KITCHEN_SUPER_ADMIN_2024').required()
    }),

    // Profile update schema
    updateProfile: Joi.object({
        first_name: Joi.string().min(2).max(50).optional(),
        last_name: Joi.string().min(2).max(50).optional(),
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).optional(),
        avatar_url: Joi.string().allow('', null).optional(),
        date_of_birth: Joi.date().optional(),
        preferences: Joi.object().optional()
    }),

    // Address schema (for customer delivery addresses)
    address: Joi.object({
        type: Joi.string().valid('home', 'work', 'other').default('home'),
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip_code: Joi.string().required(),
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).optional(),
        is_default: Joi.boolean().default(false),
        is_for_someone_else: Joi.boolean().default(false),
        receiver_name: Joi.string().min(2).max(100).when('is_for_someone_else', {
            is: true,
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        receiver_phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).when('is_for_someone_else', {
            is: true,
            then: Joi.required(),
            otherwise: Joi.optional()
        })
    }),

    // Outlet schema
    outlet: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zip_code: Joi.string().required()
        }).required(),
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).required(),
        email: Joi.string().email().required(),
        coordinates: Joi.object({
            latitude: Joi.number().min(-90).max(90).required(),
            longitude: Joi.number().min(-180).max(180).required()
        }).optional(),
        service_radius: Joi.number().min(1).max(50).optional(),
        avg_preparation_time: Joi.number().integer().min(1).optional(),
        operating_hours: Joi.object({
            monday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }).required(),
            tuesday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }).required(),
            wednesday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }).required(),
            thursday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }).required(),
            friday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }).required(),
            saturday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }).required(),
            sunday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }).required()
        }).required()
    }),

    // Outlet update schema
    outletUpdate: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zip_code: Joi.string().required()
        }).optional(),
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).optional(),
        email: Joi.string().email().optional(),
        coordinates: Joi.object({
            latitude: Joi.number().min(-90).max(90).required(),
            longitude: Joi.number().min(-180).max(180).required()
        }).optional(),
        service_radius: Joi.number().min(1).max(50).optional(),
        avg_preparation_time: Joi.number().integer().min(1).optional(),
        operating_hours: Joi.object({
            monday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }),
            tuesday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }),
            wednesday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }),
            thursday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }),
            friday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }),
            saturday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() }),
            sunday: Joi.object({ open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), is_closed: Joi.boolean() })
        }).optional(),
        is_active: Joi.boolean().optional(),
        is_accepting_orders: Joi.boolean().optional()
    }),

    // Menu category schema
    menuCategory: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).required(),
        display_order: Joi.number().integer().min(0).default(0),
        is_active: Joi.boolean().default(true)
    }),

    // Menu category update schema
    menuCategoryUpdate: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        description: Joi.string().max(500).optional(),
        display_order: Joi.number().integer().min(0).optional(),
        is_active: Joi.boolean().optional()
    }),

    // Menu item schema
    menuItem: Joi.object({
        category_id: Joi.string().required(),
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).required(),
        price: Joi.number().positive().required(),
        is_vegetarian: Joi.boolean().default(false),
        is_vegan: Joi.boolean().default(false),
        is_gluten_free: Joi.boolean().default(false),
        spice_level: Joi.string().valid('mild', 'medium', 'hot', 'extra_hot').default('mild'),
        preparation_time: Joi.number().integer().min(1).required(),
        ingredients: Joi.array().items(Joi.string()).optional(),
        nutritional_info: Joi.object({
            calories: Joi.number().optional(),
            protein: Joi.number().optional(),
            carbs: Joi.number().optional(),
            fat: Joi.number().optional(),
            fiber: Joi.number().optional(),
            sugar: Joi.number().optional()
        }).optional(),
        image_url: Joi.string().uri().allow('', null).optional(),
        is_available: Joi.boolean().default(true),
        outlet_specific: Joi.boolean().default(false),
        outlet_ids: Joi.array().items(Joi.string()).optional()
    }),

    // Menu item update schema
    menuItemUpdate: Joi.object({
        category_id: Joi.string().optional(),
        name: Joi.string().min(2).max(100).optional(),
        description: Joi.string().max(500).optional(),
        price: Joi.number().positive().optional(),
        is_vegetarian: Joi.boolean().optional(),
        is_vegan: Joi.boolean().optional(),
        is_gluten_free: Joi.boolean().optional(),
        spice_level: Joi.string().valid('mild', 'medium', 'hot', 'extra_hot').optional(),
        preparation_time: Joi.number().integer().min(1).optional(),
        ingredients: Joi.array().items(Joi.string()).optional(),
        nutritional_info: Joi.object({
            calories: Joi.number().optional(),
            protein: Joi.number().optional(),
            carbs: Joi.number().optional(),
            fat: Joi.number().optional(),
            fiber: Joi.number().optional(),
            sugar: Joi.number().optional()
        }).optional(),
        image_url: Joi.string().uri().allow('', null).optional(),
        is_available: Joi.boolean().optional(),
        is_active: Joi.boolean().optional(),
        outlet_specific: Joi.boolean().optional(),
        outlet_ids: Joi.array().items(Joi.string()).optional()
    }),

    // Toggle availability schema
    toggleAvailability: Joi.object({
        is_available: Joi.boolean().required()
    }),

    // Order schema
    order: Joi.object({
        outlet_id: Joi.string().required(),
        order_type: Joi.string().valid('delivery', 'pickup').required(),
        delivery_address: Joi.when('order_type', {
            is: 'delivery',
            then: Joi.object({
                street: Joi.string().required(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                zip_code: Joi.string().required(),
                latitude: Joi.number().min(-90).max(90).required(),
                longitude: Joi.number().min(-180).max(180).required(),
                phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).required()
            }).required(),
            otherwise: Joi.optional()
        }),
        items: Joi.array().items(
            Joi.object({
                menu_item_id: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
                special_instructions: Joi.string().max(200).optional()
            })
        ).min(1).required(),
        payment_method: Joi.string().valid('card', 'cash', 'upi', 'wallet').required(),
        coupon_code: Joi.string().optional(),
        special_instructions: Joi.string().max(500).optional()
    }),

    // Update order status schema
    updateOrderStatus: Joi.object({
        status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled').required(),
        notes: Joi.string().max(500).optional()
    }),

    // Cancel order schema
    cancelOrder: Joi.object({
        reason: Joi.string().max(500).required()
    }),

    // Assign delivery schema
    assignDelivery: Joi.object({
        delivery_person_id: Joi.string().required()
    }),

    // Coupon schema
    coupon: Joi.object({
        code: Joi.string().min(3).max(20).uppercase().required(),
        description: Joi.string().max(500).required(),
        discount_type: Joi.string().valid('percentage', 'fixed').required(),
        discount_value: Joi.number().positive().required(),
        min_order_value: Joi.number().min(0).allow(null).optional(),
        max_discount: Joi.number().positive().allow(null).optional(),
        usage_limit: Joi.number().integer().min(1).allow(null).optional(),
        usage_per_user: Joi.number().integer().min(1).default(1),
        valid_from: Joi.date().allow(null).optional(),
        valid_until: Joi.date().allow(null).optional(),
        applicable_outlets: Joi.array().items(Joi.string()).allow(null).optional(),
        applicable_items: Joi.array().items(Joi.string()).allow(null).optional(),
        applicable_categories: Joi.array().items(Joi.string()).allow(null).optional(),
        first_order_only: Joi.boolean().default(false),
        is_active: Joi.boolean().default(true)
    }),

    // Coupon update schema
    couponUpdate: Joi.object({
        code: Joi.string().min(3).max(20).uppercase().optional(),
        description: Joi.string().max(500).optional(),
        discount_type: Joi.string().valid('percentage', 'fixed').optional(),
        discount_value: Joi.number().positive().optional(),
        min_order_value: Joi.number().min(0).allow(null).optional(),
        max_discount: Joi.number().positive().allow(null).optional(),
        usage_limit: Joi.number().integer().min(1).allow(null).optional(),
        usage_per_user: Joi.number().integer().min(1).optional(),
        valid_from: Joi.date().allow(null).optional(),
        valid_until: Joi.date().allow(null).optional(),
        applicable_outlets: Joi.array().items(Joi.string()).allow(null).optional(),
        applicable_items: Joi.array().items(Joi.string()).allow(null).optional(),
        applicable_categories: Joi.array().items(Joi.string()).allow(null).optional(),
        first_order_only: Joi.boolean().optional(),
        is_active: Joi.boolean().optional()
    }),

    // Validate coupon schema
    validateCoupon: Joi.object({
        code: Joi.string().required(),
        outlet_id: Joi.string().required(),
        order_total: Joi.number().positive().required(),
        items: Joi.array().items(
            Joi.object({
                menu_item_id: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required()
            })
        ).min(1).required()
    }),

    // Review schema
    review: Joi.object({
        order_id: Joi.string().required(),
        rating: Joi.number().integer().min(1).max(5).required(),
        comment: Joi.string().max(1000).optional(),
        food_rating: Joi.number().integer().min(1).max(5).optional(),
        delivery_rating: Joi.number().integer().min(1).max(5).optional(),
        service_rating: Joi.number().integer().min(1).max(5).optional(),
        images: Joi.array().items(Joi.string().uri()).max(5).optional()
    }),

    // Review update schema
    reviewUpdate: Joi.object({
        rating: Joi.number().integer().min(1).max(5).optional(),
        comment: Joi.string().max(1000).optional(),
        food_rating: Joi.number().integer().min(1).max(5).optional(),
        delivery_rating: Joi.number().integer().min(1).max(5).optional(),
        service_rating: Joi.number().integer().min(1).max(5).optional(),
        images: Joi.array().items(Joi.string().uri()).max(5).optional()
    }),

    // Review response schema
    reviewResponse: Joi.object({
        response: Joi.string().max(500).required()
    }),

    // Report review schema
    reportReview: Joi.object({
        reason: Joi.string().max(500).required()
    }),

    // Loyalty program configuration schema
    loyaltyProgramConfig: Joi.object({
        program_type: Joi.string().valid('points', 'milestone').required(),
        name: Joi.string().min(3).max(100).required(),
        description: Joi.string().max(500).required(),
        is_active: Joi.boolean().default(true),
        is_default: Joi.boolean().default(false),
        config: Joi.object({
            // Points program config
            points_per_rupee: Joi.number().min(0).optional(),
            point_value: Joi.number().min(0).optional(),
            min_redemption_points: Joi.number().integer().min(0).optional(),
            max_redemption_percent: Joi.number().min(0).max(100).optional(),
            points_expiry_days: Joi.number().integer().min(0).optional(),
            // Milestone program config
            milestone_interval: Joi.number().integer().min(1).optional(),
            reward_items: Joi.array().items(
                Joi.object({
                    item_id: Joi.string().required(),
                    name: Joi.string().required(),
                    quantity: Joi.number().integer().min(1).required()
                })
            ).optional(),
            // Switching config
            switching_cooldown_days: Joi.number().integer().min(0).optional()
        }).required()
    }),

    // Toggle program schema
    toggleProgram: Joi.object({
        is_active: Joi.boolean().required()
    }),

    // Switch program schema
    switchProgram: Joi.object({
        program_type: Joi.string().valid('points', 'milestone').required()
    }),

    // Redeem points schema
    redeemPoints: Joi.object({
        points_to_redeem: Joi.number().integer().min(1).required(),
        order_id: Joi.string().required()
    }),

    // Claim milestone reward schema
    claimMilestoneReward: Joi.object({
        reward_id: Joi.string().required(),
        order_id: Joi.string().required()
    }),

    // Send notification schema
    sendNotification: Joi.object({
        user_id: Joi.string().required(),
        type: Joi.string().valid('order_update', 'promotional', 'loyalty_reward', 'review_reminder', 'general').required(),
        channels: Joi.array().items(Joi.string().valid('push', 'email', 'sms')).min(1).required(),
        title: Joi.string().max(100).required(),
        message: Joi.string().max(500).required(),
        data: Joi.object().optional(),
        priority: Joi.string().valid('low', 'normal', 'high').default('normal')
    }),

    // Send bulk notification schema
    sendBulkNotification: Joi.object({
        user_ids: Joi.array().items(Joi.string()).min(1).required(),
        type: Joi.string().valid('order_update', 'promotional', 'loyalty_reward', 'review_reminder', 'general').required(),
        channels: Joi.array().items(Joi.string().valid('push', 'email', 'sms')).min(1).required(),
        title: Joi.string().max(100).required(),
        message: Joi.string().max(500).required(),
        data: Joi.object().optional()
    }),

    // Notification preferences schema
    notificationPreferences: Joi.object({
        preferences: Joi.object({
            order_updates: Joi.object({
                push: Joi.boolean().required(),
                email: Joi.boolean().required(),
                sms: Joi.boolean().required()
            }).optional(),
            promotional: Joi.object({
                push: Joi.boolean().required(),
                email: Joi.boolean().required(),
                sms: Joi.boolean().required()
            }).optional(),
            loyalty_rewards: Joi.object({
                push: Joi.boolean().required(),
                email: Joi.boolean().required(),
                sms: Joi.boolean().required()
            }).optional(),
            review_reminders: Joi.object({
                push: Joi.boolean().required(),
                email: Joi.boolean().required(),
                sms: Joi.boolean().required()
            }).optional(),
            general: Joi.object({
                push: Joi.boolean().required(),
                email: Joi.boolean().required(),
                sms: Joi.boolean().required()
            }).optional()
        }).required()
    }),

    // Loyalty program schemas
    loyaltyProgramConfig: Joi.object({
        program_type: Joi.string().valid('points', 'milestone').required(),
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).optional(),
        is_active: Joi.boolean().default(true),
        is_default: Joi.boolean().default(false),
        config: Joi.object().required()
    }),

    toggleProgram: Joi.object({
        is_active: Joi.boolean().required()
    }),

    switchProgram: Joi.object({
        program_type: Joi.string().valid('points', 'milestone').required()
    }),

    redeemPoints: Joi.object({
        points_to_redeem: Joi.number().integer().min(1).required(),
        order_id: Joi.string().optional()
    }),

    claimMilestoneReward: Joi.object({
        reward_id: Joi.string().required(),
        order_id: Joi.string().optional()
    }),

    // Admin loyalty management schemas
    adjustUserPoints: Joi.object({
        points: Joi.number().integer().min(1).required(),
        type: Joi.string().valid('add', 'deduct').required(),
        reason: Joi.string().max(500).optional()
    }),

    enrollUser: Joi.object({
        program_type: Joi.string().valid('points', 'milestone').required()
    }),

    forceSwitchProgram: Joi.object({
        program_type: Joi.string().valid('points', 'milestone').required(),
        reason: Joi.string().max(500).optional()
    }),

    manageUserAccount: Joi.object({
        action: Joi.string().valid(
            'freeze_points',
            'unfreeze_points',
            'freeze_milestone',
            'unfreeze_milestone',
            'reset_points',
            'reset_milestone'
        ).required(),
        reason: Joi.string().max(500).optional()
    }),

    // Mobile OTP authentication schemas
    sendOTP: Joi.object({
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).required()
    }),

    verifyOTP: Joi.object({
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).required(),
        otp: Joi.string().length(6).pattern(/^\d+$/).required(),
        first_name: Joi.string().min(2).max(50).optional(),
        last_name: Joi.string().min(2).max(50).optional()
    }),

    resendOTP: Joi.object({
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).required()
    }),

    // Banner schemas
    banner: Joi.object({
        title: Joi.string().min(3).max(100).required(),
        subtitle: Joi.string().max(200).allow('').optional(),
        description: Joi.string().max(500).allow('').optional(),
        image_url: Joi.string().uri().required(),
        banner_type: Joi.string().valid('promotional', 'offer', 'announcement', 'seasonal').required(),
        action_type: Joi.string().valid('none', 'deep_link', 'menu_item', 'category', 'outlet', 'coupon', 'external_url').required(),
        action_data: Joi.object().optional(),
        target_audience: Joi.string().valid('all', 'new_users', 'loyal_customers', 'location_based').default('all'),
        applicable_outlets: Joi.array().items(Joi.string()).optional(),
        display_order: Joi.number().integer().min(0).default(0),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        is_active: Joi.boolean().default(true)
    }),

    bannerUpdate: Joi.object({
        title: Joi.string().min(3).max(100).optional(),
        subtitle: Joi.string().max(200).allow('').optional(),
        description: Joi.string().max(500).allow('').optional(),
        image_url: Joi.string().uri().optional(),
        banner_type: Joi.string().valid('promotional', 'offer', 'announcement', 'seasonal').optional(),
        action_type: Joi.string().valid('none', 'deep_link', 'menu_item', 'category', 'outlet', 'coupon', 'external_url').optional(),
        action_data: Joi.object().optional(),
        target_audience: Joi.string().valid('all', 'new_users', 'loyal_customers', 'location_based').optional(),
        applicable_outlets: Joi.array().items(Joi.string()).optional(),
        display_order: Joi.number().integer().min(0).optional(),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        is_active: Joi.boolean().optional()
    }),

    toggleBannerStatus: Joi.object({
        is_active: Joi.boolean().required()
    }),

    // Referral program schemas
    applyReferralCode: Joi.object({
        referral_code: Joi.string().length(6).uppercase().required()
    }),

    claimReferralReward: Joi.object({
        reward_id: Joi.string().required(),
        order_id: Joi.string().required()
    }),

    configureReferralProgram: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).required(),
        is_active: Joi.boolean().required(),
        config: Joi.object({
            referrals_per_reward: Joi.number().integer().min(1).max(20).required(),
            min_orders_for_qualification: Joi.number().integer().min(1).max(10).required(),
            reward_type: Joi.string().valid('free_meal', 'discount', 'cashback').required(),
            reward_value: Joi.number().positive().required(),
            reward_expiry_days: Joi.number().integer().min(1).max(365).required(),
            expiry_notification_days: Joi.number().integer().min(1).max(30).required(),
            reward_items: Joi.array().items(Joi.string()).optional(),
            max_active_rewards: Joi.number().integer().min(1).max(10).required(),
            max_pending_referrals: Joi.number().integer().min(1).max(100).optional(),
            referrer_min_orders: Joi.number().integer().min(0).optional(),
            referred_user_min_order_value: Joi.number().positive().optional()
        }).required()
    }),

    // Delivery system schemas
    calculateDeliveryFee: Joi.object({
        order_value: Joi.number().positive().required(),
        distance_km: Joi.number().min(0).max(15).required(),
        outlet_id: Joi.string().optional()
    }),

    updateDeliveryFeeConfig: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).optional(),
        is_active: Joi.boolean().required(),
        tiers: Joi.array().items(
            Joi.object({
                tier_name: Joi.string().required(),
                distance_min: Joi.number().min(0).required(),
                distance_max: Joi.number().min(0).required(),
                brackets: Joi.array().items(
                    Joi.object({
                        order_min: Joi.number().min(0).required(),
                        order_max: Joi.number().min(0).allow(null).optional(),
                        base_fee: Joi.number().min(0).required(),
                        per_km_fee: Joi.number().min(0).optional(),
                        discount_percent: Joi.number().min(0).max(100).optional()
                    })
                ).required()
            })
        ).required()
    }),

    updatePayoutConfig: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).optional(),
        is_active: Joi.boolean().required(),
        tiers: Joi.array().items(
            Joi.object({
                tier_name: Joi.string().required(),
                distance_min: Joi.number().min(0).required(),
                distance_max: Joi.number().min(0).required(),
                base_payout: Joi.number().min(0).required(),
                per_km_payout: Joi.number().min(0).optional()
            })
        ).required()
    }),

    updateGlobalSchedule: Joi.object({
        schedule_type: Joi.string().valid('daily', 'weekly', 'monthly', 'custom').required(),
        day_of_week: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').optional(),
        day_of_month: Joi.number().integer().min(-1).max(31).optional(),
        custom_days: Joi.array().items(Joi.number().integer().min(1).max(31)).optional(),
        time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
        is_active: Joi.boolean().required()
    }),

    setIndividualSchedule: Joi.object({
        user_id: Joi.string().required(),
        schedule_type: Joi.string().valid('daily', 'weekly', 'monthly', 'custom').required(),
        day_of_week: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').optional(),
        day_of_month: Joi.number().integer().min(-1).max(31).optional(),
        custom_days: Joi.array().items(Joi.number().integer().min(1).max(31)).optional(),
        time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
        overrides_global: Joi.boolean().required(),
        is_active: Joi.boolean().required()
    }),

    // FAQ schemas
    faq: Joi.object({
        question: Joi.string().min(10).max(500).required(),
        answer: Joi.string().min(10).max(2000).required(),
        category: Joi.string().valid('general', 'orders', 'payments', 'delivery', 'account', 'menu', 'loyalty', 'technical').default('general'),
        display_order: Joi.number().integer().min(0).default(0),
        is_active: Joi.boolean().default(true)
    }),

    faqUpdate: Joi.object({
        question: Joi.string().min(10).max(500).optional(),
        answer: Joi.string().min(10).max(2000).optional(),
        category: Joi.string().valid('general', 'orders', 'payments', 'delivery', 'account', 'menu', 'loyalty', 'technical').optional(),
        display_order: Joi.number().integer().min(0).optional(),
        is_active: Joi.boolean().optional()
    }),

    toggleFAQStatus: Joi.object({
        is_active: Joi.boolean().required()
    }),

    reorderFAQs: Joi.object({
        faq_orders: Joi.array().items(
            Joi.object({
                faq_id: Joi.string().required(),
                display_order: Joi.number().integer().min(0).required()
            })
        ).min(1).required()
    })
};

// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            logger.warn('Validation error:', { details, body: req.body });

            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details
                }
            });
        }

        req.body = value;
        next();
    };
};

// Query parameter validation
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid query parameters',
                    details
                }
            });
        }

        req.query = value;
        next();
    };
};

// Common query schemas
const querySchemas = {
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    }),

    dateRange: Joi.object({
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    }),

    orderFilters: Joi.object({
        status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled').optional(),
        outlet_id: Joi.string().optional(),
        order_type: Joi.string().valid('delivery', 'pickup').optional(),
        date_from: Joi.date().optional(),
        date_to: Joi.date().optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    }),

    menuItems: Joi.object({
        category_id: Joi.string().optional(),
        is_available: Joi.string().valid('true', 'false').optional(),
        is_vegetarian: Joi.string().valid('true', 'false').optional(),
        is_vegan: Joi.string().valid('true', 'false').optional(),
        spice_level: Joi.string().valid('mild', 'medium', 'hot', 'extra_hot').optional(),
        outlet_id: Joi.string().optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    }),

    referrals: Joi.object({
        status: Joi.string().valid('pending', 'qualified', 'completed').optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    })
};

module.exports = {
    validate,
    validateQuery,
    schemas,
    querySchemas
};