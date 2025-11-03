const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');

class LoyaltyController {
  // ===== PROGRAM CONFIGURATION (ADMIN) =====

  // Get all loyalty programs
  static async getPrograms(req, res) {
    try {
      const programs = await dbHelpers.getDocs(collections.LOYALTY_PROGRAMS);

      res.json({
        success: true,
        data: { programs }
      });
    } catch (error) {
      logger.error('Get programs error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get programs'
        }
      });
    }
  }

  // Create/Update program configuration (Admin)
  static async configureProgramAdmin(req, res) {
    try {
      const {
        program_type,
        name,
        description,
        is_active,
        is_default,
        config
      } = req.body;
      const { user: currentUser } = req;

      // Check if program exists
      const existingPrograms = await dbHelpers.getDocs(collections.LOYALTY_PROGRAMS, [
        { type: 'where', field: 'program_type', operator: '==', value: program_type }
      ]);

      let program;
      if (existingPrograms.length > 0) {
        // Update existing
        program = await dbHelpers.updateDoc(collections.LOYALTY_PROGRAMS, existingPrograms[0].id, {
          name,
          description,
          is_active,
          is_default,
          config,
          updated_by: currentUser.id
        });
      } else {
        // Create new
        const programData = {
          program_type,
          name,
          description,
          is_active,
          is_default,
          config,
          created_by: currentUser.id
        };
        program = await dbHelpers.createDoc(collections.LOYALTY_PROGRAMS, programData);
      }

      logger.info('Loyalty program configured', {
        programType: program_type,
        configuredBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Program configured successfully',
        data: { program }
      });
    } catch (error) {
      logger.error('Configure program error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to configure program'
        }
      });
    }
  }

  // Toggle program active status (Admin)
  static async toggleProgram(req, res) {
    try {
      const { programId } = req.params;
      const { is_active } = req.body;
      const { user: currentUser } = req;

      await dbHelpers.updateDoc(collections.LOYALTY_PROGRAMS, programId, {
        is_active,
        updated_by: currentUser.id
      });

      logger.info('Program toggled', {
        programId,
        isActive: is_active,
        toggledBy: currentUser.id
      });

      res.json({
        success: true,
        message: `Program ${is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      logger.error('Toggle program error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to toggle program'
        }
      });
    }
  }

  // ===== USER LOYALTY ACCOUNT =====

  // Get user's loyalty account
  static async getAccount(req, res) {
    try {
      const { user: currentUser } = req;

      let account = await dbHelpers.getDocs(collections.USER_LOYALTY_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ]);

      if (account.length === 0) {
        // Create default account
        account = await LoyaltyController.createDefaultAccount(currentUser.id);
      } else {
        account = account[0];
      }

      // Get active program details
      let activeProgram = null;
      if (account.active_program_id) {
        activeProgram = await dbHelpers.getDoc(collections.LOYALTY_PROGRAMS, account.active_program_id);
      }

      res.json({
        success: true,
        data: {
          account,
          active_program: activeProgram
        }
      });
    } catch (error) {
      logger.error('Get account error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get loyalty account'
        }
      });
    }
  }

  // Create default loyalty account
  static async createDefaultAccount(userId) {
    // Get default program
    const defaultPrograms = await dbHelpers.getDocs(collections.LOYALTY_PROGRAMS, [
      { type: 'where', field: 'is_default', operator: '==', value: true }
    ]);

    const defaultProgram = defaultPrograms.length > 0 ? defaultPrograms[0] : null;

    const accountData = {
      user_id: userId,
      active_program_id: defaultProgram?.id || null,
      active_program_type: 'milestone',
      activated_at: new Date(),
      
      milestone_program: {
        total_orders_completed: 0,
        current_milestone_progress: 0,
        next_milestone_at: 10,
        total_milestones_achieved: 0,
        total_rewards_claimed: 0,
        is_frozen: false
      }
    };

    return await dbHelpers.createDoc(collections.USER_LOYALTY_ACCOUNTS, accountData);
  }

  // Switch program - Removed (only milestone program available)
  static async switchProgram(req, res) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NOT_AVAILABLE',
        message: 'Program switching is not available. Only milestone program is supported.'
      }
    });
  }

  // Check switch eligibility - Removed (only milestone program available)
  static async checkSwitchEligibility(req, res) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NOT_AVAILABLE',
        message: 'Program switching is not available. Only milestone program is supported.'
      }
    });
  }

  // ===== POINTS PROGRAM - REMOVED =====
  // Points program has been removed. Only milestone program is available.

  // ===== MILESTONE PROGRAM =====

  // Get milestone progress
  static async getMilestoneProgress(req, res) {
    try {
      const { user: currentUser } = req;

      const accounts = await dbHelpers.getDocs(collections.USER_LOYALTY_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ]);

      if (accounts.length === 0) {
        return res.json({
          success: true,
          data: {
            current_progress: 0,
            next_milestone: 10,
            total_milestones_achieved: 0,
            is_active: false
          }
        });
      }

      const account = accounts[0];

      res.json({
        success: true,
        data: {
          current_progress: account.milestone_program.current_milestone_progress,
          next_milestone: account.milestone_program.next_milestone_at,
          total_orders: account.milestone_program.total_orders_completed,
          total_milestones_achieved: account.milestone_program.total_milestones_achieved,
          total_rewards_claimed: account.milestone_program.total_rewards_claimed,
          is_active: account.active_program_type === 'milestone',
          is_frozen: account.milestone_program.is_frozen
        }
      });
    } catch (error) {
      logger.error('Get milestone progress error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get milestone progress'
        }
      });
    }
  }

  // Get available milestone rewards
  static async getMilestoneRewards(req, res) {
    try {
      const { user: currentUser } = req;

      const rewards = await dbHelpers.getDocs(collections.MILESTONE_REWARDS, [
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
      logger.error('Get milestone rewards error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get rewards'
        }
      });
    }
  }

  // Claim milestone reward
  static async claimMilestoneReward(req, res) {
    try {
      const { reward_id, order_id } = req.body;
      const { user: currentUser } = req;

      const reward = await dbHelpers.getDoc(collections.MILESTONE_REWARDS, reward_id);

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
        await dbHelpers.updateDoc(collections.MILESTONE_REWARDS, reward_id, {
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
      await dbHelpers.updateDoc(collections.MILESTONE_REWARDS, reward_id, {
        status: 'claimed',
        claimed_at: new Date(),
        claimed_order_id: order_id
      });

      // Update account
      const accounts = await dbHelpers.getDocs(collections.USER_LOYALTY_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ]);

      if (accounts.length > 0) {
        const account = accounts[0];
        await dbHelpers.updateDoc(collections.USER_LOYALTY_ACCOUNTS, account.id, {
          'milestone_program.total_rewards_claimed': (account.milestone_program.total_rewards_claimed || 0) + 1
        });
      }

      logger.info('Milestone reward claimed', {
        userId: currentUser.id,
        rewardId: reward_id,
        orderId: order_id
      });

      res.json({
        success: true,
        message: 'Reward claimed successfully',
        data: {
          reward_items: reward.reward_details.items,
          order_id
        }
      });
    } catch (error) {
      logger.error('Claim reward error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to claim reward'
        }
      });
    }
  }

  // ===== TRANSACTIONS & HISTORY =====

  // Get loyalty transactions
  static async getTransactions(req, res) {
    try {
      const { user: currentUser } = req;
      const { program_type, page = 1, limit = 20 } = req.query;

      let queries = [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ];

      if (program_type) {
        queries.push({ type: 'where', field: 'program_type', operator: '==', value: program_type });
      }

      const transactions = await dbHelpers.getDocs(
        collections.LOYALTY_TRANSACTIONS,
        queries,
        { field: 'created_at', direction: 'desc' },
        parseInt(limit)
      );

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: transactions.length
          }
        }
      });
    } catch (error) {
      logger.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get transactions'
        }
      });
    }
  }

  // Get switch history - Removed (only milestone program available)
  static async getSwitchHistory(req, res) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NOT_AVAILABLE',
        message: 'Switch history is not available. Only milestone program is supported.'
      }
    });
  }

  // ===== ADMIN MANAGEMENT =====

  // Get all users' loyalty accounts (Admin)
  static async getAllUserAccounts(req, res) {
    try {
      const { program_type, is_frozen, page = 1, limit = 50 } = req.query;

      let queries = [];

      if (program_type) {
        queries.push({ type: 'where', field: 'active_program_type', operator: '==', value: program_type });
      }

      if (is_frozen !== undefined) {
        const frozenValue = is_frozen === 'true';
        if (program_type === 'milestone') {
          queries.push({ type: 'where', field: 'milestone_program.is_frozen', operator: '==', value: frozenValue });
        }
      }

      const accounts = await dbHelpers.getDocs(
        collections.USER_LOYALTY_ACCOUNTS,
        queries,
        { field: 'created_at', direction: 'desc' },
        parseInt(limit)
      );

      // Get user details for each account
      const accountsWithUsers = await Promise.all(
        accounts.map(async (account) => {
          const user = await dbHelpers.getDoc(collections.USERS, account.user_id);
          return {
            ...account,
            user_info: user ? {
              id: user.id,
              name: user.name,
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
      logger.error('Get all user accounts error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get user accounts'
        }
      });
    }
  }

  // Get specific user's loyalty account (Admin)
  static async getUserAccount(req, res) {
    try {
      const { userId } = req.params;

      const accounts = await dbHelpers.getDocs(collections.USER_LOYALTY_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: userId }
      ]);

      if (accounts.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User loyalty account not found'
          }
        });
      }

      const account = accounts[0];

      // Get user details
      const user = await dbHelpers.getDoc(collections.USERS, userId);

      // Get active program details
      let activeProgram = null;
      if (account.active_program_id) {
        activeProgram = await dbHelpers.getDoc(collections.LOYALTY_PROGRAMS, account.active_program_id);
      }

      // Get recent transactions
      const transactions = await dbHelpers.getDocs(
        collections.LOYALTY_TRANSACTIONS,
        [{ type: 'where', field: 'user_id', operator: '==', value: userId }],
        { field: 'created_at', direction: 'desc' },
        10
      );

      res.json({
        success: true,
        data: {
          account,
          user_info: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone
          } : null,
          active_program: activeProgram,
          recent_transactions: transactions
        }
      });
    } catch (error) {
      logger.error('Get user account error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get user account'
        }
      });
    }
  }

  // Manually adjust user's points (Admin) - Removed
  static async adjustUserPoints(req, res) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NOT_AVAILABLE',
        message: 'Points adjustment is not available. Only milestone program is supported.'
      }
    });
  }

  // Manually enroll user in loyalty program (Admin)
  static async enrollUser(req, res) {
    try {
      const { userId } = req.params;
      const { program_type } = req.body;
      const { user: admin } = req;

      // Check if user exists
      const user = await dbHelpers.getDoc(collections.USERS, userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Check if already enrolled
      const existingAccounts = await dbHelpers.getDocs(collections.USER_LOYALTY_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: userId }
      ]);

      if (existingAccounts.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User is already enrolled in loyalty program'
          }
        });
      }

      // Get program
      const programs = await dbHelpers.getDocs(collections.LOYALTY_PROGRAMS, [
        { type: 'where', field: 'program_type', operator: '==', value: program_type }
      ]);

      if (programs.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Loyalty program not found'
          }
        });
      }

      const program = programs[0];

      // Only milestone program is supported
      if (program_type !== 'milestone') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Only milestone program is supported'
          }
        });
      }

      // Create account
      const accountData = {
        user_id: userId,
        active_program_id: program.id,
        active_program_type: 'milestone',
        activated_at: new Date(),
        enrolled_by_admin: admin.id,
        
        milestone_program: {
          total_orders_completed: 0,
          current_milestone_progress: 0,
          next_milestone_at: 10,
          total_milestones_achieved: 0,
          total_rewards_claimed: 0,
          is_frozen: false
        }
      };

      const account = await dbHelpers.createDoc(collections.USER_LOYALTY_ACCOUNTS, accountData);

      logger.info('Admin enrolled user in loyalty program', {
        adminId: admin.id,
        userId,
        programType: program_type
      });

      res.json({
        success: true,
        message: 'User enrolled successfully',
        data: { account }
      });
    } catch (error) {
      logger.error('Enroll user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to enroll user'
        }
      });
    }
  }

  // Force switch user's program (Admin) - Removed
  static async forceSwitchUserProgram(req, res) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NOT_AVAILABLE',
        message: 'Program switching is not available. Only milestone program is supported.'
      }
    });
  }

  // Reset or freeze user's account (Admin)
  static async manageUserAccount(req, res) {
    try {
      const { userId } = req.params;
      const { action, reason } = req.body;
      const { user: admin } = req;

      const accounts = await dbHelpers.getDocs(collections.USER_LOYALTY_ACCOUNTS, [
        { type: 'where', field: 'user_id', operator: '==', value: userId }
      ]);

      if (accounts.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User loyalty account not found'
          }
        });
      }

      const account = accounts[0];
      let updateData = {};
      let message = '';

      switch (action) {
        case 'freeze_milestone':
          updateData['milestone_program.is_frozen'] = true;
          updateData['milestone_program.frozen_at'] = new Date();
          updateData['milestone_program.frozen_by'] = admin.id;
          updateData['milestone_program.freeze_reason'] = reason;
          message = 'Milestone program frozen successfully';
          break;

        case 'unfreeze_milestone':
          updateData['milestone_program.is_frozen'] = false;
          updateData['milestone_program.unfrozen_at'] = new Date();
          updateData['milestone_program.unfrozen_by'] = admin.id;
          message = 'Milestone program unfrozen successfully';
          break;

        case 'reset_milestone':
          updateData['milestone_program.current_milestone_progress'] = 0;
          updateData['milestone_program.total_orders_completed'] = 0;
          updateData['milestone_program.total_milestones_achieved'] = 0;
          updateData['milestone_program.next_milestone_at'] = 10;
          updateData['milestone_program.reset_at'] = new Date();
          updateData['milestone_program.reset_by'] = admin.id;
          updateData['milestone_program.reset_reason'] = reason;
          message = 'Milestone progress reset successfully';
          break;

        default:
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid action. Use: freeze_milestone, unfreeze_milestone, reset_milestone'
            }
          });
      }

      await dbHelpers.updateDoc(collections.USER_LOYALTY_ACCOUNTS, account.id, updateData);

      // Record transaction for resets
      if (action.startsWith('reset')) {
        await dbHelpers.createDoc(collections.LOYALTY_TRANSACTIONS, {
          user_id: userId,
          program_type: 'milestone',
          type: 'admin_reset',
          description: reason || 'Admin reset milestone program',
          admin_id: admin.id,
          admin_name: admin.name
        });
      }

      logger.info('Admin managed user account', {
        adminId: admin.id,
        userId,
        action
      });

      res.json({
        success: true,
        message
      });
    } catch (error) {
      logger.error('Manage user account error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to manage account'
        }
      });
    }
  }

  // View all loyalty transactions across users (Admin)
  static async getAllTransactions(req, res) {
    try {
      const { program_type, type, user_id, page = 1, limit = 50 } = req.query;

      let queries = [];

      if (program_type) {
        queries.push({ type: 'where', field: 'program_type', operator: '==', value: program_type });
      }

      if (type) {
        queries.push({ type: 'where', field: 'type', operator: '==', value: type });
      }

      if (user_id) {
        queries.push({ type: 'where', field: 'user_id', operator: '==', value: user_id });
      }

      const transactions = await dbHelpers.getDocs(
        collections.LOYALTY_TRANSACTIONS,
        queries,
        { field: 'created_at', direction: 'desc' },
        parseInt(limit)
      );

      // Get user details for each transaction
      const transactionsWithUsers = await Promise.all(
        transactions.map(async (transaction) => {
          const user = await dbHelpers.getDoc(collections.USERS, transaction.user_id);
          return {
            ...transaction,
            user_info: user ? {
              id: user.id,
              name: user.name,
              email: user.email
            } : null
          };
        })
      );

      res.json({
        success: true,
        data: {
          transactions: transactionsWithUsers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: transactionsWithUsers.length
          }
        }
      });
    } catch (error) {
      logger.error('Get all transactions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get transactions'
        }
      });
    }
  }

  // Generate loyalty reports and analytics (Admin)
  static async getAnalytics(req, res) {
    try {
      const { period = '30' } = req.query;
      const daysAgo = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get all accounts
      const allAccounts = await dbHelpers.getDocs(collections.USER_LOYALTY_ACCOUNTS);

      // Get all transactions in period
      const allTransactions = await dbHelpers.getDocs(
        collections.LOYALTY_TRANSACTIONS,
        [],
        { field: 'created_at', direction: 'desc' }
      );

      const recentTransactions = allTransactions.filter(t => 
        new Date(t.created_at) >= startDate
      );

      // Calculate analytics
      const analytics = {
        overview: {
          total_enrolled_users: allAccounts.length,
          milestone_program_users: allAccounts.filter(a => a.active_program_type === 'milestone').length,
          total_transactions: recentTransactions.length
        },
        milestone_program: {
          total_milestones_achieved: allAccounts.reduce((sum, a) => sum + (a.milestone_program?.total_milestones_achieved || 0), 0),
          total_rewards_claimed: allAccounts.reduce((sum, a) => sum + (a.milestone_program?.total_rewards_claimed || 0), 0),
          frozen_accounts: allAccounts.filter(a => a.milestone_program?.is_frozen).length,
          average_progress: allAccounts.length > 0 
            ? allAccounts.reduce((sum, a) => sum + (a.milestone_program?.current_milestone_progress || 0), 0) / allAccounts.length 
            : 0
        },
        engagement: {
          recent_transactions: recentTransactions.length,
          milestones_achieved_in_period: recentTransactions
            .filter(t => t.type === 'milestone_achieved')
            .length,
          rewards_claimed_in_period: recentTransactions
            .filter(t => t.type === 'milestone_claimed')
            .length
        },
        top_users: {
          by_milestones: allAccounts
            .sort((a, b) => (b.milestone_program?.total_milestones_achieved || 0) - (a.milestone_program?.total_milestones_achieved || 0))
            .slice(0, 10)
            .map(a => ({
              user_id: a.user_id,
              milestones_achieved: a.milestone_program?.total_milestones_achieved || 0,
              rewards_claimed: a.milestone_program?.total_rewards_claimed || 0
            }))
        },
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
      logger.error('Get analytics error:', error);
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

module.exports = LoyaltyController;