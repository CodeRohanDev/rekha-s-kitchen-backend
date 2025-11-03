const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');
const crypto = require('crypto');

class ReferralController {
  // ===== USER REFERRAL OPERATIONS =====

  // Get user's referral account
  static async getReferralAccount(req, res) {
    try {
      const { user: currentUser } = req;

      let account = await dbHelpers.getDocs(collections.USER_REFERRAL_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ]);

      if (account.length === 0) {
        // Create default account
        account = await ReferralController.createDefaultAccount(currentUser.id);
      } else {
        account = account[0];
      }

      // Get referral program details
      const programs = await dbHelpers.getDocs(collections.REFERRAL_PROGRAMS, [
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);
      const program = programs.length > 0 ? programs[0] : null;

      res.json({
        success: true,
        data: {
          account,
          program
        }
      });
    } catch (error) {
      logger.error('Get referral account error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get referral account'
        }
      });
    }
  }

  // Create default referral account
  static async createDefaultAccount(userId) {
    // Generate unique referral code
    const referralCode = await ReferralController.generateUniqueReferralCode(userId);

    const accountData = {
      user_id: userId,
      referral_code: referralCode,
      total_referrals: 0,
      successful_referrals: 0,
      pending_referrals: 0,
      current_progress: 0,
      total_rewards_earned: 0,
      total_rewards_claimed: 0,
      is_active: true,
      created_at: new Date()
    };

    return await dbHelpers.createDoc(collections.USER_REFERRAL_ACCOUNTS, accountData);
  }

  // Generate unique referral code
  static async generateUniqueReferralCode(userId) {
    let isUnique = false;
    let code = '';

    while (!isUnique) {
      // Generate 6-character alphanumeric code
      code = crypto.randomBytes(3).toString('hex').toUpperCase();
      
      // Check if code already exists
      const existing = await dbHelpers.getDocs(collections.USER_REFERRAL_ACCOUNTS, [
        { type: 'where', field: 'referral_code', operator: '==', value: code }
      ]);

      if (existing.length === 0) {
        isUnique = true;
      }
    }

    return code;
  }

  // Get user's referral code
  static async getMyReferralCode(req, res) {
    try {
      const { user: currentUser } = req;

      let accounts = await dbHelpers.getDocs(collections.USER_REFERRAL_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ]);

      let account;
      if (accounts.length === 0) {
        account = await ReferralController.createDefaultAccount(currentUser.id);
      } else {
        account = accounts[0];
      }

      res.json({
        success: true,
        data: {
          referral_code: account.referral_code,
          total_referrals: account.total_referrals,
          successful_referrals: account.successful_referrals,
          current_progress: account.current_progress
        }
      });
    } catch (error) {
      logger.error('Get referral code error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get referral code'
        }
      });
    }
  }

  // Apply referral code (when new user signs up)
  static async applyReferralCode(req, res) {
    try {
      const { referral_code } = req.body;
      const { user: currentUser } = req;

      // Check if user already used a referral code
      const existingReferrals = await dbHelpers.getDocs(collections.REFERRALS, [
        { type: 'where', field: 'referred_user_id', operator: '==', value: currentUser.id }
      ]);

      if (existingReferrals.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'You have already used a referral code'
          }
        });
      }

      // Find referrer by code
      const referrerAccounts = await dbHelpers.getDocs(collections.USER_REFERRAL_ACCOUNTS, [
        { type: 'where', field: 'referral_code', operator: '==', value: referral_code.toUpperCase() }
      ]);

      if (referrerAccounts.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Invalid referral code'
          }
        });
      }

      const referrerAccount = referrerAccounts[0];

      // Cannot refer yourself
      if (referrerAccount.user_id === currentUser.id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'You cannot use your own referral code'
          }
        });
      }

      // Create referral record
      const referralData = {
        referrer_user_id: referrerAccount.user_id,
        referred_user_id: currentUser.id,
        referral_code: referral_code.toUpperCase(),
        status: 'pending',
        orders_completed: 0,
        is_qualified: false,
        created_at: new Date()
      };

      const referral = await dbHelpers.createDoc(collections.REFERRALS, referralData);

      // Update referrer's account
      await dbHelpers.updateDoc(collections.USER_REFERRAL_ACCOUNTS, referrerAccount.id, {
        total_referrals: (referrerAccount.total_referrals || 0) + 1,
        pending_referrals: (referrerAccount.pending_referrals || 0) + 1
      });

      logger.info('Referral code applied', {
        referrerId: referrerAccount.user_id,
        referredUserId: currentUser.id,
        code: referral_code
      });

      res.json({
        success: true,
        message: 'Referral code applied successfully',
        data: {
          referral_id: referral.id
        }
      });
    } catch (error) {
      logger.error('Apply referral code error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to apply referral code'
        }
      });
    }
  }

  // Get user's referrals (people they referred)
  static async getMyReferrals(req, res) {
    try {
      const { user: currentUser } = req;
      const { status, page = 1, limit = 20 } = req.query;

      let queries = [
        { type: 'where', field: 'referrer_user_id', operator: '==', value: currentUser.id }
      ];

      if (status) {
        queries.push({ type: 'where', field: 'status', operator: '==', value: status });
      }

      const referrals = await dbHelpers.getDocs(
        collections.REFERRALS,
        queries,
        { field: 'created_at', direction: 'desc' },
        parseInt(limit)
      );

      // Get referred user details
      const referralsWithUsers = await Promise.all(
        referrals.map(async (referral) => {
          const user = await dbHelpers.getDoc(collections.USERS, referral.referred_user_id);
          return {
            ...referral,
            referred_user: user ? {
              id: user.id,
              name: `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim(),
              phone: user.phone
            } : null
          };
        })
      );

      res.json({
        success: true,
        data: {
          referrals: referralsWithUsers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: referralsWithUsers.length
          }
        }
      });
    } catch (error) {
      logger.error('Get my referrals error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get referrals'
        }
      });
    }
  }

  // Get available referral rewards
  static async getMyRewards(req, res) {
    try {
      const { user: currentUser } = req;

      const rewards = await dbHelpers.getDocs(collections.REFERRAL_REWARDS, [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id },
        { type: 'where', field: 'status', operator: '==', value: 'available' }
      ]);

      res.json({
        success: true,
        data: {
          rewards,
          count: rewards.length
        }
      });
    } catch (error) {
      logger.error('Get referral rewards error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get rewards'
        }
      });
    }
  }

  // Claim referral reward
  static async claimReward(req, res) {
    try {
      const { reward_id, order_id } = req.body;
      const { user: currentUser } = req;

      const reward = await dbHelpers.getDoc(collections.REFERRAL_REWARDS, reward_id);

      if (!reward) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Reward not found'
          }
        });
      }

      if (reward.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'This reward does not belong to you'
          }
        });
      }

      if (reward.status !== 'available') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Reward is not available'
          }
        });
      }

      // Check expiry
      if (new Date() > new Date(reward.expires_at)) {
        await dbHelpers.updateDoc(collections.REFERRAL_REWARDS, reward_id, {
          status: 'expired'
        });
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Reward has expired'
          }
        });
      }

      // Mark as claimed
      await dbHelpers.updateDoc(collections.REFERRAL_REWARDS, reward_id, {
        status: 'claimed',
        claimed_at: new Date(),
        claimed_order_id: order_id
      });

      // Update account
      const accounts = await dbHelpers.getDocs(collections.USER_REFERRAL_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ]);

      if (accounts.length > 0) {
        const account = accounts[0];
        await dbHelpers.updateDoc(collections.USER_REFERRAL_ACCOUNTS, account.id, {
          total_rewards_claimed: (account.total_rewards_claimed || 0) + 1
        });
      }

      logger.info('Referral reward claimed', {
        userId: currentUser.id,
        rewardId: reward_id,
        orderId: order_id
      });

      res.json({
        success: true,
        message: 'Reward claimed successfully',
        data: {
          reward_value: reward.reward_value,
          order_id
        }
      });
    } catch (error) {
      logger.error('Claim referral reward error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to claim reward'
        }
      });
    }
  }

  // ===== ADMIN OPERATIONS =====

  // Get referral program configuration
  static async getProgram(req, res) {
    try {
      const programs = await dbHelpers.getDocs(collections.REFERRAL_PROGRAMS);

      res.json({
        success: true,
        data: { programs }
      });
    } catch (error) {
      logger.error('Get referral program error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get program'
        }
      });
    }
  }

  // Configure referral program (Admin)
  static async configureProgram(req, res) {
    try {
      const { name, description, is_active, config } = req.body;
      const { user: currentUser } = req;

      const existingPrograms = await dbHelpers.getDocs(collections.REFERRAL_PROGRAMS);

      let program;
      if (existingPrograms.length > 0) {
        // Update existing
        program = await dbHelpers.updateDoc(collections.REFERRAL_PROGRAMS, existingPrograms[0].id, {
          name,
          description,
          is_active,
          config,
          updated_by: currentUser.id,
          updated_at: new Date()
        });
      } else {
        // Create new
        const programData = {
          name,
          description,
          is_active,
          config,
          created_by: currentUser.id,
          created_at: new Date()
        };
        program = await dbHelpers.createDoc(collections.REFERRAL_PROGRAMS, programData);
      }

      logger.info('Referral program configured', {
        configuredBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Program configured successfully',
        data: { program }
      });
    } catch (error) {
      logger.error('Configure referral program error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to configure program'
        }
      });
    }
  }

  // Get all referral accounts (Admin)
  static async getAllAccounts(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;

      const accounts = await dbHelpers.getDocs(
        collections.USER_REFERRAL_ACCOUNTS,
        [],
        { field: 'total_rewards_earned', direction: 'desc' },
        parseInt(limit)
      );

      // Get user details
      const accountsWithUsers = await Promise.all(
        accounts.map(async (account) => {
          const user = await dbHelpers.getDoc(collections.USERS, account.user_id);
          return {
            ...account,
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
          accounts: accountsWithUsers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: accountsWithUsers.length
          }
        }
      });
    } catch (error) {
      logger.error('Get all referral accounts error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get accounts'
        }
      });
    }
  }

  // Get referral analytics (Admin)
  static async getAnalytics(req, res) {
    try {
      const { period = '30' } = req.query;
      const daysAgo = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const allAccounts = await dbHelpers.getDocs(collections.USER_REFERRAL_ACCOUNTS);
      const allReferrals = await dbHelpers.getDocs(collections.REFERRALS);
      const allRewards = await dbHelpers.getDocs(collections.REFERRAL_REWARDS);

      const recentReferrals = allReferrals.filter(r => 
        new Date(r.created_at) >= startDate
      );

      const analytics = {
        overview: {
          total_users_with_referrals: allAccounts.length,
          total_referrals: allReferrals.length,
          successful_referrals: allReferrals.filter(r => r.is_qualified).length,
          pending_referrals: allReferrals.filter(r => r.status === 'pending').length,
          total_rewards_earned: allAccounts.reduce((sum, a) => sum + (a.total_rewards_earned || 0), 0),
          total_rewards_claimed: allAccounts.reduce((sum, a) => sum + (a.total_rewards_claimed || 0), 0)
        },
        period_stats: {
          new_referrals: recentReferrals.length,
          qualified_referrals: recentReferrals.filter(r => r.is_qualified).length,
          rewards_earned_in_period: allRewards.filter(r => 
            new Date(r.earned_at) >= startDate
          ).length
        },
        top_referrers: allAccounts
          .sort((a, b) => (b.successful_referrals || 0) - (a.successful_referrals || 0))
          .slice(0, 10)
          .map(a => ({
            user_id: a.user_id,
            referral_code: a.referral_code,
            successful_referrals: a.successful_referrals || 0,
            total_rewards_earned: a.total_rewards_earned || 0
          })),
        period: {
          days: daysAgo,
          start_date: startDate,
          end_date: new Date()
        }
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Get referral analytics error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get analytics'
        }
      });
    }
  }
}

module.exports = ReferralController;
