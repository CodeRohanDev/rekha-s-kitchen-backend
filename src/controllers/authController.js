const AuthUtils = require('../utils/auth');
const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');
const { generateUniqueUsername } = require('../utils/usernameGenerator');

class AuthController {
  // Customer registration
  static async register(req, res) {
    try {
      const { email, password, phone, first_name, last_name } = req.body;

      // Check if user already exists
      const existingUsers = await dbHelpers.getDocs(collections.USERS, [
        { type: 'where', field: 'email', operator: '==', value: email }
      ]);

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'User with this email already exists'
          }
        });
      }

      // Generate unique food-themed username
      const username = await generateUniqueUsername();

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(password);

      // Create user
      const userData = {
        email,
        password_hash: hashedPassword,
        phone,
        username,
        role: 'customer',
        is_active: true
      };

      const user = await dbHelpers.createDoc(collections.USERS, userData);

      // Create user profile
      const profileData = {
        user_id: user.id,
        first_name,
        last_name,
        username,
        avatar_url: null,
        addresses: [],
        preferences: {},
        loyalty_points: 0
      };

      await dbHelpers.createDoc(collections.USER_PROFILES, profileData, user.id);

      logger.info('User registered successfully', { userId: user.id, email, username });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user_id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Registration failed'
        }
      });
    }
  }

  // User login (all roles)
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const users = await dbHelpers.getDocs(collections.USERS, [
        { type: 'where', field: 'email', operator: '==', value: email }
      ]);

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password'
          }
        });
      }

      const user = users[0];

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Account is deactivated'
          }
        });
      }

      // Verify password
      const isValidPassword = await AuthUtils.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password'
          }
        });
      }

      // Get user profile
      const profile = await dbHelpers.getDoc(collections.USER_PROFILES, user.id);

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const { accessToken, refreshToken } = AuthUtils.generateTokens(tokenPayload);

      // Tokens never expire
      const expiresIn = null; // Never expires

      logger.info('User logged in successfully', { userId: user.id, email, role: user.role });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            profile: profile || {}
          },
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresIn
          }
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Login failed'
        }
      });
    }
  }

  // Refresh access token
  static async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required'
          }
        });
      }

      // Verify refresh token
      const decoded = AuthUtils.verifyToken(refresh_token);

      // Get user to ensure they still exist and are active
      const user = await dbHelpers.getDoc(collections.USERS, decoded.userId);

      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid refresh token'
          }
        });
      }

      // Generate new tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const { accessToken, refreshToken: newRefreshToken } = AuthUtils.generateTokens(tokenPayload);

      res.json({
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: newRefreshToken,
          expires_in: null
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid refresh token'
        }
      });
    }
  }

  // Create staff member (Super Admin and Outlet Admin only)
  static async createStaff(req, res) {
    try {
      const { email, password, phone, first_name, last_name, role, outlet_id, shift_hours } = req.body;
      const { user: currentUser } = req;

      // Check permissions
      if (currentUser.role === 'outlet_admin') {
        // Outlet admin can only create staff for their outlet
        const staffAssignment = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
          { type: 'where', field: 'outlet_id', operator: '==', value: outlet_id }
        ]);

        if (staffAssignment.length === 0) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Can only create staff for your assigned outlet'
            }
          });
        }

        // Outlet admin cannot create other outlet admins
        if (role === 'outlet_admin') {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Cannot create outlet admin accounts'
            }
          });
        }
      }

      // Check if user already exists
      const existingUsers = await dbHelpers.getDocs(collections.USERS, [
        { type: 'where', field: 'email', operator: '==', value: email }
      ]);

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'User with this email already exists'
          }
        });
      }

      // Verify outlet exists
      const outlet = await dbHelpers.getDoc(collections.OUTLETS, outlet_id);
      if (!outlet) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Outlet not found'
          }
        });
      }

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(password);

      // Create user
      const userData = {
        email,
        password_hash: hashedPassword,
        phone,
        role,
        is_active: true,
        created_by: currentUser.id
      };

      const user = await dbHelpers.createDoc(collections.USERS, userData);

      // Create user profile
      const profileData = {
        user_id: user.id,
        first_name,
        last_name,
        avatar_url: null,
        shift_hours: shift_hours || null
      };

      await dbHelpers.createDoc(collections.USER_PROFILES, profileData, user.id);

      // Create outlet assignment
      const outletAssignment = {
        outlet_id,
        role,
        is_active: true,
        assigned_by: currentUser.id
      };

      await dbHelpers.createDoc(`${collections.USERS}/${user.id}/outlets`, outletAssignment);

      logger.info('Staff member created successfully', {
        staffId: user.id,
        email,
        role,
        outletId: outlet_id,
        createdBy: currentUser.id
      });

      res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        data: {
          user_id: user.id,
          email: user.email,
          role: user.role,
          outlet_id
        }
      });
    } catch (error) {
      logger.error('Staff creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create staff member'
        }
      });
    }
  }

  // Logout (optional - mainly for logging)
  static async logout(req, res) {
    try {
      const { user } = req;

      logger.info('User logged out', { userId: user.id, email: user.email });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Logout failed'
        }
      });
    }
  }

  // Create super admin (Development only)
  static async createSuperAdmin(req, res) {
    try {
      // Only allow in development
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Super admin creation only allowed in development'
          }
        });
      }

      const { email, password, phone, first_name, last_name } = req.body;

      // Check if any super admin already exists
      const existingSuperAdmins = await dbHelpers.getDocs(collections.USERS, [
        { type: 'where', field: 'role', operator: '==', value: 'super_admin' }
      ]);

      if (existingSuperAdmins.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Super admin already exists'
          }
        });
      }

      // Check if user with email exists
      const existingUsers = await dbHelpers.getDocs(collections.USERS, [
        { type: 'where', field: 'email', operator: '==', value: email }
      ]);

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'User with this email already exists'
          }
        });
      }

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(password);

      // Create super admin user
      const userData = {
        email,
        password_hash: hashedPassword,
        phone,
        role: 'super_admin',
        is_active: true,
        created_by: 'system'
      };

      const user = await dbHelpers.createDoc(collections.USERS, userData);

      // Create user profile
      const profileData = {
        user_id: user.id,
        first_name,
        last_name,
        avatar_url: null
      };

      await dbHelpers.createDoc(collections.USER_PROFILES, profileData, user.id);

      logger.info('Super admin created successfully', { userId: user.id, email });

      res.status(201).json({
        success: true,
        message: 'Super admin created successfully',
        data: {
          user_id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      logger.error('Super admin creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create super admin'
        }
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const { user } = req;

      // Get user profile
      const profile = await dbHelpers.getDoc(collections.USER_PROFILES, user.id);

      // Get outlet assignments for staff
      let outletAssignments = [];
      if (['outlet_admin', 'kitchen_staff', 'delivery_boy'].includes(user.role)) {
        try {
          // Fetch all outlet assignments from subcollection
          const outletPath = `${collections.USERS}/${user.id}/outlets`;
          logger.info('Fetching outlet assignments', { userId: user.id, path: outletPath });

          outletAssignments = await dbHelpers.getDocs(outletPath);

          logger.info('Outlet assignments fetched', {
            userId: user.id,
            count: outletAssignments.length
          });
        } catch (outletError) {
          logger.error('Error fetching outlet assignments:', outletError);
          // Continue with empty array if subcollection fetch fails
          outletAssignments = [];
        }
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            phone: user.phone,
            is_active: user.is_active,
            profile: profile || {},
            outlet_assignments: outletAssignments,
            created_at: user.created_at
          }
        }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get profile'
        }
      });
    }
  }

  // Get user outlet assignments only
  static async getUserOutlets(req, res) {
    try {
      const { user } = req;

      // Only staff roles have outlet assignments
      if (!['outlet_admin', 'kitchen_staff', 'delivery_boy'].includes(user.role)) {
        return res.json({
          success: true,
          data: {
            outlet_assignments: [],
            message: 'User role does not have outlet assignments'
          }
        });
      }

      // Fetch outlet assignments from subcollection
      const outletPath = `${collections.USERS}/${user.id}/outlets`;
      const outletAssignments = await dbHelpers.getDocs(outletPath);

      // Enrich with outlet details
      const enrichedAssignments = [];
      for (const assignment of outletAssignments) {
        const outlet = await dbHelpers.getDoc(collections.OUTLETS, assignment.outlet_id);
        enrichedAssignments.push({
          ...assignment,
          outlet_details: outlet ? {
            name: outlet.name,
            address: outlet.address,
            phone: outlet.phone,
            is_active: outlet.is_active
          } : null
        });
      }

      res.json({
        success: true,
        data: {
          outlet_assignments: enrichedAssignments
        }
      });
    } catch (error) {
      logger.error('Get user outlets error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get outlet assignments'
        }
      });
    }
  }

  // ===== MOBILE OTP AUTHENTICATION =====

  // Send OTP to phone number
  static async sendOTP(req, res) {
    try {
      const { phone } = req.body;

      // Validate phone format
      if (!phone || !phone.match(/^\+?[\d\s\-\(\)]{10,}$/)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid phone number format'
          }
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store OTP in database
      const otpData = {
        phone,
        otp,
        expires_at: expiresAt,
        is_verified: false,
        attempts: 0,
        created_at: new Date()
      };

      // Check if OTP already exists for this phone
      const existingOTPs = await dbHelpers.getDocs(collections.OTP_VERIFICATIONS, [
        { type: 'where', field: 'phone', operator: '==', value: phone },
        { type: 'where', field: 'is_verified', operator: '==', value: false }
      ]);

      // Delete old unverified OTPs in parallel and create new OTP
      const deletePromises = existingOTPs.map(oldOTP =>
        dbHelpers.deleteDoc(collections.OTP_VERIFICATIONS, oldOTP.id)
      );

      const [otpDoc] = await Promise.all([
        dbHelpers.createDoc(collections.OTP_VERIFICATIONS, otpData),
        ...deletePromises
      ]);

      // In production, send SMS via Twilio/AWS SNS/etc.
      // For development, log to console
      console.log('\n' + '='.repeat(60));
      console.log('📱 OTP VERIFICATION');
      console.log('='.repeat(60));
      console.log(`Phone: ${phone}`);
      console.log(`OTP: ${otp}`);
      console.log(`Expires: ${expiresAt.toLocaleString()}`);
      console.log(`Valid for: 5 minutes`);
      console.log('='.repeat(60) + '\n');

      logger.info('OTP sent', { phone, otpId: otpDoc.id });

      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          phone,
          expires_in: 300, // 5 minutes in seconds
          // In production, don't send OTP in response
          // Only for development/testing
          ...(process.env.NODE_ENV === 'development' && { otp })
        }
      });
    } catch (error) {
      logger.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to send OTP'
        }
      });
    }
  }

  // Verify OTP and login/register
  static async verifyOTP(req, res) {
    try {
      const { phone, otp, first_name, last_name } = req.body;

      // Fetch OTP and user in parallel (OPTIMIZATION: Save 500ms)
      const [otpDocs, existingUsers] = await Promise.all([
        dbHelpers.getDocs(collections.OTP_VERIFICATIONS, [
          { type: 'where', field: 'phone', operator: '==', value: phone },
          { type: 'where', field: 'is_verified', operator: '==', value: false }
        ]),
        dbHelpers.getDocs(collections.USERS, [
          { type: 'where', field: 'phone', operator: '==', value: phone }
        ])
      ]);

      if (otpDocs.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No OTP found for this phone number. Please request a new OTP.'
          }
        });
      }

      const otpDoc = otpDocs[0];
      const now = new Date();

      // Check if OTP expired
      if (now > new Date(otpDoc.expires_at)) {
        // Don't wait for deletion, send response immediately
        dbHelpers.deleteDoc(collections.OTP_VERIFICATIONS, otpDoc.id).catch(err =>
          logger.error('Failed to delete expired OTP', err)
        );
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'OTP has expired. Please request a new OTP.'
          }
        });
      }

      // Check attempts
      if (otpDoc.attempts >= 3) {
        // Don't wait for deletion, send response immediately
        dbHelpers.deleteDoc(collections.OTP_VERIFICATIONS, otpDoc.id).catch(err =>
          logger.error('Failed to delete OTP after max attempts', err)
        );
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Too many failed attempts. Please request a new OTP.'
          }
        });
      }

      // Verify OTP
      if (otpDoc.otp !== otp) {
        // Don't wait for update, send response immediately
        dbHelpers.updateDoc(collections.OTP_VERIFICATIONS, otpDoc.id, {
          attempts: otpDoc.attempts + 1
        }).catch(err => logger.error('Failed to update OTP attempts', err));

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid OTP. Please try again.',
            attempts_remaining: 3 - (otpDoc.attempts + 1)
          }
        });
      }

      let user;
      let profile;
      let isNewUser = false;

      if (existingUsers.length > 0) {
        // Existing user - login
        user = existingUsers[0];

        // Generate tokens immediately (don't wait for DB updates)
        const tokenPayload = {
          userId: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role
        };
        const { accessToken, refreshToken } = AuthUtils.generateTokens(tokenPayload);

        // Fetch profile and do all DB updates in parallel
        const [userProfile] = await Promise.all([
          dbHelpers.getDoc(collections.USER_PROFILES, user.id),
          // Fire and forget operations (don't block response)
          dbHelpers.updateDoc(collections.USERS, user.id, {
            last_login: new Date()
          }).catch(err => logger.error('Failed to update last login', err)),
          dbHelpers.updateDoc(collections.OTP_VERIFICATIONS, otpDoc.id, {
            is_verified: true,
            verified_at: new Date()
          }).catch(err => logger.error('Failed to mark OTP verified', err)),
          dbHelpers.createDoc(collections.REFRESH_TOKENS, {
            user_id: user.id,
            token: refreshToken,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }).catch(err => logger.error('Failed to store refresh token', err))
        ]);

        profile = userProfile;

        logger.info('OTP verification successful', {
          userId: user.id,
          phone,
          isNewUser: false
        });

        // Send response immediately
        return res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: user.id,
              phone: user.phone,
              email: user.email,
              username: user.username,
              role: user.role,
              profile: {
                first_name: profile?.first_name,
                last_name: profile?.last_name,
                username: profile?.username,
                avatar_url: profile?.avatar_url
              }
            },
            tokens: {
              access_token: accessToken,
              refresh_token: refreshToken
            },
            is_new_user: false
          }
        });
      } else {
        // New user - register
        isNewUser = true;

        // Generate unique food-themed username
        const username = await generateUniqueUsername();

        // Create user
        const userData = {
          phone,
          email: null,
          password_hash: null,
          username,
          role: 'customer',
          is_active: true,
          auth_method: 'otp',
          phone_verified: true,
          phone_verified_at: new Date()
        };

        user = await dbHelpers.createDoc(collections.USERS, userData);

        // Generate tokens immediately
        const tokenPayload = {
          userId: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role
        };
        const { accessToken, refreshToken } = AuthUtils.generateTokens(tokenPayload);

        // Create profile and do cleanup in parallel
        const profileData = {
          user_id: user.id,
          first_name: first_name || 'User',
          last_name: last_name || '',
          username,
          avatar_url: null,
          addresses: [],
          preferences: {},
          loyalty_points: 0
        };

        const [createdProfile] = await Promise.all([
          dbHelpers.createDoc(collections.USER_PROFILES, profileData, user.id),
          // Fire and forget operations
          dbHelpers.updateDoc(collections.OTP_VERIFICATIONS, otpDoc.id, {
            is_verified: true,
            verified_at: new Date()
          }).catch(err => logger.error('Failed to mark OTP verified', err)),
          dbHelpers.createDoc(collections.REFRESH_TOKENS, {
            user_id: user.id,
            token: refreshToken,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }).catch(err => logger.error('Failed to store refresh token', err))
        ]);

        profile = createdProfile;

        logger.info('New user registered via OTP', { userId: user.id, phone });

        // Send response for new user
        return res.json({
          success: true,
          message: 'Registration successful',
          data: {
            user: {
              id: user.id,
              phone: user.phone,
              email: user.email,
              username: user.username,
              role: user.role,
              profile: {
                first_name: profile?.first_name,
                last_name: profile?.last_name,
                username: profile?.username,
                avatar_url: profile?.avatar_url
              }
            },
            tokens: {
              access_token: accessToken,
              refresh_token: refreshToken
            },
            is_new_user: true
          }
        });
      }
    } catch (error) {
      logger.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify OTP'
        }
      });
    }
  }

  // Resend OTP
  static async resendOTP(req, res) {
    try {
      const { phone } = req.body;

      // Delete old OTPs
      const existingOTPs = await dbHelpers.getDocs(collections.OTP_VERIFICATIONS, [
        { type: 'where', field: 'phone', operator: '==', value: phone }
      ]);

      for (const oldOTP of existingOTPs) {
        await dbHelpers.deleteDoc(collections.OTP_VERIFICATIONS, oldOTP.id);
      }

      // Send new OTP (reuse sendOTP logic)
      req.body = { phone };
      return AuthController.sendOTP(req, res);
    } catch (error) {
      logger.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to resend OTP'
        }
      });
    }
  }
}

module.exports = AuthController;