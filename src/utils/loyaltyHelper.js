const { dbHelpers, collections } = require('../config/database');
const logger = require('./logger');

class LoyaltyHelper {
  // Process loyalty when order is completed
  static async processOrderLoyalty(orderId, userId, orderTotal) {
    try {
      // Get user's loyalty account
      const accounts = await dbHelpers.getDocs(collections.USER_LOYALTY_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: userId }
      ]);

      if (accounts.length === 0) {
        logger.info('No loyalty account found for user', { userId });
        return;
      }

      const account = accounts[0];

      // Get program configuration
      const programs = await dbHelpers.getDocs(collections.LOYALTY_PROGRAMS, [
        { type: 'where', field: 'program_type', operator: '==', value: 'milestone' }
      ]);

      if (programs.length === 0 || !programs[0].is_active) {
        logger.info('Milestone program not found or inactive');
        return;
      }

      const program = programs[0];
      await this.processMilestoneProgram(account, program, orderId, userId);
    } catch (error) {
      logger.error('Process order loyalty error:', error);
    }
  }

  // Process milestone program
  static async processMilestoneProgram(account, program, orderId, userId) {
    const milestoneInterval = program.config.milestone_interval || 10;
    const newProgress = (account.milestone_program.current_milestone_progress || 0) + 1;
    const newTotalOrders = (account.milestone_program.total_orders_completed || 0) + 1;

    // Check if milestone achieved
    const milestoneAchieved = newProgress >= milestoneInterval;

    const updateData = {
      'milestone_program.total_orders_completed': newTotalOrders,
      'milestone_program.current_milestone_progress': milestoneAchieved ? 0 : newProgress,
      'milestone_program.last_order_at': new Date()
    };

    if (milestoneAchieved) {
      updateData['milestone_program.total_milestones_achieved'] = (account.milestone_program.total_milestones_achieved || 0) + 1;
      updateData['milestone_program.next_milestone_at'] = milestoneInterval;

      // Create milestone reward
      await this.createMilestoneReward(userId, program, newTotalOrders);
    }

    await dbHelpers.updateDoc(collections.USER_LOYALTY_ACCOUNTS, account.id, updateData);

    // Record transaction
    await dbHelpers.createDoc(collections.LOYALTY_TRANSACTIONS, {
      user_id: userId,
      program_type: 'milestone',
      type: milestoneAchieved ? 'milestone_achieved' : 'progress',
      milestone_progress_before: newProgress - 1,
      milestone_progress_after: milestoneAchieved ? 0 : newProgress,
      milestone_achieved: milestoneAchieved,
      order_id: orderId,
      description: milestoneAchieved 
        ? `Milestone achieved! Free meal reward created` 
        : `Order counted: ${newProgress}/${milestoneInterval}`
    });

    logger.info('Milestone progress updated', {
      userId,
      progress: newProgress,
      milestoneAchieved,
      orderId
    });
  }

  // Create milestone reward
  static async createMilestoneReward(userId, program, milestoneNumber) {
    const rewardConfig = program.config.reward_items || [];
    
    // Set expiry (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const rewardData = {
      user_id: userId,
      milestone_number: milestoneNumber,
      status: 'available',
      reward_details: {
        type: 'free_meal',
        items: rewardConfig,
        description: 'Free full meal - Congratulations on your milestone!'
      },
      earned_at: new Date(),
      expires_at: expiresAt
    };

    const reward = await dbHelpers.createDoc(collections.MILESTONE_REWARDS, rewardData);

    logger.info('Milestone reward created', {
      userId,
      rewardId: reward.id,
      milestoneNumber
    });

    return reward;
  }
}

module.exports = LoyaltyHelper;
