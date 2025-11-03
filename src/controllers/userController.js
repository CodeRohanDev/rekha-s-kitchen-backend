const { dbHelpers, collections } = require('../config/database');
const AuthUtils = require('../utils/auth');
const logger = require('../utils/logger');

class UserController {
  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { user } = req;
      const updateData = req.body;

      // Update user profile
      const updatedProfile = await dbHelpers.updateDoc(
        collections.USER_PROFILES,
        user.id,
        updateData
      );

      logger.info('Profile updated successfully', { userId: user.id });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          profile: updatedProfile
        }
      });
    } catch (error) {
      logger.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update profile'
        }
      });
    }
  }

  // Add customer address
  static async addAddress(req, res) {
    try {
      const { user } = req;
      const addressData = req.body;

      // Get current profile
      const profile = await dbHelpers.getDoc(collections.USER_PROFILES, user.id);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User profile not found'
          }
        });
      }

      // Add address ID and timestamp
      const newAddress = {
        id: AuthUtils.generateRandomString(16),
        ...addressData,
        created_at: new Date()
      };

      // If this is the first address or marked as default, make it default
      const addresses = profile.addresses || [];
      if (addresses.length === 0 || newAddress.is_default) {
        // Remove default from other addresses
        addresses.forEach(addr => addr.is_default = false);
        newAddress.is_default = true;
      }

      addresses.push(newAddress);

      // Update profile with new addresses
      await dbHelpers.updateDoc(collections.USER_PROFILES, user.id, {
        addresses
      });

      logger.info('Address added successfully', { userId: user.id, addressId: newAddress.id });

      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: {
          address: newAddress
        }
      });
    } catch (error) {
      logger.error('Add address error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add address'
        }
      });
    }
  }

  // Update customer address
  static async updateAddress(req, res) {
    try {
      const { user } = req;
      const { addressId } = req.params;
      const updateData = req.body;

      // Get current profile
      const profile = await dbHelpers.getDoc(collections.USER_PROFILES, user.id);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User profile not found'
          }
        });
      }

      const addresses = profile.addresses || [];
      const addressIndex = addresses.findIndex(addr => addr.id === addressId);

      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Address not found'
          }
        });
      }

      // Update address
      addresses[addressIndex] = {
        ...addresses[addressIndex],
        ...updateData,
        updated_at: new Date()
      };

      // If marked as default, remove default from others
      if (updateData.is_default) {
        addresses.forEach((addr, index) => {
          if (index !== addressIndex) {
            addr.is_default = false;
          }
        });
      }

      // Update profile
      await dbHelpers.updateDoc(collections.USER_PROFILES, user.id, {
        addresses
      });

      logger.info('Address updated successfully', { userId: user.id, addressId });

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: {
          address: addresses[addressIndex]
        }
      });
    } catch (error) {
      logger.error('Update address error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update address'
        }
      });
    }
  }

  // Delete customer address
  static async deleteAddress(req, res) {
    try {
      const { user } = req;
      const { addressId } = req.params;

      // Get current profile
      const profile = await dbHelpers.getDoc(collections.USER_PROFILES, user.id);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User profile not found'
          }
        });
      }

      const addresses = profile.addresses || [];
      const addressIndex = addresses.findIndex(addr => addr.id === addressId);

      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Address not found'
          }
        });
      }

      const deletedAddress = addresses[addressIndex];
      addresses.splice(addressIndex, 1);

      // If deleted address was default and there are other addresses, make first one default
      if (deletedAddress.is_default && addresses.length > 0) {
        addresses[0].is_default = true;
      }

      // Update profile
      await dbHelpers.updateDoc(collections.USER_PROFILES, user.id, {
        addresses
      });

      logger.info('Address deleted successfully', { userId: user.id, addressId });

      res.json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      logger.error('Delete address error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete address'
        }
      });
    }
  }

  // Get all staff members (Admin only)
  static async getStaff(req, res) {
    try {
      const { user } = req;
      const { page = 1, limit = 10, outlet_id, role } = req.query;

      let queries = [
        { type: 'where', field: 'role', operator: 'in', value: ['outlet_admin', 'kitchen_staff', 'delivery_boy'] }
      ];

      // If outlet admin, only show staff from their outlets
      if (user.role === 'outlet_admin') {
        // Get outlet assignments for current user
        const userOutlets = await dbHelpers.getDocs(`${collections.USERS}/${user.id}/outlets`, [
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);

        const outletIds = userOutlets.map(assignment => assignment.outlet_id);
        
        if (outletIds.length === 0) {
          return res.json({
            success: true,
            data: {
              staff: [],
              pagination: {
                current_page: 1,
                total_pages: 0,
                total_items: 0,
                items_per_page: limit,
                has_next: false,
                has_previous: false
              }
            }
          });
        }
      }

      // Add role filter if specified
      if (role) {
        queries.push({ type: 'where', field: 'role', operator: '==', value: role });
      }

      // Get paginated staff
      const result = await dbHelpers.getPaginatedDocs(
        collections.USERS,
        queries,
        parseInt(page),
        parseInt(limit)
      );

      // Get profiles and outlet assignments for each staff member
      const staffWithDetails = await Promise.all(
        result.items.map(async (staff) => {
          const profile = await dbHelpers.getDoc(collections.USER_PROFILES, staff.id);
          const outletAssignments = await dbHelpers.getDocs(`${collections.USERS}/${staff.id}/outlets`, [
            { type: 'where', field: 'is_active', operator: '==', value: true }
          ]);

          return {
            id: staff.id,
            email: staff.email,
            phone: staff.phone,
            role: staff.role,
            is_active: staff.is_active,
            profile: profile || {},
            outlet_assignments: outletAssignments,
            created_at: staff.created_at
          };
        })
      );

      // Filter by outlet if outlet admin or outlet_id specified
      let filteredStaff = staffWithDetails;
      if (user.role === 'outlet_admin' || outlet_id) {
        const targetOutletIds = outlet_id ? [outlet_id] : 
          (await dbHelpers.getDocs(`${collections.USERS}/${user.id}/outlets`, [
            { type: 'where', field: 'is_active', operator: '==', value: true }
          ])).map(assignment => assignment.outlet_id);

        filteredStaff = staffWithDetails.filter(staff => 
          staff.outlet_assignments.some(assignment => 
            targetOutletIds.includes(assignment.outlet_id)
          )
        );
      }

      res.json({
        success: true,
        data: {
          staff: filteredStaff,
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Get staff error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get staff members'
        }
      });
    }
  }

  // Update staff member (Admin only)
  static async updateStaff(req, res) {
    try {
      const { user } = req;
      const { staffId } = req.params;
      const updateData = req.body;

      // Get staff member
      const staff = await dbHelpers.getDoc(collections.USERS, staffId);
      
      if (!staff) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Staff member not found'
          }
        });
      }

      // Check permissions
      if (user.role === 'outlet_admin') {
        // Outlet admin can only update staff in their outlets
        const userOutlets = await dbHelpers.getDocs(`${collections.USERS}/${user.id}/outlets`, [
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);
        const userOutletIds = userOutlets.map(assignment => assignment.outlet_id);

        const staffOutlets = await dbHelpers.getDocs(`${collections.USERS}/${staffId}/outlets`, [
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);
        const staffOutletIds = staffOutlets.map(assignment => assignment.outlet_id);

        const hasCommonOutlet = staffOutletIds.some(outletId => userOutletIds.includes(outletId));
        
        if (!hasCommonOutlet) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Can only update staff in your assigned outlets'
            }
          });
        }
      }

      // Separate user data from profile data
      const { first_name, last_name, shift_hours, ...userData } = updateData;
      
      // Update user data if provided
      if (Object.keys(userData).length > 0) {
        await dbHelpers.updateDoc(collections.USERS, staffId, userData);
      }

      // Update profile data if provided
      const profileData = {};
      if (first_name) profileData.first_name = first_name;
      if (last_name) profileData.last_name = last_name;
      if (shift_hours) profileData.shift_hours = shift_hours;

      if (Object.keys(profileData).length > 0) {
        await dbHelpers.updateDoc(collections.USER_PROFILES, staffId, profileData);
      }

      logger.info('Staff member updated successfully', { staffId, updatedBy: user.id });

      res.json({
        success: true,
        message: 'Staff member updated successfully'
      });
    } catch (error) {
      logger.error('Update staff error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update staff member'
        }
      });
    }
  }

  // Deactivate staff member (Admin only)
  static async deactivateStaff(req, res) {
    try {
      const { user } = req;
      const { staffId } = req.params;

      // Get staff member
      const staff = await dbHelpers.getDoc(collections.USERS, staffId);
      
      if (!staff) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Staff member not found'
          }
        });
      }

      // Check permissions (same as update)
      if (user.role === 'outlet_admin') {
        const userOutlets = await dbHelpers.getDocs(`${collections.USERS}/${user.id}/outlets`, [
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);
        const userOutletIds = userOutlets.map(assignment => assignment.outlet_id);

        const staffOutlets = await dbHelpers.getDocs(`${collections.USERS}/${staffId}/outlets`, [
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);
        const staffOutletIds = staffOutlets.map(assignment => assignment.outlet_id);

        const hasCommonOutlet = staffOutletIds.some(outletId => userOutletIds.includes(outletId));
        
        if (!hasCommonOutlet) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Can only deactivate staff in your assigned outlets'
            }
          });
        }
      }

      // Deactivate user
      await dbHelpers.updateDoc(collections.USERS, staffId, {
        is_active: false,
        deactivated_by: user.id,
        deactivated_at: new Date()
      });

      logger.info('Staff member deactivated successfully', { staffId, deactivatedBy: user.id });

      res.json({
        success: true,
        message: 'Staff member deactivated successfully'
      });
    } catch (error) {
      logger.error('Deactivate staff error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to deactivate staff member'
        }
      });
    }
  }
}

module.exports = UserController;