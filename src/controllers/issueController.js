const { dbHelpers, collections, admin } = require('../config/database');
const logger = require('../utils/logger');
const StorageUtils = require('../utils/storage');

class IssueController {
  // ===== CUSTOMER ENDPOINTS =====

  // Report a new issue
  static async reportIssue(req, res) {
    try {
      const { user: currentUser } = req;
      const {
        issue_type,
        subject,
        description,
        order_id,
        outlet_id,
        priority = 'medium'
      } = req.body;

      // Upload images if provided
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = await Promise.all(
          req.files.map(async (file) => {
            const fileExtension = StorageUtils.getFileExtension(file.mimetype);
            const fileName = `issue-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
            return await StorageUtils.uploadFile(
              file.buffer,
              fileName,
              'issues',
              file.mimetype
            );
          })
        );
      }

      // Create issue
      const issueData = {
        user_id: currentUser.id,
        issue_type,
        subject,
        description,
        order_id: order_id || null,
        outlet_id: outlet_id || null,
        priority,
        status: 'open',
        images: imageUrls,
        reported_by_role: currentUser.role,
        assigned_to: null,
        resolution: null,
        resolved_at: null,
        resolved_by: null,
        comments: [],
        internal_notes: [],
        created_at: new Date(),
        updated_at: new Date()
      };

      const issue = await dbHelpers.createDoc(collections.ISSUES, issueData);

      logger.info('Issue reported', {
        issueId: issue.id,
        userId: currentUser.id,
        issueType: issue_type
      });

      res.status(201).json({
        success: true,
        message: 'Issue reported successfully',
        data: {
          issue_id: issue.id,
          issue_number: issue.id.substring(0, 8).toUpperCase(),
          status: issue.status,
          created_at: issue.created_at
        }
      });
    } catch (error) {
      logger.error('Report issue error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to report issue'
        }
      });
    }
  }

  // Get user's issues
  static async getMyIssues(req, res) {
    try {
      const { user: currentUser } = req;
      const { status, issue_type, page = 1, limit = 20 } = req.query;

      let queries = [
        { type: 'where', field: 'user_id', operator: '==', value: currentUser.id }
      ];

      if (status) {
        queries.push({ type: 'where', field: 'status', operator: '==', value: status });
      }

      if (issue_type) {
        queries.push({ type: 'where', field: 'issue_type', operator: '==', value: issue_type });
      }

      const result = await dbHelpers.getPaginatedDocs(
        collections.ISSUES,
        queries,
        parseInt(page),
        parseInt(limit)
      );

      // Get order and outlet details for each issue
      const issuesWithDetails = await Promise.all(
        result.items.map(async (issue) => {
          let orderDetails = null;
          let outletDetails = null;

          if (issue.order_id) {
            const order = await dbHelpers.getDoc(collections.ORDERS, issue.order_id);
            if (order) {
              orderDetails = {
                id: order.id,
                order_number: order.order_number,
                total_amount: order.total_amount,
                created_at: order.created_at
              };
            }
          }

          if (issue.outlet_id) {
            const outlet = await dbHelpers.getDoc(collections.OUTLETS, issue.outlet_id);
            if (outlet) {
              outletDetails = {
                id: outlet.id,
                name: outlet.name,
                address: outlet.address
              };
            }
          }

          return {
            id: issue.id,
            issue_number: issue.id.substring(0, 8).toUpperCase(),
            issue_type: issue.issue_type,
            subject: issue.subject,
            description: issue.description,
            status: issue.status,
            priority: issue.priority,
            images: issue.images || [],
            order: orderDetails,
            outlet: outletDetails,
            resolution: issue.resolution,
            resolved_at: issue.resolved_at,
            comments_count: issue.comments?.length || 0,
            created_at: issue.created_at,
            updated_at: issue.updated_at
          };
        })
      );

      res.json({
        success: true,
        data: {
          issues: issuesWithDetails,
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Get my issues error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get issues'
        }
      });
    }
  }

  // Get single issue details
  static async getIssue(req, res) {
    try {
      const { user: currentUser } = req;
      const { issueId } = req.params;

      const issue = await dbHelpers.getDoc(collections.ISSUES, issueId);

      if (!issue) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Issue not found'
          }
        });
      }

      // Check permissions
      if (currentUser.role === 'customer' && issue.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only view your own issues'
          }
        });
      }

      // Get order and outlet details
      let orderDetails = null;
      let outletDetails = null;
      let assignedToDetails = null;

      if (issue.order_id) {
        const order = await dbHelpers.getDoc(collections.ORDERS, issue.order_id);
        if (order) {
          orderDetails = {
            id: order.id,
            order_number: order.order_number,
            total_amount: order.total_amount,
            status: order.status,
            created_at: order.created_at
          };
        }
      }

      if (issue.outlet_id) {
        const outlet = await dbHelpers.getDoc(collections.OUTLETS, issue.outlet_id);
        if (outlet) {
          outletDetails = {
            id: outlet.id,
            name: outlet.name,
            address: outlet.address,
            phone: outlet.phone
          };
        }
      }

      if (issue.assigned_to) {
        const assignedUser = await dbHelpers.getDoc(collections.USERS, issue.assigned_to);
        if (assignedUser) {
          const profile = await dbHelpers.getDoc(collections.USER_PROFILES, issue.assigned_to);
          assignedToDetails = {
            id: assignedUser.id,
            name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : assignedUser.email,
            role: assignedUser.role
          };
        }
      }

      res.json({
        success: true,
        data: {
          issue: {
            id: issue.id,
            issue_number: issue.id.substring(0, 8).toUpperCase(),
            issue_type: issue.issue_type,
            subject: issue.subject,
            description: issue.description,
            status: issue.status,
            priority: issue.priority,
            images: issue.images || [],
            order: orderDetails,
            outlet: outletDetails,
            assigned_to: assignedToDetails,
            resolution: issue.resolution,
            resolved_at: issue.resolved_at,
            comments: issue.comments || [],
            created_at: issue.created_at,
            updated_at: issue.updated_at
          }
        }
      });
    } catch (error) {
      logger.error('Get issue error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get issue'
        }
      });
    }
  }

  // Add comment to issue
  static async addComment(req, res) {
    try {
      const { user: currentUser } = req;
      const { issueId } = req.params;
      const { comment } = req.body;

      const issue = await dbHelpers.getDoc(collections.ISSUES, issueId);

      if (!issue) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Issue not found'
          }
        });
      }

      // Check permissions
      if (currentUser.role === 'customer' && issue.user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only comment on your own issues'
          }
        });
      }

      // Add comment
      const newComment = {
        id: `comment_${Date.now()}`,
        user_id: currentUser.id,
        user_role: currentUser.role,
        comment,
        created_at: new Date()
      };

      const comments = issue.comments || [];
      comments.push(newComment);

      await dbHelpers.updateDoc(collections.ISSUES, issueId, {
        comments,
        updated_at: new Date()
      });

      logger.info('Comment added to issue', {
        issueId,
        userId: currentUser.id
      });

      res.json({
        success: true,
        message: 'Comment added successfully',
        data: {
          comment: newComment
        }
      });
    } catch (error) {
      logger.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add comment'
        }
      });
    }
  }

  // ===== ADMIN ENDPOINTS =====

  // Get all issues (Admin)
  static async getAllIssues(req, res) {
    try {
      const { status, issue_type, priority, assigned_to, page = 1, limit = 50 } = req.query;

      let queries = [];

      if (status) {
        queries.push({ type: 'where', field: 'status', operator: '==', value: status });
      }

      if (issue_type) {
        queries.push({ type: 'where', field: 'issue_type', operator: '==', value: issue_type });
      }

      if (priority) {
        queries.push({ type: 'where', field: 'priority', operator: '==', value: priority });
      }

      if (assigned_to) {
        queries.push({ type: 'where', field: 'assigned_to', operator: '==', value: assigned_to });
      }

      const result = await dbHelpers.getPaginatedDocs(
        collections.ISSUES,
        queries,
        parseInt(page),
        parseInt(limit)
      );

      // Get user details for each issue
      const issuesWithDetails = await Promise.all(
        result.items.map(async (issue) => {
          const user = await dbHelpers.getDoc(collections.USERS, issue.user_id);
          const profile = await dbHelpers.getDoc(collections.USER_PROFILES, issue.user_id);

          return {
            id: issue.id,
            issue_number: issue.id.substring(0, 8).toUpperCase(),
            issue_type: issue.issue_type,
            subject: issue.subject,
            status: issue.status,
            priority: issue.priority,
            user: user ? {
              id: user.id,
              name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user.email,
              email: user.email,
              phone: user.phone
            } : null,
            assigned_to: issue.assigned_to,
            comments_count: issue.comments?.length || 0,
            created_at: issue.created_at,
            updated_at: issue.updated_at
          };
        })
      );

      res.json({
        success: true,
        data: {
          issues: issuesWithDetails,
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Get all issues error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get issues'
        }
      });
    }
  }

  // Update issue status (Admin)
  static async updateIssueStatus(req, res) {
    try {
      const { user: admin } = req;
      const { issueId } = req.params;
      const { status, resolution } = req.body;

      const issue = await dbHelpers.getDoc(collections.ISSUES, issueId);

      if (!issue) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Issue not found'
          }
        });
      }

      const updateData = {
        status,
        updated_at: new Date()
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolution = resolution;
        updateData.resolved_at = new Date();
        updateData.resolved_by = admin.id;
      }

      await dbHelpers.updateDoc(collections.ISSUES, issueId, updateData);

      logger.info('Issue status updated', {
        issueId,
        status,
        updatedBy: admin.id
      });

      res.json({
        success: true,
        message: 'Issue status updated successfully'
      });
    } catch (error) {
      logger.error('Update issue status error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update issue status'
        }
      });
    }
  }

  // Assign issue to staff (Admin)
  static async assignIssue(req, res) {
    try {
      const { user: admin } = req;
      const { issueId } = req.params;
      const { assigned_to } = req.body;

      const issue = await dbHelpers.getDoc(collections.ISSUES, issueId);

      if (!issue) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Issue not found'
          }
        });
      }

      // Verify assigned user exists
      const assignedUser = await dbHelpers.getDoc(collections.USERS, assigned_to);
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assigned user not found'
          }
        });
      }

      await dbHelpers.updateDoc(collections.ISSUES, issueId, {
        assigned_to,
        assigned_at: new Date(),
        assigned_by: admin.id,
        updated_at: new Date()
      });

      logger.info('Issue assigned', {
        issueId,
        assignedTo: assigned_to,
        assignedBy: admin.id
      });

      res.json({
        success: true,
        message: 'Issue assigned successfully'
      });
    } catch (error) {
      logger.error('Assign issue error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to assign issue'
        }
      });
    }
  }

  // Update issue priority (Admin)
  static async updatePriority(req, res) {
    try {
      const { user: admin } = req;
      const { issueId } = req.params;
      const { priority } = req.body;

      const issue = await dbHelpers.getDoc(collections.ISSUES, issueId);

      if (!issue) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Issue not found'
          }
        });
      }

      await dbHelpers.updateDoc(collections.ISSUES, issueId, {
        priority,
        updated_at: new Date()
      });

      logger.info('Issue priority updated', {
        issueId,
        priority,
        updatedBy: admin.id
      });

      res.json({
        success: true,
        message: 'Issue priority updated successfully'
      });
    } catch (error) {
      logger.error('Update priority error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update priority'
        }
      });
    }
  }

  // Add internal note (Admin)
  static async addInternalNote(req, res) {
    try {
      const { user: admin } = req;
      const { issueId } = req.params;
      const { note } = req.body;

      const issue = await dbHelpers.getDoc(collections.ISSUES, issueId);

      if (!issue) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Issue not found'
          }
        });
      }

      const newNote = {
        id: `note_${Date.now()}`,
        admin_id: admin.id,
        note,
        created_at: new Date()
      };

      const internalNotes = issue.internal_notes || [];
      internalNotes.push(newNote);

      await dbHelpers.updateDoc(collections.ISSUES, issueId, {
        internal_notes: internalNotes,
        updated_at: new Date()
      });

      logger.info('Internal note added to issue', {
        issueId,
        adminId: admin.id
      });

      res.json({
        success: true,
        message: 'Internal note added successfully'
      });
    } catch (error) {
      logger.error('Add internal note error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add internal note'
        }
      });
    }
  }

  // Get issue statistics (Admin)
  static async getStatistics(req, res) {
    try {
      const { period = '30' } = req.query;
      const daysAgo = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const allIssues = await dbHelpers.getDocs(collections.ISSUES);

      const recentIssues = allIssues.filter(issue => 
        new Date(issue.created_at) >= startDate
      );

      const statistics = {
        overview: {
          total_issues: allIssues.length,
          open_issues: allIssues.filter(i => i.status === 'open').length,
          in_progress_issues: allIssues.filter(i => i.status === 'in_progress').length,
          resolved_issues: allIssues.filter(i => i.status === 'resolved').length,
          closed_issues: allIssues.filter(i => i.status === 'closed').length
        },
        by_type: {
          order_issue: allIssues.filter(i => i.issue_type === 'order_issue').length,
          delivery_issue: allIssues.filter(i => i.issue_type === 'delivery_issue').length,
          payment_issue: allIssues.filter(i => i.issue_type === 'payment_issue').length,
          food_quality: allIssues.filter(i => i.issue_type === 'food_quality').length,
          app_issue: allIssues.filter(i => i.issue_type === 'app_issue').length,
          other: allIssues.filter(i => i.issue_type === 'other').length
        },
        by_priority: {
          low: allIssues.filter(i => i.priority === 'low').length,
          medium: allIssues.filter(i => i.priority === 'medium').length,
          high: allIssues.filter(i => i.priority === 'high').length,
          urgent: allIssues.filter(i => i.priority === 'urgent').length
        },
        recent_period: {
          days: daysAgo,
          new_issues: recentIssues.length,
          resolved_issues: recentIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
          average_resolution_time: calculateAverageResolutionTime(recentIssues)
        }
      };

      res.json({
        success: true,
        data: statistics
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

// Helper function
function calculateAverageResolutionTime(issues) {
  const resolvedIssues = issues.filter(i => i.resolved_at && i.created_at);
  
  if (resolvedIssues.length === 0) return 0;
  
  const totalTime = resolvedIssues.reduce((sum, issue) => {
    const created = new Date(issue.created_at);
    const resolved = new Date(issue.resolved_at);
    return sum + (resolved - created);
  }, 0);
  
  const averageMs = totalTime / resolvedIssues.length;
  const averageHours = averageMs / (1000 * 60 * 60);
  
  return Math.round(averageHours * 10) / 10; // Round to 1 decimal
}

module.exports = IssueController;
