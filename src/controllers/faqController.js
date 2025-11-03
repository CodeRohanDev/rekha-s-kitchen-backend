const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');

class FAQController {
  // ===== ADMIN ENDPOINTS =====

  // Create FAQ
  static async createFAQ(req, res) {
    try {
      const { user } = req;
      const { question, answer, category, display_order, is_active } = req.body;

      const faqData = {
        question,
        answer,
        category: category || 'general',
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true,
        created_by: user.id,
        created_at: new Date(),
        updated_at: new Date()
      };

      const faq = await dbHelpers.createDoc(collections.FAQS, faqData);

      logger.info('FAQ created successfully', {
        faqId: faq.id,
        category: faq.category,
        createdBy: user.id
      });

      res.status(201).json({
        success: true,
        message: 'FAQ created successfully',
        data: {
          faq
        }
      });
    } catch (error) {
      logger.error('Create FAQ error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create FAQ'
        }
      });
    }
  }

  // Get all FAQs (Admin - includes inactive)
  static async getAllFAQsAdmin(req, res) {
    try {
      const { category, is_active, page = 1, limit = 50 } = req.query;

      let queries = [];

      // Filter by category
      if (category) {
        queries.push({
          type: 'where',
          field: 'category',
          operator: '==',
          value: category
        });
      }

      // Filter by active status
      if (is_active !== undefined) {
        queries.push({
          type: 'where',
          field: 'is_active',
          operator: '==',
          value: is_active === 'true'
        });
      }

      // Add ordering
      queries.push({
        type: 'orderBy',
        field: 'display_order',
        direction: 'asc'
      });

      // Get paginated FAQs
      const result = await dbHelpers.getPaginatedDocs(
        collections.FAQS,
        queries,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: {
          faqs: result.items,
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Get all FAQs admin error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get FAQs'
        }
      });
    }
  }

  // Get single FAQ by ID (Admin)
  static async getFAQById(req, res) {
    try {
      const { faqId } = req.params;

      const faq = await dbHelpers.getDoc(collections.FAQS, faqId);

      if (!faq) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'FAQ not found'
          }
        });
      }

      res.json({
        success: true,
        data: {
          faq
        }
      });
    } catch (error) {
      logger.error('Get FAQ by ID error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get FAQ'
        }
      });
    }
  }

  // Update FAQ
  static async updateFAQ(req, res) {
    try {
      const { user } = req;
      const { faqId } = req.params;
      const updateData = req.body;

      // Check if FAQ exists
      const faq = await dbHelpers.getDoc(collections.FAQS, faqId);

      if (!faq) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'FAQ not found'
          }
        });
      }

      // Update FAQ
      const updatedFAQ = await dbHelpers.updateDoc(
        collections.FAQS,
        faqId,
        {
          ...updateData,
          updated_by: user.id,
          updated_at: new Date()
        }
      );

      logger.info('FAQ updated successfully', {
        faqId,
        updatedBy: user.id
      });

      res.json({
        success: true,
        message: 'FAQ updated successfully',
        data: {
          faq: updatedFAQ
        }
      });
    } catch (error) {
      logger.error('Update FAQ error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update FAQ'
        }
      });
    }
  }

  // Delete FAQ
  static async deleteFAQ(req, res) {
    try {
      const { user } = req;
      const { faqId } = req.params;

      // Check if FAQ exists
      const faq = await dbHelpers.getDoc(collections.FAQS, faqId);

      if (!faq) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'FAQ not found'
          }
        });
      }

      // Delete FAQ
      await dbHelpers.deleteDoc(collections.FAQS, faqId);

      logger.info('FAQ deleted successfully', {
        faqId,
        deletedBy: user.id
      });

      res.json({
        success: true,
        message: 'FAQ deleted successfully'
      });
    } catch (error) {
      logger.error('Delete FAQ error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete FAQ'
        }
      });
    }
  }

  // Toggle FAQ active status
  static async toggleFAQStatus(req, res) {
    try {
      const { user } = req;
      const { faqId } = req.params;
      const { is_active } = req.body;

      // Check if FAQ exists
      const faq = await dbHelpers.getDoc(collections.FAQS, faqId);

      if (!faq) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'FAQ not found'
          }
        });
      }

      // Update status
      const updatedFAQ = await dbHelpers.updateDoc(
        collections.FAQS,
        faqId,
        {
          is_active,
          updated_by: user.id,
          updated_at: new Date()
        }
      );

      logger.info('FAQ status toggled', {
        faqId,
        isActive: is_active,
        updatedBy: user.id
      });

      res.json({
        success: true,
        message: `FAQ ${is_active ? 'activated' : 'deactivated'} successfully`,
        data: {
          faq: updatedFAQ
        }
      });
    } catch (error) {
      logger.error('Toggle FAQ status error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to toggle FAQ status'
        }
      });
    }
  }

  // Reorder FAQs
  static async reorderFAQs(req, res) {
    try {
      const { user } = req;
      const { faq_orders } = req.body;

      // Update display order for each FAQ
      const updatePromises = faq_orders.map(({ faq_id, display_order }) =>
        dbHelpers.updateDoc(collections.FAQS, faq_id, {
          display_order,
          updated_by: user.id,
          updated_at: new Date()
        })
      );

      await Promise.all(updatePromises);

      logger.info('FAQs reordered successfully', {
        count: faq_orders.length,
        updatedBy: user.id
      });

      res.json({
        success: true,
        message: 'FAQs reordered successfully'
      });
    } catch (error) {
      logger.error('Reorder FAQs error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reorder FAQs'
        }
      });
    }
  }

  // Get FAQ categories
  static async getCategories(req, res) {
    try {
      // Get all FAQs and extract unique categories
      const faqs = await dbHelpers.getDocs(collections.FAQS, [
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);

      const categories = [...new Set(faqs.map(faq => faq.category))];

      res.json({
        success: true,
        data: {
          categories: categories.map(cat => ({
            name: cat,
            count: faqs.filter(faq => faq.category === cat).length
          }))
        }
      });
    } catch (error) {
      logger.error('Get FAQ categories error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get FAQ categories'
        }
      });
    }
  }

  // ===== MOBILE/PUBLIC ENDPOINTS =====

  // Get active FAQs (Mobile)
  static async getActiveFAQs(req, res) {
    try {
      const { category, search } = req.query;

      let queries = [
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ];

      // Filter by category
      if (category) {
        queries.push({
          type: 'where',
          field: 'category',
          operator: '==',
          value: category
        });
      }

      // Add ordering
      queries.push({
        type: 'orderBy',
        field: 'display_order',
        direction: 'asc'
      });

      // Get FAQs
      let faqs = await dbHelpers.getDocs(collections.FAQS, queries);

      // Search filter (client-side since Firestore doesn't support full-text search)
      if (search) {
        const searchLower = search.toLowerCase();
        faqs = faqs.filter(faq =>
          faq.question.toLowerCase().includes(searchLower) ||
          faq.answer.toLowerCase().includes(searchLower)
        );
      }

      // Group by category
      const groupedFAQs = faqs.reduce((acc, faq) => {
        if (!acc[faq.category]) {
          acc[faq.category] = [];
        }
        acc[faq.category].push({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          display_order: faq.display_order
        });
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          faqs: groupedFAQs,
          total: faqs.length
        }
      });
    } catch (error) {
      logger.error('Get active FAQs error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get FAQs'
        }
      });
    }
  }

  // Search FAQs (Mobile)
  static async searchFAQs(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Search query must be at least 2 characters'
          }
        });
      }

      // Get all active FAQs
      const faqs = await dbHelpers.getDocs(collections.FAQS, [
        { type: 'where', field: 'is_active', operator: '==', value: true },
        { type: 'orderBy', field: 'display_order', direction: 'asc' }
      ]);

      // Search in question and answer
      const searchLower = q.toLowerCase();
      const results = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower)
      ).map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category
      }));

      res.json({
        success: true,
        data: {
          results,
          total: results.length,
          query: q
        }
      });
    } catch (error) {
      logger.error('Search FAQs error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search FAQs'
        }
      });
    }
  }
}

module.exports = FAQController;
