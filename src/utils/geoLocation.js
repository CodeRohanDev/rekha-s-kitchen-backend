/**
 * Geo-location utilities for calculating distances and checking service areas
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a point is within service radius
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {number} outletLat - Outlet's latitude
 * @param {number} outletLon - Outlet's longitude
 * @param {number} serviceRadius - Service radius in kilometers
 * @returns {boolean} True if within service area
 */
function isWithinServiceArea(userLat, userLon, outletLat, outletLon, serviceRadius) {
  const distance = calculateDistance(userLat, userLon, outletLat, outletLon);
  return distance <= serviceRadius;
}

/**
 * Find nearest outlet from a list
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {Array} outlets - Array of outlets with coordinates
 * @returns {Object} Nearest outlet with distance
 */
function findNearestOutlet(userLat, userLon, outlets) {
  let nearest = null;
  let minDistance = Infinity;
  
  for (const outlet of outlets) {
    if (!outlet.coordinates || !outlet.coordinates.latitude || !outlet.coordinates.longitude) {
      continue;
    }
    
    const distance = calculateDistance(
      userLat, 
      userLon, 
      outlet.coordinates.latitude, 
      outlet.coordinates.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...outlet, distance };
    }
  }
  
  return nearest;
}

/**
 * Filter outlets within radius
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {Array} outlets - Array of outlets
 * @param {number} radius - Search radius in kilometers
 * @returns {Array} Outlets within radius with distances
 */
function filterOutletsWithinRadius(userLat, userLon, outlets, radius) {
  const outletsWithDistance = [];
  
  for (const outlet of outlets) {
    if (!outlet.coordinates || !outlet.coordinates.latitude || !outlet.coordinates.longitude) {
      continue;
    }
    
    const distance = calculateDistance(
      userLat,
      userLon,
      outlet.coordinates.latitude,
      outlet.coordinates.longitude
    );
    
    if (distance <= radius) {
      outletsWithDistance.push({
        ...outlet,
        distance: parseFloat(distance.toFixed(2))
      });
    }
  }
  
  // Sort by distance
  outletsWithDistance.sort((a, b) => a.distance - b.distance);
  
  return outletsWithDistance;
}

/**
 * Calculate delivery fee based on distance
 * @param {number} distance - Distance in kilometers
 * @param {Object} config - Delivery fee configuration
 * @returns {number} Delivery fee
 */
function calculateDeliveryFee(distance, config = {}) {
  const {
    baseDistance = 5, // Free delivery within 5km
    baseFee = 0,
    perKmFee = 10, // ₹10 per km after base distance
    maxFee = 100
  } = config;
  
  if (distance <= baseDistance) {
    return baseFee;
  }
  
  const extraDistance = distance - baseDistance;
  const fee = baseFee + (extraDistance * perKmFee);
  
  return Math.min(Math.round(fee), maxFee);
}

/**
 * Estimate delivery time based on distance
 * @param {number} distance - Distance in kilometers
 * @param {number} preparationTime - Food preparation time in minutes
 * @returns {number} Estimated time in minutes
 */
function estimateDeliveryTime(distance, preparationTime = 20) {
  // Assume average speed of 20 km/h in city
  const travelTime = (distance / 20) * 60; // Convert to minutes
  const bufferTime = 5; // Buffer time
  
  return Math.round(preparationTime + travelTime + bufferTime);
}

/**
 * Check if pincode is serviceable
 * @param {string} pincode - Pincode to check
 * @param {Array} serviceablePincodes - List of serviceable pincodes
 * @returns {boolean} True if serviceable
 */
function isPincodeServiceable(pincode, serviceablePincodes) {
  return serviceablePincodes.includes(pincode);
}

/**
 * Validate coordinates
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {boolean} True if valid
 */
function validateCoordinates(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

module.exports = {
  calculateDistance,
  isWithinServiceArea,
  findNearestOutlet,
  filterOutletsWithinRadius,
  calculateDeliveryFee,
  estimateDeliveryTime,
  isPincodeServiceable,
  validateCoordinates
};
