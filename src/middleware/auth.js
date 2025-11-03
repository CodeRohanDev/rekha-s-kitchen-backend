const AuthUtils = require('../utils/auth');
const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token required'
        }
      });
    }

    const token = authHeader.substring(7);
    const decoded = AuthUtils.verifyToken(token);
    
    // Get user from database
    const user = await dbHelpers.getDoc(collections.USERS, decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or inactive user'
        }
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token'
      }
    });
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      });
    }

    next();
  };
};

// Outlet-specific authorization (for outlet admins and staff)
const authorizeOutlet = async (req, res, next) => {
  try {
    const { user } = req;
    const outletId = req.params.outletId || req.body.outlet_id;

    // Super admin can access all outlets
    if (user.role === 'super_admin') {
      return next();
    }

    // Check if user is assigned to this outlet
    if (user.role === 'outlet_admin' || user.role === 'kitchen_staff' || user.role === 'delivery_boy') {
      const staffAssignment = await dbHelpers.getDocs(`${collections.USERS}/${user.id}/outlets`, [
        { type: 'where', field: 'outlet_id', operator: '==', value: outletId },
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);

      if (staffAssignment.length === 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied for this outlet'
          }
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Outlet authorization error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authorization check failed'
      }
    });
  }
};

// Customer-specific authorization (can only access their own data)
const authorizeCustomer = (req, res, next) => {
  const { user } = req;
  const customerId = req.params.customerId || req.body.customer_id;

  if (user.role === 'customer' && user.id !== customerId) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Can only access your own data'
      }
    });
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  authorizeOutlet,
  authorizeCustomer
};