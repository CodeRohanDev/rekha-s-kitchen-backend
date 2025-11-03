const logger = require('../utils/logger');
const EmailService = require('./emailService');
const SMSService = require('./smsService');
const PushService = require('./pushService');

class NotificationService {
  // Send notification through multiple channels
  static async send(options) {
    const {
      userId,
      email,
      phone,
      channels,
      type,
      title,
      message,
      data,
      priority
    } = options;

    const results = {};

    // Send through each channel
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            if (email) {
              results.email = await EmailService.send({
                to: email,
                subject: title,
                body: message,
                type,
                data
              });
            } else {
              results.email = { success: false, error: 'No email address' };
            }
            break;

          case 'sms':
            if (phone) {
              results.sms = await SMSService.send({
                to: phone,
                message: `${title}: ${message}`,
                type
              });
            } else {
              results.sms = { success: false, error: 'No phone number' };
            }
            break;

          case 'push':
            results.push = await PushService.send({
              userId,
              title,
              body: message,
              data,
              priority
            });
            break;

          default:
            results[channel] = { success: false, error: 'Unknown channel' };
        }
      } catch (error) {
        logger.error(`Notification send error (${channel}):`, error);
        results[channel] = { success: false, error: error.message };
      }
    }

    return results;
  }

  // Send order notification
  static async sendOrderNotification(order, status) {
    const templates = {
      confirmed: {
        title: 'Order Confirmed',
        message: `Your order #${order.order_number} has been confirmed and is being prepared.`
      },
      preparing: {
        title: 'Order Being Prepared',
        message: `Your order #${order.order_number} is being prepared by our kitchen.`
      },
      ready: {
        title: 'Order Ready',
        message: `Your order #${order.order_number} is ready for ${order.order_type === 'pickup' ? 'pickup' : 'delivery'}!`
      },
      out_for_delivery: {
        title: 'Out for Delivery',
        message: `Your order #${order.order_number} is on its way!`
      },
      delivered: {
        title: 'Order Delivered',
        message: `Your order #${order.order_number} has been delivered. Enjoy your meal!`
      },
      cancelled: {
        title: 'Order Cancelled',
        message: `Your order #${order.order_number} has been cancelled.`
      }
    };

    const template = templates[status];
    if (!template) return;

    return await this.send({
      userId: order.customer_id,
      email: order.customer_email,
      phone: order.customer_phone,
      channels: ['push', 'email'],
      type: 'order_update',
      title: template.title,
      message: template.message,
      data: {
        order_id: order.id,
        order_number: order.order_number,
        status
      },
      priority: 'high'
    });
  }

  // Send loyalty notification
  static async sendLoyaltyNotification(userId, type, data) {
    const templates = {
      points_earned: {
        title: 'Points Earned!',
        message: `You earned ${data.points} points from your recent order!`
      },
      milestone_achieved: {
        title: 'Milestone Achieved! 🎉',
        message: `Congratulations! You've completed ${data.milestone} orders. Your free meal reward is ready!`
      },
      reward_expiring: {
        title: 'Reward Expiring Soon',
        message: `Your free meal reward expires in ${data.days} days. Don't miss out!`
      }
    };

    const template = templates[type];
    if (!template) return;

    return await this.send({
      userId,
      channels: ['push', 'email'],
      type: 'loyalty_reward',
      title: template.title,
      message: template.message,
      data,
      priority: 'normal'
    });
  }

  // Send review reminder
  static async sendReviewReminder(order) {
    return await this.send({
      userId: order.customer_id,
      channels: ['push'],
      type: 'review_reminder',
      title: 'How was your meal?',
      message: `We'd love to hear about your experience with order #${order.order_number}!`,
      data: {
        order_id: order.id,
        order_number: order.order_number
      },
      priority: 'low'
    });
  }

  // Send promotional notification
  static async sendPromotion(userId, promotion) {
    return await this.send({
      userId,
      channels: ['push', 'email'],
      type: 'promotional',
      title: promotion.title,
      message: promotion.message,
      data: promotion.data || {},
      priority: 'low'
    });
  }
}

module.exports = NotificationService;