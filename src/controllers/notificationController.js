const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');
const NotificationService = require('../services/notificationService');

class NotificationController {
  // Send notification
  static async sendNotification(req, res) {
    try {
      const {
        user_id,
        type,
        channels,
        title,
        message,
        data,
        priority
      } = req.body;
      const { user: currentUser } = req;

      // Get user details
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

      const profile = await dbHelpers.getDoc(collections.USER_PROFILES, user_id);

      // Send notification through specified channels
      const results = await NotificationService.send({
        userId: user_id,
        email: user.email,
        phone: user.phone,
        channels: channels || ['push'],
        type,
        title,
        message,
        data: data || {},
        priority: priority || 'normal'
      });

      // Store notification in database
      const notificationData = {
        user_id,
        type,
        channels,
        title,
        message,
        data: data || {},
        priority: priority || 'normal',
        status: 'sent',
        sent_by: currentUser.id,
        delivery_status: results,
        read: false,
        read_at: null
      };

      const notification = await dbHelpers.createDoc(collections.NOTIFICATIONS, notificationData);

      logger.info('Notification sent', {
        notificationId: notification.id,
        userId: user_id,
        type,
        channels
      });

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: {
          notification_id: notification.id,
          delivery_status: results
        }
      });
    } catch (error) {
      logger.error('Send notification error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to send notification'
        }
      });
    }
  }

  // Get user notifications
  static async getUserNotifications(req, res) {
    try {
      const { user: currentUser } = req;
      const { unread_only, type, page = 1, limit = 20 } = req.query;

      let queries = [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ];

      if (unread_only === 'true') {
        queries.push({ type: 'where', field: 'read', operator: '==', value: false });
      }

      if (type) {
        queries.push({ type: 'where', field: 'type', operator: '==', value: type });
      }

      const notifications = await dbHelpers.getDocs(
        collections.NOTIFICATIONS,
        queries,
        { field: 'created_at', direction: 'desc' },
        parseInt(limit)
      );

      // Count unread
      const unreadNotifications = await dbHelpers.getDocs(collections.NOTIFICATIONS, [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id },
        { type: 'where', field: 'read', operator: '==', value: false }
      ]);

      res.json({
        success: true,
        data: {
          notifications,
          unread_count: unreadNotifications.length,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: notifications.length
          }
        }
      });
    } catch (error) {
      logger.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get notifications'
        }
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const { user: currentUser } = req;

      const notification = await dbHelpers.getDoc(collections.NOTIFICATIONS, notificationId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Notification not found'
          }
        });
      }

      if (notification.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      await dbHelpers.updateDoc(collections.NOTIFICATIONS, notificationId, {
        read: true,
        read_at: new Date()
      });

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      logger.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark notification as read'
        }
      });
    }
  }

  // Mark all as read
  static async markAllAsRead(req, res) {
    try {
      const { user: currentUser } = req;

      const unreadNotifications = await dbHelpers.getDocs(collections.NOTIFICATIONS, [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id },
        { type: 'where', field: 'read', operator: '==', value: false }
      ]);

      for (const notification of unreadNotifications) {
        await dbHelpers.updateDoc(collections.NOTIFICATIONS, notification.id, {
          read: true,
          read_at: new Date()
        });
      }

      res.json({
        success: true,
        message: `${unreadNotifications.length} notifications marked as read`
      });
    } catch (error) {
      logger.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark notifications as read'
        }
      });
    }
  }

  // Delete notification
  static async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const { user: currentUser } = req;

      const notification = await dbHelpers.getDoc(collections.NOTIFICATIONS, notificationId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Notification not found'
          }
        });
      }

      if (notification.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }

      await dbHelpers.deleteDoc(collections.NOTIFICATIONS, notificationId);

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      logger.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete notification'
        }
      });
    }
  }

  // Get notification preferences
  static async getPreferences(req, res) {
    try {
      const { user: currentUser } = req;

      const preferences = await dbHelpers.getDocs(collections.NOTIFICATION_PREFERENCES, [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ]);

      if (preferences.length === 0) {
        // Return default preferences
        return res.json({
          success: true,
          data: {
            preferences: NotificationController.getDefaultPreferences(currentUser.id)
          }
        });
      }

      res.json({
        success: true,
        data: {
          preferences: preferences[0]
        }
      });
    } catch (error) {
      logger.error('Get preferences error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get preferences'
        }
      });
    }
  }

  // Update notification preferences
  static async updatePreferences(req, res) {
    try {
      const { user: currentUser } = req;
      const { preferences } = req.body;

      const existingPreferences = await dbHelpers.getDocs(collections.NOTIFICATION_PREFERENCES, [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ]);

      let updated;
      if (existingPreferences.length > 0) {
        updated = await dbHelpers.updateDoc(
          collections.NOTIFICATION_PREFERENCES,
          existingPreferences[0].id,
          preferences
        );
      } else {
        updated = await dbHelpers.createDoc(collections.NOTIFICATION_PREFERENCES, {
          user_id: currentUser.id,
          ...preferences
        });
      }

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: { preferences: updated }
      });
    } catch (error) {
      logger.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update preferences'
        }
      });
    }
  }

  // Get default preferences
  static getDefaultPreferences(userId) {
    return {
      user_id: userId,
      order_updates: {
        push: true,
        email: true,
        sms: false
      },
      promotional: {
        push: true,
        email: true,
        sms: false
      },
      loyalty_rewards: {
        push: true,
        email: true,
        sms: false
      },
      review_reminders: {
        push: true,
        email: false,
        sms: false
      },
      general: {
        push: true,
        email: true,
        sms: false
      }
    };
  }

  // Send bulk notifications (Admin)
  static async sendBulkNotifications(req, res) {
    try {
      const {
        user_ids,
        type,
        channels,
        title,
        message,
        data
      } = req.body;
      const { user: currentUser } = req;

      const results = [];

      for (const userId of user_ids) {
        try {
          const user = await dbHelpers.getDoc(collections.USERS, userId);
          if (!user) continue;

          const result = await NotificationService.send({
            userId,
            email: user.email,
            phone: user.phone,
            channels: channels || ['push'],
            type,
            title,
            message,
            data: data || {},
            priority: 'normal'
          });

          // Store notification
          await dbHelpers.createDoc(collections.NOTIFICATIONS, {
            user_id: userId,
            type,
            channels,
            title,
            message,
            data: data || {},
            priority: 'normal',
            status: 'sent',
            sent_by: currentUser.id,
            delivery_status: result,
            read: false
          });

          results.push({ userId, success: true });
        } catch (error) {
          results.push({ userId, success: false, error: error.message });
        }
      }

      logger.info('Bulk notifications sent', {
        totalUsers: user_ids.length,
        sentBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Bulk notifications sent',
        data: {
          total: user_ids.length,
          results
        }
      });
    } catch (error) {
      logger.error('Send bulk notifications error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to send bulk notifications'
        }
      });
    }
  }

  // Get notification statistics (Admin)
  static async getStatistics(req, res) {
    try {
      const { date_from, date_to } = req.query;

      let queries = [];
      if (date_from) {
        queries.push({ type: 'where', field: 'created_at', operator: '>=', value: new Date(date_from) });
      }
      if (date_to) {
        queries.push({ type: 'where', field: 'created_at', operator: '<=', value: new Date(date_to) });
      }

      const notifications = await dbHelpers.getDocs(collections.NOTIFICATIONS, queries);

      const stats = {
        total_sent: notifications.length,
        by_type: {},
        by_channel: {},
        read_count: notifications.filter(n => n.read).length,
        unread_count: notifications.filter(n => !n.read).length,
        read_rate: notifications.length > 0 
          ? ((notifications.filter(n => n.read).length / notifications.length) * 100).toFixed(2) + '%'
          : '0%'
      };

      // Count by type
      notifications.forEach(n => {
        stats.by_type[n.type] = (stats.by_type[n.type] || 0) + 1;
        n.channels.forEach(channel => {
          stats.by_channel[channel] = (stats.by_channel[channel] || 0) + 1;
        });
      });

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get statistics'
        }
      });
    }
  }
}

module.exports = NotificationController;