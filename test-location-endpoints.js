require('dotenv').config();
const { dbHelpers, collections } = require('./src/config/database');
const logger = require('./src/utils/logger');

async function testLocationEndpoints() {
  try {
    logger.info('🧪 Testing Location-Based Endpoints...\n');

    // Step 1: Get all active outlets
    logger.info('📍 Step 1: Fetching active outlets from database...');
    const outlets = await dbHelpers.getDocs(collections.OUTLETS, [
      { type: 'where', field: 'is_active', operator: '==', value: true }
    ]);

    logger.info(`✅ Found ${outlets.length} active outlet(s)\n`);

    if (outlets.length === 0) {
      logger.error('❌ No active outlets found. Please create at least one outlet first.');
      process.exit(1);
    }

    // Step 2: Check each outlet's data
    logger.info('📊 Step 2: Checking outlet data...\n');
    
    for (const outlet of outlets) {
      logger.info(`Outlet: ${outlet.name} (${outlet.id})`);
      logger.info(`  - Address: ${JSON.stringify(outlet.address)}`);
      logger.info(`  - Coordinates: ${JSON.stringify(outlet.coordinates)}`);
      logger.info(`  - Service Radius: ${outlet.service_radius || 10} km`);
      
      if (!outlet.coordinates) {
        logger.warn(`  ⚠️  WARNING: No coordinates found for this outlet!`);
      } else if (!outlet.coordinates.latitude || !outlet.coordinates.longitude) {
        logger.warn(`  ⚠️  WARNING: Incomplete coordinates!`);
      } else {
        logger.info(`  ✅ Coordinates are valid`);
      }
      logger.info('');
    }

    // Step 3: Test filterOutletsWithinRadius function
    logger.info('📍 Step 3: Testing geo-location filtering...\n');
    
    const { filterOutletsWithinRadius, validateCoordinates } = require('./src/utils/geoLocation');
    
    // Use first outlet's coordinates as test location (or nearby)
    const testOutlet = outlets.find(o => o.coordinates);
    
    if (!testOutlet) {
      logger.error('❌ No outlets with coordinates found. Cannot test geo-location.');
      process.exit(1);
    }

    const testLat = testOutlet.coordinates.latitude;
    const testLon = testOutlet.coordinates.longitude;
    
    logger.info(`Test Location: ${testLat}, ${testLon}`);
    logger.info(`Searching within 10 km radius...\n`);

    // Validate coordinates
    if (!validateCoordinates(testLat, testLon)) {
      logger.error('❌ Invalid test coordinates!');
      process.exit(1);
    }

    // Filter outlets
    const nearbyOutlets = filterOutletsWithinRadius(testLat, testLon, outlets, 10);
    
    logger.info(`✅ Found ${nearbyOutlets.length} outlet(s) within 10 km:`);
    nearbyOutlets.forEach(outlet => {
      logger.info(`  - ${outlet.name}: ${outlet.distance.toFixed(2)} km away`);
    });

    // Step 4: Simulate API responses
    logger.info('\n📡 Step 4: Simulating API responses...\n');

    // Simulate getNearbyOutlets response
    const nearbyResponse = nearbyOutlets.map(outlet => ({
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

    logger.info('GET /outlets/nearby response:');
    logger.info(JSON.stringify({
      success: true,
      data: {
        outlets: nearbyResponse,
        search_location: { latitude: testLat, longitude: testLon },
        search_radius: 10,
        total: nearbyResponse.length
      }
    }, null, 2));

    // Step 5: Summary
    logger.info('\n✨ Test Summary:');
    logger.info(`  - Total outlets: ${outlets.length}`);
    logger.info(`  - Outlets with coordinates: ${outlets.filter(o => o.coordinates).length}`);
    logger.info(`  - Outlets within 10km: ${nearbyOutlets.length}`);
    
    const missingCoords = outlets.filter(o => !o.coordinates || !o.coordinates.latitude || !o.coordinates.longitude);
    if (missingCoords.length > 0) {
      logger.warn(`\n⚠️  ${missingCoords.length} outlet(s) missing coordinates:`);
      missingCoords.forEach(o => {
        logger.warn(`  - ${o.name} (${o.id})`);
      });
      logger.info('\n💡 To fix: Update these outlets with coordinates using:');
      logger.info('   PUT /api/v1/outlets/:outletId');
      logger.info('   Body: { "coordinates": { "latitude": 19.0760, "longitude": 72.8777 } }');
    } else {
      logger.info('\n✅ All outlets have valid coordinates!');
    }

    logger.info('\n🎉 Test completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testLocationEndpoints();
