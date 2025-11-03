const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');

class AnalyticsController {
    // ===== DASHBOARD OVERVIEW =====

    // Get dashboard overview
    static async getDashboardOverview(req, res) {
        try {
            const { period = '30' } = req.query;
            const daysAgo = parseInt(period);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysAgo);

            // Get all orders
            const allOrders = await dbHelpers.getDocs(collections.ORDERS);
            const periodOrders = allOrders.filter(o => new Date(o.created_at) >= startDate);

            // Get all users
            const allUsers = await dbHelpers.getDocs(collections.USERS);
            const customers = allUsers.filter(u => u.role === 'customer');

            // Calculate metrics
            const totalRevenue = periodOrders
                .filter(o => o.status === 'delivered')
                .reduce((sum, o) => sum + (o.total || 0), 0);

            const totalOrders = periodOrders.length;
            const completedOrders = periodOrders.filter(o => o.status === 'delivered').length;
            const cancelledOrders = periodOrders.filter(o => o.status === 'cancelled').length;

            const overview = {
                period: {
                    days: daysAgo,
                    start_date: startDate,
                    end_date: new Date()
                },
                revenue: {
                    total: totalRevenue,
                    average_per_order: totalOrders > 0 ? totalRevenue / completedOrders : 0
                },
                orders: {
                    total: totalOrders,
                    completed: completedOrders,
                    cancelled: cancelledOrders,
                    completion_rate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
                },
                customers: {
                    total: customers.length,
                    new_in_period: customers.filter(c => new Date(c.created_at) >= startDate).length
                }
            };

            res.json({
                success: true,
                data: overview
            });
        } catch (error) {
            logger.error('Get dashboard overview error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get dashboard overview'
                }
            });
        }
    }

    // ===== USER ACTIVITY ANALYTICS =====

    // Get active users (DAU, WAU, MAU)
    static async getActiveUsers(req, res) {
        try {
            const now = new Date();

            // Get all orders to track activity
            const allOrders = await dbHelpers.getDocs(collections.ORDERS);

            // Daily Active Users (last 24 hours)
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const dailyActiveUserIds = new Set(
                allOrders
                    .filter(o => new Date(o.created_at) >= oneDayAgo)
                    .map(o => o.user_id)
            );

            // Weekly Active Users (last 7 days)
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const weeklyActiveUserIds = new Set(
                allOrders
                    .filter(o => new Date(o.created_at) >= oneWeekAgo)
                    .map(o => o.user_id)
            );

            // Monthly Active Users (last 30 days)
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const monthlyActiveUserIds = new Set(
                allOrders
                    .filter(o => new Date(o.created_at) >= oneMonthAgo)
                    .map(o => o.user_id)
            );

            res.json({
                success: true,
                data: {
                    daily_active_users: dailyActiveUserIds.size,
                    weekly_active_users: weeklyActiveUserIds.size,
                    monthly_active_users: monthlyActiveUserIds.size,
                    timestamp: now
                }
            });
        } catch (error) {
            logger.error('Get active users error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get active users'
                }
            });
        }
    }

    // Get active users trend (daily breakdown)
    static async getActiveUsersTrend(req, res) {
        try {
            const { days = '30' } = req.query;
            const numDays = parseInt(days);
            const now = new Date();

            const allOrders = await dbHelpers.getDocs(collections.ORDERS);

            const trend = [];
            for (let i = numDays - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);

                const nextDate = new Date(date);
                nextDate.setDate(nextDate.getDate() + 1);

                const activeUsers = new Set(
                    allOrders
                        .filter(o => {
                            const orderDate = new Date(o.created_at);
                            return orderDate >= date && orderDate < nextDate;
                        })
                        .map(o => o.user_id)
                );

                trend.push({
                    date: date.toISOString().split('T')[0],
                    active_users: activeUsers.size
                });
            }

            res.json({
                success: true,
                data: {
                    period: `${numDays} days`,
                    trend
                }
            });
        } catch (error) {
            logger.error('Get active users trend error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get active users trend'
                }
            });
        }
    }

    // ===== CUSTOMER ORDER BEHAVIOR ANALYTICS =====

    // Get customer order behavior analysis
    static async getCustomerOrderBehavior(req, res) {
        try {
            const { period = '30' } = req.query;
            const daysAgo = parseInt(period);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysAgo);

            const allOrders = await dbHelpers.getDocs(collections.ORDERS);
            const periodOrders = allOrders.filter(o => new Date(o.created_at) >= startDate);

            // Group orders by user
            const userOrders = {};
            periodOrders.forEach(order => {
                if (!userOrders[order.user_id]) {
                    userOrders[order.user_id] = [];
                }
                userOrders[order.user_id].push(order);
            });

            // Calculate behavior metrics
            const orderCounts = Object.values(userOrders).map(orders => orders.length);
            const totalCustomers = Object.keys(userOrders).length;

            // Customer segmentation
            const newCustomers = Object.values(userOrders).filter(orders => orders.length === 1).length;
            const returningCustomers = Object.values(userOrders).filter(orders => orders.length > 1 && orders.length <= 3).length;
            const loyalCustomers = Object.values(userOrders).filter(orders => orders.length > 3).length;

            // Order frequency
            const avgOrdersPerCustomer = totalCustomers > 0 ? orderCounts.reduce((a, b) => a + b, 0) / totalCustomers : 0;

            // Average order value
            const completedOrders = periodOrders.filter(o => o.status === 'delivered');
            const avgOrderValue = completedOrders.length > 0
                ? completedOrders.reduce((sum, o) => sum + (o.total || 0), 0) / completedOrders.length
                : 0;

            // Peak ordering times
            const hourlyOrders = Array(24).fill(0);
            periodOrders.forEach(order => {
                const hour = new Date(order.created_at).getHours();
                hourlyOrders[hour]++;
            });

            const peakHours = hourlyOrders
                .map((count, hour) => ({ hour, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Day of week analysis
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayOrders = Array(7).fill(0);
            periodOrders.forEach(order => {
                const day = new Date(order.created_at).getDay();
                dayOrders[day]++;
            });

            const ordersByDay = dayOrders.map((count, index) => ({
                day: dayNames[index],
                orders: count
            }));

            res.json({
                success: true,
                data: {
                    period: {
                        days: daysAgo,
                        start_date: startDate,
                        end_date: new Date()
                    },
                    customer_segmentation: {
                        total_customers: totalCustomers,
                        new_customers: newCustomers,
                        returning_customers: returningCustomers,
                        loyal_customers: loyalCustomers,
                        new_customer_percentage: totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0,
                        retention_rate: totalCustomers > 0 ? ((returningCustomers + loyalCustomers) / totalCustomers) * 100 : 0
                    },
                    order_metrics: {
                        total_orders: periodOrders.length,
                        average_orders_per_customer: avgOrdersPerCustomer,
                        average_order_value: avgOrderValue
                    },
                    peak_ordering_times: peakHours,
                    orders_by_day_of_week: ordersByDay
                }
            });
        } catch (error) {
            logger.error('Get customer order behavior error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get customer order behavior'
                }
            });
        }
    }

    // Get individual customer behavior
    static async getCustomerBehaviorById(req, res) {
        try {
            const { userId } = req.params;

            const userOrders = await dbHelpers.getDocs(collections.ORDERS, [
                { type: 'where', field: 'user_id', operator: '==', value: userId }
            ]);

            if (userOrders.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NO_ORDERS',
                        message: 'No orders found for this customer'
                    }
                });
            }

            // Sort orders by date
            userOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

            const completedOrders = userOrders.filter(o => o.status === 'delivered');
            const totalSpent = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const avgOrderValue = completedOrders.length > 0 ? totalSpent / completedOrders.length : 0;

            // Calculate order frequency (days between orders)
            const orderFrequencies = [];
            for (let i = 1; i < userOrders.length; i++) {
                const daysBetween = (new Date(userOrders[i].created_at) - new Date(userOrders[i - 1].created_at)) / (1000 * 60 * 60 * 24);
                orderFrequencies.push(daysBetween);
            }
            const avgDaysBetweenOrders = orderFrequencies.length > 0
                ? orderFrequencies.reduce((a, b) => a + b, 0) / orderFrequencies.length
                : 0;

            // Favorite items (most ordered)
            const itemCounts = {};
            for (const order of userOrders) {
                const orderItems = await dbHelpers.getDocs(collections.ORDER_ITEMS, [
                    { type: 'where', field: 'order_id', operator: '==', value: order.id }
                ]);

                orderItems.forEach(item => {
                    const key = item.item_name || item.item_id;
                    itemCounts[key] = (itemCounts[key] || 0) + item.quantity;
                });
            }

            const favoriteItems = Object.entries(itemCounts)
                .map(([name, count]) => ({ item_name: name, order_count: count }))
                .sort((a, b) => b.order_count - a.order_count)
                .slice(0, 10);

            // Last order date
            const lastOrder = userOrders[userOrders.length - 1];
            const daysSinceLastOrder = (new Date() - new Date(lastOrder.created_at)) / (1000 * 60 * 60 * 24);

            res.json({
                success: true,
                data: {
                    user_id: userId,
                    order_history: {
                        total_orders: userOrders.length,
                        completed_orders: completedOrders.length,
                        cancelled_orders: userOrders.filter(o => o.status === 'cancelled').length,
                        first_order_date: userOrders[0].created_at,
                        last_order_date: lastOrder.created_at,
                        days_since_last_order: Math.floor(daysSinceLastOrder)
                    },
                    spending: {
                        total_spent: totalSpent,
                        average_order_value: avgOrderValue
                    },
                    behavior: {
                        average_days_between_orders: avgDaysBetweenOrders,
                        customer_lifetime_days: Math.floor((new Date(lastOrder.created_at) - new Date(userOrders[0].created_at)) / (1000 * 60 * 60 * 24))
                    },
                    favorite_items: favoriteItems
                }
            });
        } catch (error) {
            logger.error('Get customer behavior by ID error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get customer behavior'
                }
            });
        }
    }

    // Get customer cohort analysis
    static async getCustomerCohorts(req, res) {
        try {
            const allOrders = await dbHelpers.getDocs(collections.ORDERS);

            // Group users by their first order month
            const cohorts = {};
            const userFirstOrder = {};

            allOrders.forEach(order => {
                if (!userFirstOrder[order.user_id]) {
                    userFirstOrder[order.user_id] = order.created_at;
                } else if (new Date(order.created_at) < new Date(userFirstOrder[order.user_id])) {
                    userFirstOrder[order.user_id] = order.created_at;
                }
            });

            // Create cohort structure
            Object.entries(userFirstOrder).forEach(([userId, firstOrderDate]) => {
                const cohortMonth = new Date(firstOrderDate).toISOString().slice(0, 7); // YYYY-MM
                if (!cohorts[cohortMonth]) {
                    cohorts[cohortMonth] = {
                        cohort_month: cohortMonth,
                        total_customers: 0,
                        retention: {}
                    };
                }
                cohorts[cohortMonth].total_customers++;
            });

            // Calculate retention for each cohort
            Object.entries(userFirstOrder).forEach(([userId, firstOrderDate]) => {
                const cohortMonth = new Date(firstOrderDate).toISOString().slice(0, 7);
                const userOrders = allOrders.filter(o => o.user_id === userId);

                userOrders.forEach(order => {
                    const orderMonth = new Date(order.created_at).toISOString().slice(0, 7);
                    const monthsAfter = this.getMonthsDifference(firstOrderDate, order.created_at);

                    if (!cohorts[cohortMonth].retention[monthsAfter]) {
                        cohorts[cohortMonth].retention[monthsAfter] = new Set();
                    }
                    cohorts[cohortMonth].retention[monthsAfter].add(userId);
                });
            });

            // Convert sets to counts and percentages
            const cohortData = Object.values(cohorts).map(cohort => {
                const retentionData = {};
                Object.entries(cohort.retention).forEach(([month, users]) => {
                    retentionData[`month_${month}`] = {
                        retained_customers: users.size,
                        retention_rate: (users.size / cohort.total_customers) * 100
                    };
                });

                return {
                    cohort_month: cohort.cohort_month,
                    total_customers: cohort.total_customers,
                    retention: retentionData
                };
            }).sort((a, b) => b.cohort_month.localeCompare(a.cohort_month));

            res.json({
                success: true,
                data: cohortData
            });
        } catch (error) {
            logger.error('Get customer cohorts error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get customer cohorts'
                }
            });
        }
    }

    // Helper method for cohort analysis
    static getMonthsDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    }

    // ===== REVENUE ANALYTICS =====

    // Get revenue trends
    static async getRevenueTrends(req, res) {
        try {
            const { period = '30', groupBy = 'day' } = req.query;
            const daysAgo = parseInt(period);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysAgo);

            const allOrders = await dbHelpers.getDocs(collections.ORDERS);
            const periodOrders = allOrders.filter(o =>
                new Date(o.created_at) >= startDate && o.status === 'delivered'
            );

            const revenueData = {};

            periodOrders.forEach(order => {
                const orderDate = new Date(order.created_at);
                let key;

                if (groupBy === 'day') {
                    key = orderDate.toISOString().split('T')[0];
                } else if (groupBy === 'week') {
                    const weekStart = new Date(orderDate);
                    weekStart.setDate(orderDate.getDate() - orderDate.getDay());
                    key = weekStart.toISOString().split('T')[0];
                } else if (groupBy === 'month') {
                    key = orderDate.toISOString().slice(0, 7);
                }

                if (!revenueData[key]) {
                    revenueData[key] = {
                        date: key,
                        revenue: 0,
                        orders: 0
                    };
                }

                revenueData[key].revenue += order.total || 0;
                revenueData[key].orders++;
            });

            const trends = Object.values(revenueData).sort((a, b) => a.date.localeCompare(b.date));

            res.json({
                success: true,
                data: {
                    period: `${daysAgo} days`,
                    group_by: groupBy,
                    trends
                }
            });
        } catch (error) {
            logger.error('Get revenue trends error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get revenue trends'
                }
            });
        }
    }

    // ===== POPULAR ITEMS ANALYTICS =====

    // Get popular menu items
    static async getPopularItems(req, res) {
        try {
            const { period = '30', limit = '10' } = req.query;
            const daysAgo = parseInt(period);
            const itemLimit = parseInt(limit);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysAgo);

            const allOrders = await dbHelpers.getDocs(collections.ORDERS);
            const periodOrders = allOrders.filter(o => new Date(o.created_at) >= startDate);

            const itemStats = {};

            for (const order of periodOrders) {
                const orderItems = await dbHelpers.getDocs(collections.ORDER_ITEMS, [
                    { type: 'where', field: 'order_id', operator: '==', value: order.id }
                ]);

                orderItems.forEach(item => {
                    const key = item.item_id;
                    if (!itemStats[key]) {
                        itemStats[key] = {
                            item_id: item.item_id,
                            item_name: item.item_name,
                            quantity_sold: 0,
                            revenue: 0,
                            orders: 0
                        };
                    }

                    itemStats[key].quantity_sold += item.quantity;
                    itemStats[key].revenue += (item.price * item.quantity);
                    itemStats[key].orders++;
                });
            }

            const popularItems = Object.values(itemStats)
                .sort((a, b) => b.quantity_sold - a.quantity_sold)
                .slice(0, itemLimit);

            res.json({
                success: true,
                data: {
                    period: `${daysAgo} days`,
                    popular_items: popularItems
                }
            });
        } catch (error) {
            logger.error('Get popular items error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get popular items'
                }
            });
        }
    }
}

module.exports = AnalyticsController;