const { dbHelpers, collections } = require('../config/database');
const AuthUtils = require('../utils/auth');
const logger = require('../utils/logger');
const StorageUtils = require('../utils/storage');

class BannerController {
    // Upload banner image AND create banner in one step
    static async uploadAndCreateBanner(req, res) {
        try {
            const { user: currentUser } = req;

            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'NO_FILE',
                        message: 'No image file provided'
                    }
                });
            }

            // Validate file
            const validation = StorageUtils.validateImageFile(req.file);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_FILE',
                        message: validation.error
                    }
                });
            }

            // Get banner data from form fields
            const {
                title,
                subtitle = '',
                description = '',
                banner_type = 'promotional',
                action_type = 'none',
                action_data,
                target_audience = 'all',
                applicable_outlets,
                display_order = 0,
                start_date,
                end_date,
                is_active = true
            } = req.body;

            // Validate required fields
            if (!title || title.length < 3) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Title is required and must be at least 3 characters'
                    }
                });
            }

            // Generate filename
            const fileExtension = StorageUtils.getFileExtension(req.file.mimetype);
            const fileName = `banner-${Date.now()}.${fileExtension}`;

            // Upload to Cloudinary
            const imageUrl = await StorageUtils.uploadFile(
                req.file.buffer,
                fileName,
                'banners',
                req.file.mimetype
            );

            // Determine applicable outlets based on user role
            let finalApplicableOutlets = [];

            if (currentUser.role === 'super_admin') {
                finalApplicableOutlets = applicable_outlets ? JSON.parse(applicable_outlets) : [];
            } else if (currentUser.role === 'outlet_admin') {
                const userOutlets = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
                    { type: 'where', field: 'is_active', operator: '==', value: true }
                ]);

                if (userOutlets.length === 0) {
                    return res.status(403).json({
                        success: false,
                        error: {
                            code: 'FORBIDDEN',
                            message: 'No outlet assigned to you'
                        }
                    });
                }

                finalApplicableOutlets = userOutlets.map(outlet => outlet.outlet_id);
            }

            // Create banner
            const bannerData = {
                title,
                subtitle: subtitle || null,
                description: description || null,
                image_url: imageUrl,
                banner_type,
                action_type,
                action_data: action_data ? JSON.parse(action_data) : null,
                target_audience,
                applicable_outlets: finalApplicableOutlets,
                is_global: currentUser.role === 'super_admin' && finalApplicableOutlets.length === 0,
                display_order: parseInt(display_order) || 0,
                start_date: start_date ? new Date(start_date) : new Date(),
                end_date: end_date ? new Date(end_date) : null,
                is_active: is_active === 'true' || is_active === true,
                views_count: 0,
                clicks_count: 0,
                created_by: currentUser.id,
                created_by_role: currentUser.role,
                created_at: new Date(),
                updated_at: new Date()
            };

            const bannerId = await dbHelpers.createDoc(collections.BANNERS, bannerData);

            logger.info('Banner created successfully with image', {
                bannerId,
                imageUrl,
                createdBy: currentUser.id
            });

            res.status(201).json({
                success: true,
                message: 'Banner created successfully',
                data: {
                    banner_id: bannerId,
                    banner: { id: bannerId, ...bannerData }
                }
            });
        } catch (error) {
            logger.error('Upload and create banner error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create banner'
                }
            });
        }
    }

    // Upload banner image only (for separate workflow)
    static async uploadBannerImage(req, res) {
        try {
            const { user: currentUser } = req;

            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'NO_FILE',
                        message: 'No image file provided'
                    }
                });
            }

            // Validate file
            const validation = StorageUtils.validateImageFile(req.file);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_FILE',
                        message: validation.error
                    }
                });
            }

            // Generate filename
            const fileExtension = StorageUtils.getFileExtension(req.file.mimetype);
            const fileName = `banner-${Date.now()}.${fileExtension}`;

            // Upload to Cloudinary
            const imageUrl = await StorageUtils.uploadFile(
                req.file.buffer,
                fileName,
                'banners',
                req.file.mimetype
            );

            logger.info('Banner image uploaded successfully', {
                fileName,
                imageUrl,
                uploadedBy: currentUser.id
            });

            res.status(201).json({
                success: true,
                message: 'Image uploaded successfully',
                data: {
                    image_url: imageUrl,
                    file_name: fileName,
                    file_size: req.file.size,
                    mime_type: req.file.mimetype
                }
            });
        } catch (error) {
            logger.error('Upload banner image error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'UPLOAD_FAILED',
                    message: 'Failed to upload image'
                }
            });
        }
    }
    // Create banner (Super Admin & Outlet Admin)
    static async createBanner(req, res) {
        try {
            const {
                title,
                subtitle,
                description,
                image_url,
                banner_type,
                action_type,
                action_data,
                target_audience,
                applicable_outlets,
                display_order,
                start_date,
                end_date,
                is_active = true
            } = req.body;
            const { user: currentUser } = req;

            // Determine applicable outlets based on user role
            let finalApplicableOutlets = [];

            if (currentUser.role === 'super_admin') {
                // Super admin: can create banners for all outlets or specific outlets
                finalApplicableOutlets = applicable_outlets || []; // Empty array = all outlets
            } else if (currentUser.role === 'outlet_admin') {
                // Outlet admin: can only create banners for their assigned outlets
                const userOutlets = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
                    { type: 'where', field: 'is_active', operator: '==', value: true }
                ]);

                if (userOutlets.length === 0) {
                    return res.status(403).json({
                        success: false,
                        error: {
                            code: 'FORBIDDEN',
                            message: 'No outlet assigned to you'
                        }
                    });
                }

                // Restrict to outlet admin's outlets only
                finalApplicableOutlets = userOutlets.map(outlet => outlet.outlet_id);
            }

            // Create banner
            const bannerData = {
                title,
                subtitle: subtitle || null,
                description: description || null,
                image_url,
                banner_type, // 'promotional', 'offer', 'announcement', 'seasonal'
                action_type, // 'none', 'deep_link', 'menu_item', 'category', 'outlet', 'coupon', 'external_url'
                action_data: action_data || null, // Data based on action_type
                target_audience: target_audience || 'all', // 'all', 'new_users', 'loyal_customers', 'location_based'
                applicable_outlets: finalApplicableOutlets,
                is_global: currentUser.role === 'super_admin' && (!applicable_outlets || applicable_outlets.length === 0),
                display_order: display_order || 0,
                start_date: start_date ? new Date(start_date) : new Date(),
                end_date: end_date ? new Date(end_date) : null,
                is_active,
                views_count: 0,
                clicks_count: 0,
                created_by: currentUser.id,
                created_by_role: currentUser.role,
                created_at: new Date(),
                updated_at: new Date()
            };

            const bannerId = await dbHelpers.createDoc(collections.BANNERS, bannerData);

            logger.info('Banner created successfully', { bannerId, createdBy: currentUser.id });

            res.status(201).json({
                success: true,
                message: 'Banner created successfully',
                data: {
                    banner_id: bannerId,
                    banner: { id: bannerId, ...bannerData }
                }
            });
        } catch (error) {
            logger.error('Create banner error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create banner'
                }
            });
        }
    }

    // Get all banners (Public - for customer app)
    static async getBanners(req, res) {
        try {
            const { outlet_id, banner_type, active_only } = req.query;
            const currentDate = new Date();

            let queries = [];

            // Filter by active status (only if explicitly requested)
            if (active_only === 'true') {
                queries.push({ type: 'where', field: 'is_active', operator: '==', value: true });
            } else if (active_only === 'false') {
                queries.push({ type: 'where', field: 'is_active', operator: '==', value: false });
            }
            // If active_only is not provided, fetch all banners regardless of status

            // Filter by banner type
            if (banner_type) {
                queries.push({ type: 'where', field: 'banner_type', operator: '==', value: banner_type });
            }

            // Get all banners
            let banners = await dbHelpers.getDocs(collections.BANNERS, queries);

            // Filter by date range
            banners = banners.filter(banner => {
                const startDate = banner.start_date?.toDate ? banner.start_date.toDate() : new Date(banner.start_date);
                const endDate = banner.end_date?.toDate ? banner.end_date.toDate() : (banner.end_date ? new Date(banner.end_date) : null);

                const isStarted = startDate <= currentDate;
                const isNotExpired = !endDate || endDate >= currentDate;

                return isStarted && isNotExpired;
            });

            // Filter by outlet
            if (outlet_id) {
                banners = banners.filter(banner =>
                    banner.is_global ||
                    !banner.applicable_outlets ||
                    banner.applicable_outlets.length === 0 ||
                    banner.applicable_outlets.includes(outlet_id)
                );
            } else {
                // If no outlet specified, only show global banners
                banners = banners.filter(banner => banner.is_global);
            }

            // Sort by display_order and created_at
            banners.sort((a, b) => {
                if (a.display_order !== b.display_order) {
                    return (a.display_order || 0) - (b.display_order || 0);
                }
                const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
                const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
                return dateB - dateA;
            });

            res.json({
                success: true,
                data: {
                    banners,
                    total: banners.length
                }
            });
        } catch (error) {
            logger.error('Get banners error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get banners'
                }
            });
        }
    }

    // Get banner by ID
    static async getBannerById(req, res) {
        try {
            const { bannerId } = req.params;

            const banner = await dbHelpers.getDoc(collections.BANNERS, bannerId);

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Banner not found'
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    banner: { id: bannerId, ...banner }
                }
            });
        } catch (error) {
            logger.error('Get banner error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get banner'
                }
            });
        }
    }

    // Update banner (Super Admin & Outlet Admin)
    static async updateBanner(req, res) {
        try {
            const { bannerId } = req.params;
            const updateData = req.body;
            const { user: currentUser } = req;

            // Get existing banner
            const banner = await dbHelpers.getDoc(collections.BANNERS, bannerId);

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Banner not found'
                    }
                });
            }

            // Check permissions
            if (currentUser.role === 'outlet_admin') {
                // Outlet admin can only update banners they created or for their outlets
                const userOutlets = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
                    { type: 'where', field: 'is_active', operator: '==', value: true }
                ]);
                const userOutletIds = userOutlets.map(outlet => outlet.outlet_id);

                const canEdit = banner.created_by === currentUser.id ||
                    banner.applicable_outlets?.some(outletId => userOutletIds.includes(outletId));

                if (!canEdit) {
                    return res.status(403).json({
                        success: false,
                        error: {
                            code: 'FORBIDDEN',
                            message: 'You can only update banners for your assigned outlets'
                        }
                    });
                }

                // Restrict outlet changes
                if (updateData.applicable_outlets) {
                    const invalidOutlets = updateData.applicable_outlets.filter(
                        outletId => !userOutletIds.includes(outletId)
                    );

                    if (invalidOutlets.length > 0) {
                        return res.status(403).json({
                            success: false,
                            error: {
                                code: 'FORBIDDEN',
                                message: 'Cannot assign banner to outlets you do not manage'
                            }
                        });
                    }
                }
            }

            // Prepare update data
            const finalUpdateData = {
                ...updateData,
                updated_at: new Date(),
                updated_by: currentUser.id
            };

            // Convert dates if provided
            if (updateData.start_date) {
                finalUpdateData.start_date = new Date(updateData.start_date);
            }
            if (updateData.end_date) {
                finalUpdateData.end_date = new Date(updateData.end_date);
            }

            // Update banner
            await dbHelpers.updateDoc(collections.BANNERS, bannerId, finalUpdateData);

            logger.info('Banner updated successfully', { bannerId, updatedBy: currentUser.id });

            res.json({
                success: true,
                message: 'Banner updated successfully'
            });
        } catch (error) {
            logger.error('Update banner error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to update banner'
                }
            });
        }
    }

    // Delete banner (Super Admin & Outlet Admin)
    static async deleteBanner(req, res) {
        try {
            const { bannerId } = req.params;
            const { user: currentUser } = req;

            // Get existing banner
            const banner = await dbHelpers.getDoc(collections.BANNERS, bannerId);

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Banner not found'
                    }
                });
            }

            // Check permissions
            if (currentUser.role === 'outlet_admin') {
                // Outlet admin can only delete banners they created
                if (banner.created_by !== currentUser.id) {
                    return res.status(403).json({
                        success: false,
                        error: {
                            code: 'FORBIDDEN',
                            message: 'You can only delete banners you created'
                        }
                    });
                }
            }

            // Delete image from storage if it's a Firebase Storage URL
            if (banner.image_url && banner.image_url.includes('storage.googleapis.com')) {
                await StorageUtils.deleteFile(banner.image_url);
            }

            // Delete banner
            await dbHelpers.deleteDoc(collections.BANNERS, bannerId);

            logger.info('Banner deleted successfully', { bannerId, deletedBy: currentUser.id });

            res.json({
                success: true,
                message: 'Banner deleted successfully'
            });
        } catch (error) {
            logger.error('Delete banner error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to delete banner'
                }
            });
        }
    }

    // Delete banner image from storage
    static async deleteBannerImage(req, res) {
        try {
            const { user: currentUser } = req;
            const { image_url } = req.body;

            if (!image_url) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_URL',
                        message: 'Image URL is required'
                    }
                });
            }

            // Verify it's a Firebase Storage URL
            if (!image_url.includes('storage.googleapis.com')) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_URL',
                        message: 'Only Firebase Storage URLs can be deleted'
                    }
                });
            }

            // Delete from storage
            const deleted = await StorageUtils.deleteFile(image_url);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Image not found in storage'
                    }
                });
            }

            logger.info('Banner image deleted from storage', { image_url, deletedBy: currentUser.id });

            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } catch (error) {
            logger.error('Delete banner image error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to delete image'
                }
            });
        }
    }

    // Track banner view
    static async trackBannerView(req, res) {
        try {
            const { bannerId } = req.params;

            const banner = await dbHelpers.getDoc(collections.BANNERS, bannerId);

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Banner not found'
                    }
                });
            }

            // Increment view count
            await dbHelpers.updateDoc(collections.BANNERS, bannerId, {
                views_count: (banner.views_count || 0) + 1
            });

            res.json({
                success: true,
                message: 'View tracked successfully'
            });
        } catch (error) {
            logger.error('Track banner view error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to track view'
                }
            });
        }
    }

    // Track banner click
    static async trackBannerClick(req, res) {
        try {
            const { bannerId } = req.params;

            const banner = await dbHelpers.getDoc(collections.BANNERS, bannerId);

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Banner not found'
                    }
                });
            }

            // Increment click count
            await dbHelpers.updateDoc(collections.BANNERS, bannerId, {
                clicks_count: (banner.clicks_count || 0) + 1
            });

            res.json({
                success: true,
                message: 'Click tracked successfully',
                data: {
                    action_type: banner.action_type,
                    action_data: banner.action_data
                }
            });
        } catch (error) {
            logger.error('Track banner click error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to track click'
                }
            });
        }
    }

    // Get banner analytics (Admin only)
    static async getBannerAnalytics(req, res) {
        try {
            const { bannerId } = req.params;
            const { user: currentUser } = req;

            const banner = await dbHelpers.getDoc(collections.BANNERS, bannerId);

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Banner not found'
                    }
                });
            }

            // Check permissions for outlet admin
            if (currentUser.role === 'outlet_admin') {
                const userOutlets = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
                    { type: 'where', field: 'is_active', operator: '==', value: true }
                ]);
                const userOutletIds = userOutlets.map(outlet => outlet.outlet_id);

                const canView = banner.created_by === currentUser.id ||
                    banner.applicable_outlets?.some(outletId => userOutletIds.includes(outletId));

                if (!canView) {
                    return res.status(403).json({
                        success: false,
                        error: {
                            code: 'FORBIDDEN',
                            message: 'You can only view analytics for your banners'
                        }
                    });
                }
            }

            const analytics = {
                banner_id: bannerId,
                title: banner.title,
                views_count: banner.views_count || 0,
                clicks_count: banner.clicks_count || 0,
                click_through_rate: banner.views_count > 0
                    ? ((banner.clicks_count || 0) / banner.views_count * 100).toFixed(2) + '%'
                    : '0%',
                is_active: banner.is_active,
                start_date: banner.start_date,
                end_date: banner.end_date,
                created_at: banner.created_at
            };

            res.json({
                success: true,
                data: { analytics }
            });
        } catch (error) {
            logger.error('Get banner analytics error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get analytics'
                }
            });
        }
    }

    // Toggle banner active status (Admin only)
    static async toggleBannerStatus(req, res) {
        try {
            const { bannerId } = req.params;
            const { is_active } = req.body;
            const { user: currentUser } = req;

            const banner = await dbHelpers.getDoc(collections.BANNERS, bannerId);

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Banner not found'
                    }
                });
            }

            // Check permissions for outlet admin
            if (currentUser.role === 'outlet_admin' && banner.created_by !== currentUser.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'You can only toggle status of banners you created'
                    }
                });
            }

            await dbHelpers.updateDoc(collections.BANNERS, bannerId, {
                is_active,
                updated_at: new Date(),
                updated_by: currentUser.id
            });

            logger.info('Banner status toggled', { bannerId, is_active, updatedBy: currentUser.id });

            res.json({
                success: true,
                message: `Banner ${is_active ? 'activated' : 'deactivated'} successfully`
            });
        } catch (error) {
            logger.error('Toggle banner status error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to toggle banner status'
                }
            });
        }
    }
}

module.exports = BannerController;
