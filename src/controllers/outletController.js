const { dbHelpers, collections } = require('../config/database');
const logger = require('../utils/logger');

class OutletController {
  // Create new outlet (Super Admin only)
  static async createOutlet(req, res) {
    try {
      const { 
        name, 
        address, 
        phone, 
        email, 
        operating_hours,
        coordinates,
        service_radius,
        avg_preparation_time
      } = req.body;
      const { user: currentUser } = req;

      // Check if outlet with same name or email exists
      const existingOutlets = await dbHelpers.getDocs(collections.OUTLETS, [
        { type: 'where', field: 'name', operator: '==', value: name }
      ]);

      if (existingOutlets.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Outlet with this name already exists'
          }
        });
      }

      const existingEmail = await dbHelpers.getDocs(collections.OUTLETS, [
        { type: 'where', field: 'email', operator: '==', value: email }
      ]);

      if (existingEmail.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Outlet with this email already exists'
          }
        });
      }

      // Create outlet
      const outletData = {
        name,
        address,
        phone,
        email,
        operating_hours,
        coordinates: coordinates || null,
        service_radius: service_radius || 10,
        avg_preparation_time: avg_preparation_time || 20,
        is_active: true,
        is_accepting_orders: true,
        created_by: currentUser.id,
        total_orders: 0,
        total_revenue: 0,
        average_rating: 0
      };

      const outlet = await dbHelpers.createDoc(collections.OUTLETS, outletData);

      logger.info('Outlet created successfully', {
        outletId: outlet.id,
        name,
        createdBy: currentUser.id
      });

      res.status(201).json({
        success: true,
        message: 'Outlet created successfully',
        data: {
          outlet_id: outlet.id,
          name: outlet.name,
          address: outlet.address,
          phone: outlet.phone,
          email: outlet.email,
          coordinates: outlet.coordinates,
          service_radius: outlet.service_radius,
          avg_preparation_time: outlet.avg_preparation_time,
          is_active: outlet.is_active
        }
      });
    } catch (error) {
      logger.error('Outlet creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create outlet'
        }
      });
    }
  }

  // Get all outlets (with pagination and filters)
  static async getOutlets(req, res) {
    try {
      const { page = 1, limit = 10, is_active, city, state } = req.query;
      const { user: currentUser } = req;

      let queries = [];

      // Apply filters
      if (is_active !== undefined) {
        queries.push({ type: 'where', field: 'is_active', operator: '==', value: is_active === 'true' });
      }

      if (city) {
        queries.push({ type: 'where', field: 'address.city', operator: '==', value: city });
      }

      if (state) {
        queries.push({ type: 'where', field: 'address.state', operator: '==', value: state });
      }

      // For outlet admins, only show their assigned outlets
      if (currentUser.role === 'outlet_admin') {
        const assignments = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);

        const outletIds = assignments.map(a => a.outlet_id);
        if (outletIds.length === 0) {
          return res.json({
            success: true,
            data: {
              outlets: [],
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 0,
                pages: 0
              }
            }
          });
        }

        // Get outlets by IDs (simplified for this example)
        const outlets = [];
        for (const outletId of outletIds) {
          const outlet = await dbHelpers.getDoc(collections.OUTLETS, outletId);
          if (outlet) outlets.push(outlet);
        }

        return res.json({
          success: true,
          data: {
            outlets,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: outlets.length,
              pages: Math.ceil(outlets.length / parseInt(limit))
            }
          }
        });
      }

      // Get outlets with pagination
      const outlets = await dbHelpers.getDocs(
        collections.OUTLETS,
        queries,
        { field: 'created_at', direction: 'desc' },
        parseInt(limit)
      );

      // Calculate pagination (simplified)
      const total = outlets.length;
      const pages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          outlets,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages
          }
        }
      });
    } catch (error) {
      logger.error('Get outlets error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get outlets'
        }
      });
    }
  }

  // Get single outlet by ID
  static async getOutlet(req, res) {
    try {
      const { outletId } = req.params;
      const { user: currentUser } = req;

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

      // Check outlet access for outlet admins
      if (currentUser.role === 'outlet_admin') {
        const assignment = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
          { type: 'where', field: 'outlet_id', operator: '==', value: outletId },
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);

        if (assignment.length === 0) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied for this outlet'
            }
          });
        }
      }

      res.json({
        success: true,
        data: { outlet }
      });
    } catch (error) {
      logger.error('Get outlet error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get outlet'
        }
      });
    }
  }

  // Update outlet
  static async updateOutlet(req, res) {
    try {
      const { outletId } = req.params;
      const { user: currentUser } = req;
      const updateData = req.body;

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

      // Check outlet access for outlet admins
      if (currentUser.role === 'outlet_admin') {
        const assignment = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
          { type: 'where', field: 'outlet_id', operator: '==', value: outletId },
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);

        if (assignment.length === 0) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied for this outlet'
            }
          });
        }
      }

      // Update outlet
      const updatedOutlet = await dbHelpers.updateDoc(collections.OUTLETS, outletId, {
        ...updateData,
        updated_by: currentUser.id
      });

      logger.info('Outlet updated successfully', {
        outletId,
        updatedBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Outlet updated successfully',
        data: { outlet: updatedOutlet }
      });
    } catch (error) {
      logger.error('Update outlet error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update outlet'
        }
      });
    }
  }

  // Delete/Deactivate outlet
  static async deleteOutlet(req, res) {
    try {
      const { outletId } = req.params;
      const { user: currentUser } = req;

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

      // Deactivate instead of delete to maintain data integrity
      await dbHelpers.updateDoc(collections.OUTLETS, outletId, {
        is_active: false,
        deactivated_by: currentUser.id,
        deactivated_at: new Date()
      });

      logger.info('Outlet deactivated successfully', {
        outletId,
        deactivatedBy: currentUser.id
      });

      res.json({
        success: true,
        message: 'Outlet deactivated successfully'
      });
    } catch (error) {
      logger.error('Delete outlet error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to deactivate outlet'
        }
      });
    }
  }

  // Get outlet statistics
  static async getOutletStats(req, res) {
    try {
      const { outletId } = req.params;
      const { user: currentUser } = req;

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

      // Check outlet access for outlet admins
      if (currentUser.role === 'outlet_admin') {
        const assignment = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
          { type: 'where', field: 'outlet_id', operator: '==', value: outletId },
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);

        if (assignment.length === 0) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied for this outlet'
            }
          });
        }
      }

      // Get basic stats (you can expand this based on your needs)
      const stats = {
        outlet_id: outletId,
        outlet_name: outlet.name,
        total_orders: outlet.total_orders || 0,
        total_revenue: outlet.total_revenue || 0,
        is_active: outlet.is_active,
        created_at: outlet.created_at
      };

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get outlet stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get outlet statistics'
        }
      });
    }
  }

  // Get outlet staff
  static async getOutletStaff(req, res) {
    try {
      const { outletId } = req.params;
      const { user: currentUser } = req;

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

      // Check outlet access for outlet admins
      if (currentUser.role === 'outlet_admin') {
        const assignment = await dbHelpers.getDocs(`${collections.USERS}/${currentUser.id}/outlets`, [
          { type: 'where', field: 'outlet_id', operator: '==', value: outletId },
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);

        if (assignment.length === 0) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied for this outlet'
            }
          });
        }
      }

      // Get all users with assignments to this outlet
      const allUsers = await dbHelpers.getDocs(collections.USERS, [
        { type: 'where', field: 'role', operator: 'in', value: ['outlet_admin', 'kitchen_staff', 'delivery_boy'] }
      ]);

      const staff = [];
      for (const user of allUsers) {
        const assignments = await dbHelpers.getDocs(`${collections.USERS}/${user.id}/outlets`, [
          { type: 'where', field: 'outlet_id', operator: '==', value: outletId },
          { type: 'where', field: 'is_active', operator: '==', value: true }
        ]);

        if (assignments.length > 0) {
          const profile = await dbHelpers.getDoc(collections.USER_PROFILES, user.id);
          staff.push({
            user_id: user.id,
            email: user.email,
            role: user.role,
            phone: user.phone,
            is_active: user.is_active,
            profile: profile || {},
            assignment: assignments[0]
          });
        }
      }

      res.json({
        success: true,
        data: {
          outlet_id: outletId,
          outlet_name: outlet.name,
          staff
        }
      });
    } catch (error) {
      logger.error('Get outlet staff error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get outlet staff'
        }
      });
    }
  }

  // ===== LOCATION-BASED ENDPOINTS (PUBLIC) =====

  // Get nearby outlets based on user location
  static async getNearbyOutlets(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      // Validate coordinates
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const searchRadius = parseFloat(radius);

      const { validateCoordinates, filterOutletsWithinRadius } = require('../utils/geoLocation');

      if (!validateCoordinates(lat, lon)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid coordinates provided'
          }
        });
      }

      // Get all active outlets
      const outlets = await dbHelpers.getDocs(collections.OUTLETS, [
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);

      // Filter outlets within radius
      const nearbyOutlets = filterOutletsWithinRadius(lat, lon, outlets, searchRadius);

      // Format response
      const formattedOutlets = nearbyOutlets.map(outlet => ({
        id: outlet.id,
        name: outlet.name,
        address: outlet.address,
        phone: outlet.phone,
        distance: outlet.distance,
        service_radius: outlet.service_radius || 10,
        is_serviceable: outlet.distance <= (outlet.service_radius || 10),
        coordinates: outlet.coordinates,
        operating_hours: outlet.operating_hours,
        rating: outlet.average_rating || 0,
        total_orders: outlet.total_orders || 0
      }));

      logger.info('Nearby outlets fetched', {
        userLocation: { lat, lon },
        radius: searchRadius,
        found: formattedOutlets.length
      });

      res.json({
        success: true,
        data: {
          outlets: formattedOutlets,
          search_location: { latitude: lat, longitude: lon },
          search_radius: searchRadius,
          total: formattedOutlets.length
        }
      });
    } catch (error) {
      logger.error('Get nearby outlets error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get nearby outlets'
        }
      });
    }
  }

  // Check serviceability for a location
  static async checkServiceability(req, res) {
    try {
      const { latitude, longitude } = req.body;

      const {
        validateCoordinates,
        filterOutletsWithinRadius,
        estimateDeliveryTime
      } = require('../utils/geoLocation');

      // Get all active outlets
      const outlets = await dbHelpers.getDocs(collections.OUTLETS, [
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);

      // Validate coordinates
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please provide latitude and longitude'
          }
        });
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (!validateCoordinates(lat, lon)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid coordinates provided'
          }
        });
      }

      let serviceableOutlets = [];

      // Find outlets that can service this location
      for (const outlet of outlets) {
        if (!outlet.coordinates) continue;

        const serviceRadius = outlet.service_radius || 10;
        const nearbyOutlets = filterOutletsWithinRadius(
          lat,
          lon,
          [outlet],
          serviceRadius
        );

        if (nearbyOutlets.length > 0) {
          const distance = nearbyOutlets[0].distance;
          const estimatedTime = estimateDeliveryTime(distance, outlet.avg_preparation_time);

          serviceableOutlets.push({
            outlet_id: outlet.id,
            outlet_name: outlet.name,
            distance,
            estimated_time: estimatedTime,
            address: outlet.address
          });
        }
      }

      // Sort by distance
      serviceableOutlets.sort((a, b) => {
        return a.distance - b.distance;
      });

      const isServiceable = serviceableOutlets.length > 0;
      const primaryOutlet = serviceableOutlets[0] || null;

      logger.info('Serviceability checked', {
        location: { latitude, longitude },
        serviceable: isServiceable,
        outletsFound: serviceableOutlets.length
      });

      res.json({
        success: true,
        data: {
          serviceable: isServiceable,
          primary_outlet: primaryOutlet,
          all_outlets: serviceableOutlets,
          total_outlets: serviceableOutlets.length,
          message: isServiceable
            ? 'Delivery available at your location'
            : 'Sorry, we don\'t deliver to your location yet'
        }
      });
    } catch (error) {
      logger.error('Check serviceability error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check serviceability'
        }
      });
    }
  }

  // Get all service areas (pincodes and regions)
  static async getServiceAreas(req, res) {
    try {
      // Get all active outlets
      const outlets = await dbHelpers.getDocs(collections.OUTLETS, [
        { type: 'where', field: 'is_active', operator: '==', value: true }
      ]);

      const serviceAreas = {
        cities: [],
        states: [],
        outlets: []
      };

      const citySet = new Set();
      const stateSet = new Set();

      for (const outlet of outlets) {
        // Collect cities and states
        if (outlet.address) {
          if (outlet.address.city) citySet.add(outlet.address.city);
          if (outlet.address.state) stateSet.add(outlet.address.state);
        }

        // Add outlet info
        serviceAreas.outlets.push({
          id: outlet.id,
          name: outlet.name,
          city: outlet.address?.city,
          state: outlet.address?.state,
          service_radius: outlet.service_radius || 10,
          coordinates: outlet.coordinates
        });
      }

      serviceAreas.cities = Array.from(citySet).sort();
      serviceAreas.states = Array.from(stateSet).sort();

      res.json({
        success: true,
        data: {
          service_areas: serviceAreas,
          total_cities: serviceAreas.cities.length,
          total_outlets: serviceAreas.outlets.length
        }
      });
    } catch (error) {
      logger.error('Get service areas error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get service areas'
        }
      });
    }
  }

  // Get public outlet details (for customers)
  static async getPublicOutletDetails(req, res) {
    try {
      const { outletId } = req.params;

      const outlet = await dbHelpers.getDoc(collections.OUTLETS, outletId);

      if (!outlet || !outlet.is_active) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Outlet not found'
          }
        });
      }

      // Return public information only
      const publicInfo = {
        id: outlet.id,
        name: outlet.name,
        address: outlet.address,
        phone: outlet.phone,
        email: outlet.email,
        coordinates: outlet.coordinates,
        service_radius: outlet.service_radius || 10,
        operating_hours: outlet.operating_hours,
        average_rating: outlet.average_rating || 0,
        total_orders: outlet.total_orders || 0,
        avg_preparation_time: outlet.avg_preparation_time || 20,
        is_accepting_orders: outlet.is_accepting_orders !== false
      };

      res.json({
        success: true,
        data: { outlet: publicInfo }
      });
    } catch (error) {
      logger.error('Get public outlet details error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get outlet details'
        }
      });
    }
  }
}

module.exports = OutletController;
