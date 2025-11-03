const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');

class ReviewController {
    // Create review
    static async createReview(req, res) {
        try {
            const {
                order_id,
                rating,
                comment,
                food_rating,
                delivery_rating,
                service_rating,
                images
            } = req.body;
            const { user: currentUser } = req;

            // Verify order exists and belongs to customer
            const order = await dbHelpers.getDoc(collections.ORDERS, order_id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Order not found'
                    }
                });
            }

            if (order.customer_id !== currentUser.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'You can only review your own orders'
                    }
                });
            }

            // Check if order is completed/delivered
            if (!['delivered', 'completed'].includes(order.status)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Can only review completed orders'
                    }
                });
            }

            // Check if review already exists
            const existingReviews = await dbHelpers.getDocs(collections.REVIEWS, [
                { type: 'where', field: 'order_id', operator: '==', value: order_id }
            ]);

            if (existingReviews.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'CONFLICT',
                        message: 'Review already exists for this order'
                    }
                });
            }

            // Create review
            const reviewData = {
                order_id,
                customer_id: currentUser.id,
                outlet_id: order.outlet_id,
                rating: parseInt(rating),
                comment: comment || null,
                food_rating: food_rating ? parseInt(food_rating) : null,
                delivery_rating: delivery_rating ? parseInt(delivery_rating) : null,
                service_rating: service_rating ? parseInt(service_rating) : null,
                images: images || [],
                is_verified: true, // Verified because linked to actual order
                is_visible: true,
                admin_response: null,
                responded_at: null,
                helpful_count: 0,
                reported_count: 0
            };

            const review = await dbHelpers.createDoc(collections.REVIEWS, reviewData);

            // Update menu items ratings
            for (const item of order.items) {
                const menuItem = await dbHelpers.getDoc(collections.MENU_ITEMS, item.menu_item_id);
                if (menuItem) {
                    const newReviewCount = (menuItem.review_count || 0) + 1;
                    const newAverageRating = (
                        ((menuItem.average_rating || 0) * (menuItem.review_count || 0) + rating) /
                        newReviewCount
                    );

                    await dbHelpers.updateDoc(collections.MENU_ITEMS, item.menu_item_id, {
                        review_count: newReviewCount,
                        average_rating: parseFloat(newAverageRating.toFixed(2))
                    });
                }
            }

            // Update outlet rating (simplified - you can make this more sophisticated)
            const outlet = await dbHelpers.getDoc(collections.OUTLETS, order.outlet_id);
            if (outlet) {
                const outletReviews = await dbHelpers.getDocs(collections.REVIEWS, [
                    { type: 'where', field: 'outlet_id', operator: '==', value: order.outlet_id }
                ]);

                const totalRating = outletReviews.reduce((sum, r) => sum + r.rating, 0) + rating;
                const avgRating = totalRating / (outletReviews.length + 1);

                await dbHelpers.updateDoc(collections.OUTLETS, order.outlet_id, {
                    average_rating: parseFloat(avgRating.toFixed(2)),
                    review_count: outletReviews.length + 1
                });
            }

            logger.info('Review created successfully', {
                reviewId: review.id,
                orderId: order_id,
                customerId: currentUser.id,
                rating
            });

            res.status(201).json({
                success: true,
                message: 'Review submitted successfully',
                data: {
                    review_id: review.id,
                    rating: review.rating,
                    created_at: review.created_at
                }
            });
        } catch (error) {
            logger.error('Review creation error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create review'
                }
            });
        }
    }

    // Get reviews for menu item
    static async getMenuItemReviews(req, res) {
        try {
            const { itemId } = req.params;
            const { page = 1, limit = 10, sort = 'recent' } = req.query;

            // Get orders containing this item
            const allOrders = await dbHelpers.getDocs(collections.ORDERS);
            const orderIds = allOrders
                .filter(order => order.items.some(item => item.menu_item_id === itemId))
                .map(order => order.id);

            if (orderIds.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        reviews: [],
                        pagination: { page: 1, limit: 10, total: 0 }
                    }
                });
            }

            // Get reviews for these orders
            let reviews = [];
            for (const orderId of orderIds) {
                const orderReviews = await dbHelpers.getDocs(collections.REVIEWS, [
                    { type: 'where', field: 'order_id', operator: '==', value: orderId },
                    { type: 'where', field: 'is_visible', operator: '==', value: true }
                ]);
                reviews.push(...orderReviews);
            }

            // Sort reviews
            if (sort === 'recent') {
                reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } else if (sort === 'rating_high') {
                reviews.sort((a, b) => b.rating - a.rating);
            } else if (sort === 'rating_low') {
                reviews.sort((a, b) => a.rating - b.rating);
            } else if (sort === 'helpful') {
                reviews.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
            }

            // Get customer details for each review
            for (let review of reviews) {
                const customer = await dbHelpers.getDoc(collections.USER_PROFILES, review.customer_id);
                review.customer_name = customer ? `${customer.first_name} ${customer.last_name.charAt(0)}.` : 'Anonymous';
            }

            res.json({
                success: true,
                data: {
                    reviews,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: reviews.length
                    }
                }
            });
        } catch (error) {
            logger.error('Get menu item reviews error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get reviews'
                }
            });
        }
    }

    // Get reviews for outlet
    static async getOutletReviews(req, res) {
        try {
            const { outletId } = req.params;
            const { page = 1, limit = 10, rating_filter, sort = 'recent' } = req.query;

            let queries = [
                { type: 'where', field: 'outlet_id', operator: '==', value: outletId },
                { type: 'where', field: 'is_visible', operator: '==', value: true }
            ];

            if (rating_filter) {
                queries.push({ type: 'where', field: 'rating', operator: '==', value: parseInt(rating_filter) });
            }

            let reviews = await dbHelpers.getDocs(collections.REVIEWS, queries);

            // Sort reviews
            if (sort === 'recent') {
                reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } else if (sort === 'rating_high') {
                reviews.sort((a, b) => b.rating - a.rating);
            } else if (sort === 'rating_low') {
                reviews.sort((a, b) => a.rating - b.rating);
            } else if (sort === 'helpful') {
                reviews.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
            }

            // Get customer details
            for (let review of reviews) {
                const customer = await dbHelpers.getDoc(collections.USER_PROFILES, review.customer_id);
                review.customer_name = customer ? `${customer.first_name} ${customer.last_name.charAt(0)}.` : 'Anonymous';
            }

            res.json({
                success: true,
                data: {
                    reviews,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: reviews.length
                    }
                }
            });
        } catch (error) {
            logger.error('Get outlet reviews error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get reviews'
                }
            });
        }
    }

    // Get customer's reviews
    static async getCustomerReviews(req, res) {
        try {
            const { user: currentUser } = req;
            const { page = 1, limit = 10 } = req.query;

            const reviews = await dbHelpers.getDocs(
                collections.REVIEWS,
                [{ type: 'where', field: 'customer_id', operator: '==', value: currentUser.id }],
                { field: 'created_at', direction: 'desc' },
                parseInt(limit)
            );

            // Get order details for each review
            for (let review of reviews) {
                const order = await dbHelpers.getDoc(collections.ORDERS, review.order_id);
                if (order) {
                    review.order_number = order.order_number;
                    review.order_date = order.created_at;
                }

                const outlet = await dbHelpers.getDoc(collections.OUTLETS, review.outlet_id);
                review.outlet_name = outlet ? outlet.name : 'Unknown';
            }

            res.json({
                success: true,
                data: {
                    reviews,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: reviews.length
                    }
                }
            });
        } catch (error) {
            logger.error('Get customer reviews error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get reviews'
                }
            });
        }
    }

    // Get single review
    static async getReview(req, res) {
        try {
            const { reviewId } = req.params;

            const review = await dbHelpers.getDoc(collections.REVIEWS, reviewId);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Review not found'
                    }
                });
            }

            // Get additional details
            const customer = await dbHelpers.getDoc(collections.USER_PROFILES, review.customer_id);
            review.customer_name = customer ? `${customer.first_name} ${customer.last_name.charAt(0)}.` : 'Anonymous';

            const order = await dbHelpers.getDoc(collections.ORDERS, review.order_id);
            if (order) {
                review.order_number = order.order_number;
            }

            const outlet = await dbHelpers.getDoc(collections.OUTLETS, review.outlet_id);
            review.outlet_name = outlet ? outlet.name : 'Unknown';

            res.json({
                success: true,
                data: { review }
            });
        } catch (error) {
            logger.error('Get review error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get review'
                }
            });
        }
    }

    // Update review
    static async updateReview(req, res) {
        try {
            const { reviewId } = req.params;
            const { rating, comment, food_rating, delivery_rating, service_rating, images } = req.body;
            const { user: currentUser } = req;

            const review = await dbHelpers.getDoc(collections.REVIEWS, reviewId);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Review not found'
                    }
                });
            }

            // Only customer who created review can update it
            if (review.customer_id !== currentUser.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'You can only update your own reviews'
                    }
                });
            }

            const updateData = {};
            if (rating !== undefined) updateData.rating = parseInt(rating);
            if (comment !== undefined) updateData.comment = comment;
            if (food_rating !== undefined) updateData.food_rating = parseInt(food_rating);
            if (delivery_rating !== undefined) updateData.delivery_rating = parseInt(delivery_rating);
            if (service_rating !== undefined) updateData.service_rating = parseInt(service_rating);
            if (images !== undefined) updateData.images = images;

            const updatedReview = await dbHelpers.updateDoc(collections.REVIEWS, reviewId, updateData);

            logger.info('Review updated successfully', {
                reviewId,
                customerId: currentUser.id
            });

            res.json({
                success: true,
                message: 'Review updated successfully',
                data: { review: updatedReview }
            });
        } catch (error) {
            logger.error('Update review error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to update review'
                }
            });
        }
    }

    // Delete review
    static async deleteReview(req, res) {
        try {
            const { reviewId } = req.params;
            const { user: currentUser } = req;

            const review = await dbHelpers.getDoc(collections.REVIEWS, reviewId);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Review not found'
                    }
                });
            }

            // Only customer or admin can delete
            if (review.customer_id !== currentUser.id && !['super_admin', 'outlet_admin'].includes(currentUser.role)) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'Access denied'
                    }
                });
            }

            // Soft delete - hide instead of actual deletion
            await dbHelpers.updateDoc(collections.REVIEWS, reviewId, {
                is_visible: false,
                deleted_by: currentUser.id,
                deleted_at: new Date()
            });

            logger.info('Review deleted successfully', {
                reviewId,
                deletedBy: currentUser.id
            });

            res.json({
                success: true,
                message: 'Review deleted successfully'
            });
        } catch (error) {
            logger.error('Delete review error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to delete review'
                }
            });
        }
    }

    // Admin response to review
    static async respondToReview(req, res) {
        try {
            const { reviewId } = req.params;
            const { response } = req.body;
            const { user: currentUser } = req;

            const review = await dbHelpers.getDoc(collections.REVIEWS, reviewId);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Review not found'
                    }
                });
            }

            await dbHelpers.updateDoc(collections.REVIEWS, reviewId, {
                admin_response: response,
                responded_by: currentUser.id,
                responded_at: new Date()
            });

            logger.info('Admin responded to review', {
                reviewId,
                respondedBy: currentUser.id
            });

            res.json({
                success: true,
                message: 'Response added successfully'
            });
        } catch (error) {
            logger.error('Respond to review error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to respond to review'
                }
            });
        }
    }

    // Mark review as helpful
    static async markHelpful(req, res) {
        try {
            const { reviewId } = req.params;

            const review = await dbHelpers.getDoc(collections.REVIEWS, reviewId);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Review not found'
                    }
                });
            }

            await dbHelpers.updateDoc(collections.REVIEWS, reviewId, {
                helpful_count: (review.helpful_count || 0) + 1
            });

            res.json({
                success: true,
                message: 'Marked as helpful'
            });
        } catch (error) {
            logger.error('Mark helpful error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to mark as helpful'
                }
            });
        }
    }

    // Report review
    static async reportReview(req, res) {
        try {
            const { reviewId } = req.params;
            const { reason } = req.body;
            const { user: currentUser } = req;

            const review = await dbHelpers.getDoc(collections.REVIEWS, reviewId);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Review not found'
                    }
                });
            }

            await dbHelpers.updateDoc(collections.REVIEWS, reviewId, {
                reported_count: (review.reported_count || 0) + 1,
                last_report_reason: reason,
                last_reported_by: currentUser.id,
                last_reported_at: new Date()
            });

            logger.info('Review reported', {
                reviewId,
                reportedBy: currentUser.id,
                reason
            });

            res.json({
                success: true,
                message: 'Review reported successfully'
            });
        } catch (error) {
            logger.error('Report review error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to report review'
                }
            });
        }
    }

    // Get review statistics
    static async getReviewStats(req, res) {
        try {
            const { outlet_id } = req.query;

            let queries = [];
            if (outlet_id) {
                queries.push({ type: 'where', field: 'outlet_id', operator: '==', value: outlet_id });
            }

            const reviews = await dbHelpers.getDocs(collections.REVIEWS, queries);

            const stats = {
                total_reviews: reviews.length,
                average_rating: reviews.length > 0
                    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2))
                    : 0,
                rating_distribution: {
                    5: reviews.filter(r => r.rating === 5).length,
                    4: reviews.filter(r => r.rating === 4).length,
                    3: reviews.filter(r => r.rating === 3).length,
                    2: reviews.filter(r => r.rating === 2).length,
                    1: reviews.filter(r => r.rating === 1).length
                },
                verified_reviews: reviews.filter(r => r.is_verified).length,
                with_comments: reviews.filter(r => r.comment).length,
                with_images: reviews.filter(r => r.images && r.images.length > 0).length
            };

            res.json({
                success: true,
                data: { stats }
            });
        } catch (error) {
            logger.error('Get review stats error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get review statistics'
                }
            });
        }
    }

    // Get top-rated food items
    static async getTopRatedFood(req, res) {
        try {
            const { outlet_id, limit = 10, min_reviews = 5 } = req.query;

            // Get all menu items
            let menuItems = await dbHelpers.getDocs(collections.MENU_ITEMS, [
                { type: 'where', field: 'is_active', operator: '==', value: true }
            ]);

            // Filter by outlet if specified
            if (outlet_id) {
                menuItems = menuItems.filter(item =>
                    !item.outlet_specific ||
                    (item.outlet_ids && item.outlet_ids.includes(outlet_id))
                );
            }

            // Filter items with minimum reviews and sort by rating
            const topRated = menuItems
                .filter(item => (item.review_count || 0) >= parseInt(min_reviews))
                .sort((a, b) => {
                    if (b.average_rating !== a.average_rating) {
                        return (b.average_rating || 0) - (a.average_rating || 0);
                    }
                    return (b.review_count || 0) - (a.review_count || 0);
                })
                .slice(0, parseInt(limit));

            // Get category names
            for (let item of topRated) {
                const category = await dbHelpers.getDoc(collections.MENU_CATEGORIES, item.category_id);
                item.category_name = category ? category.name : 'Unknown';
            }

            res.json({
                success: true,
                data: {
                    top_rated_items: topRated,
                    count: topRated.length
                }
            });
        } catch (error) {
            logger.error('Get top rated food error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get top rated food'
                }
            });
        }
    }

    // Get outlet-specific top rated items
    static async getOutletTopRated(req, res) {
        try {
            const { outletId } = req.params;
            const { limit = 10 } = req.query;

            const outlet = await dbHelpers.getDoc(collections.OUTLETS, outletId);
            if (!outlet) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Outlet not found'
                    }
                });
            }

            // Get all menu items
            let menuItems = await dbHelpers.getDocs(collections.MENU_ITEMS, [
                { type: 'where', field: 'is_active', operator: '==', value: true }
            ]);

            // Filter by outlet
            menuItems = menuItems.filter(item =>
                !item.outlet_specific ||
                (item.outlet_ids && item.outlet_ids.includes(outletId))
            );

            // Sort by rating and review count
            const topRated = menuItems
                .filter(item => (item.review_count || 0) > 0)
                .sort((a, b) => {
                    if (b.average_rating !== a.average_rating) {
                        return (b.average_rating || 0) - (a.average_rating || 0);
                    }
                    return (b.review_count || 0) - (a.review_count || 0);
                })
                .slice(0, parseInt(limit));

            // Get category names
            for (let item of topRated) {
                const category = await dbHelpers.getDoc(collections.MENU_CATEGORIES, item.category_id);
                item.category_name = category ? category.name : 'Unknown';
            }

            res.json({
                success: true,
                data: {
                    outlet_id: outletId,
                    outlet_name: outlet.name,
                    top_rated_items: topRated,
                    count: topRated.length
                }
            });
        } catch (error) {
            logger.error('Get outlet top rated error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get outlet top rated items'
                }
            });
        }
    }
}

module.exports = ReviewController;