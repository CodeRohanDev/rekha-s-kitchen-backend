const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');

class ReferralService {
  // Check and update referral status when order is completed
  static async handleOrderCompletion(userId, orderId, orderTotal) {
    try {
      // Check if this user was referred by someone
      const referrals = await dbHelpers.getDocs(collections.REFERRALS, [
        { type: 'where', field: 'referred_user_id', operator: '==', value: userId },
        { type: 'where', field: 'status', operator: '==', value: 'pending' }
      ]);

      if (referrals.length === 0) {
        return; // User was not referred or already qualified
      }

      const referral = referrals[0];

      // Get referral program config
      const programs = await dbHelpers.getDocs(collections.REFERRAL_PROGRAMS, [
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);

      if (programs.length === 0) {
        return; // No active referral program
      }

      const program = programs[0];
      const config = program.config;

      // Check if order meets minimum value requirement
      if (orderTotal < (config.referred_user_min_order_value || 0)) {
        logger.info('Order does not meet minimum value for referral qualification', {
          userId,
          orderId,
          orderTotal,
          minRequired: config.referred_user_min_order_value
        });
        return;
      }

      // Update referral orders count
      const ordersCompleted = (referral.orders_completed || 0) + 1;
      const minOrders = config.min_orders_for_qualification || 1;

      // Check if referral is now qualified
      if (ordersCompleted >= minOrders && !referral.is_qualified) {
        // Mark referral as qualified
        await dbHelpers.updateDoc(collections.REFERRALS, referral.id, {
          orders_completed: ordersCompleted,
          is_qualified: true,
          qualified_at: new Date(),
          status: 'qualified'
        });

        logger.info('Referral qualified', {
          referralId: referral.id,
          referrerId: referral.referrer_user_id,
          referredUserId: userId
        });

        // Update referrer's account
        await ReferralService.updateReferrerProgress(referral.referrer_user_id, program);
      } else {
        // Just update orders count
        await dbHelpers.updateDoc(collections.REFERRALS, referral.id, {
          orders_completed: ordersCompleted
        });
      }
    } catch (error) {
      logger.error('Error handling referral order completion:', error);
      // Don't throw error - this is a background process
    }
  }

  // Update referrer's progress and check if they earned a reward
  static async updateReferrerProgress(referrerId, program) {
    try {
      // Get referrer's account
      const accounts = await dbHelpers.getDocs(collections.USER_REFERRAL_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: referrerId }
      ]);

      if (accounts.length === 0) {
        logger.warn('Referrer account not found', { referrerId });
        return;
      }

      const account = accounts[0];

      // Count successful referrals
      const qualifiedReferrals = await dbHelpers.getDocs(collections.REFERRALS, [
        { type: 'where', field: 'referrer_user_id', operator: '==', value: referrerId },
        { type: 'where', field: 'is_qualified', operator: '==', value: true }
      ]);

      const successfulReferrals = qualifiedReferrals.length;
      const referralsPerReward = program.config.referrals_per_reward || 5;
      const currentProgress = successfulReferrals % referralsPerReward;
      const totalRewardsEarned = Math.floor(successfulReferrals / referralsPerReward);

      // Update account
      await dbHelpers.updateDoc(collections.USER_REFERRAL_ACCOUNTS, account.id, {
        successful_referrals: successfulReferrals,
        pending_referrals: Math.max(0, (account.pending_referrals || 0) - 1),
        current_progress: currentProgress
      });

      // Check if user earned a new reward
      if (successfulReferrals > 0 && successfulReferrals % referralsPerReward === 0) {
        await ReferralService.createReward(referrerId, account.id, program);
      }
    } catch (error) {
      logger.error('Error updating referrer progress:', error);
    }
  }

  // Create a referral reward
  static async createReward(userId, accountId, program) {
    try {
      const config = program.config;

      // Check if user has reached max active rewards
      const activeRewards = await dbHelpers.getDocs(collections.REFERRAL_REWARDS, [
        { type: 'where', field: 'user_id', operator: '==', value: userId },
        { type: 'where', field: 'status', operator: '==', value: 'available' }
      ]);

      if (activeRewards.length >= (config.max_active_rewards || 3)) {
        logger.warn('User has reached max active rewards', {
          userId,
          activeRewards: activeRewards.length,
          maxAllowed: config.max_active_rewards
        });
        return;
      }

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (config.reward_expiry_days || 60));

      // Create reward
      const rewardData = {
        user_id: userId,
        reward_type: config.reward_type || 'free_meal',
        reward_value: config.reward_value || 500,
        reward_details: {
          type: config.reward_type || 'free_meal',
          value: config.reward_value || 500,
          items: config.reward_items || ['Any main course item']
        },
        status: 'available',
        earned_at: new Date(),
        expires_at: expiresAt
      };

      const reward = await dbHelpers.createDoc(collections.REFERRAL_REWARDS, rewardData);

      // Update account
      const accounts = await dbHelpers.getDocs(collections.USER_REFERRAL_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: userId }
      ]);

      if (accounts.length > 0) {
        const account = accounts[0];
        await dbHelpers.updateDoc(collections.USER_REFERRAL_ACCOUNTS, account.id, {
          total_rewards_earned: (account.total_rewards_earned || 0) + 1
        });
      }

      logger.info('Referral reward created', {
        userId,
        rewardId: reward.id,
        rewardValue: config.reward_value
      });

      // TODO: Send notification to user about new reward
    } catch (error) {
      logger.error('Error creating referral reward:', error);
    }
  }

  // Check and expire old rewards
  static async expireOldRewards() {
    try {
      const now = new Date();

      const availableRewards = await dbHelpers.getDocs(collections.REFERRAL_REWARDS, [
        { type: 'where', field: 'status', operator: '==', value: 'available' }
      ]);

      for (const reward of availableRewards) {
        if (new Date(reward.expires_at) < now) {
          await dbHelpers.updateDoc(collections.REFERRAL_REWARDS, reward.id, {
            status: 'expired',
            expired_at: now
          });

          logger.info('Referral reward expired', {
            rewardId: reward.id,
            userId: reward.user_id
          });
        }
      }
    } catch (error) {
      logger.error('Error expiring old rewards:', error);
    }
  }
}

module.exports = ReferralService;
