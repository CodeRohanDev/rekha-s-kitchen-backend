require('dotenv').config();
const { dbHelpers, collections } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function migrateCoordinates() {
  try {
    logger.info('🔄 Starting coordinates migration...\n');

    // Get all outlets
    logger.info('📍 Fetching all outlets...');
    const outlets = await dbHelpers.getDocs(collections.OUTLETS);

    logger.info(`✅ Found ${outlets.length} outlet(s)\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const outlet of outlets) {
      logger.info(`Processing: ${outlet.name} (${outlet.id})`);

      // Check if coordinates already exist in the correct field
      if (outlet.coordinates && outlet.coordinates.latitude && outlet.coordinates.longitude) {
        logger.info(`  ✓ Already has coordinates in correct field`);
        skippedCount++;
        continue;
      }

      // Check if coordinates exist in address field
      if (outlet.address && outlet.address.latitude && outlet.address.longitude) {
        const lat = outlet.address.latitude;
        const lon = outlet.address.longitude;

        logger.info(`  📍 Found coordinates in address field: ${lat}, ${lon}`);

        try {
          // Update outlet with coordinates in correct field
          await dbHelpers.updateDoc(collections.OUTLETS, outlet.id, {
            coordinates: {
              latitude: lat,
              longitude: lon
            }
          });

          logger.info(`  ✅ Migrated coordinates successfully`);
          migratedCount++;
        } catch (error) {
          logger.error(`  ❌ Error migrating coordinates:`, error.message);
          errorCount++;
        }
      } else {
        logger.warn(`  ⚠️  No coordinates found in address field`);
        skippedCount++;
      }

      logger.info('');
    }

    logger.info('✨ Migration completed!\n');
    logger.info('📊 Summary:');
    logger.info(`  - Total outlets: ${outlets.length}`);
    logger.info(`  - Migrated: ${migratedCount}`);
    logger.info(`  - Skipped: ${skippedCount}`);
    logger.info(`  - Errors: ${errorCount}`);

    if (migratedCount > 0) {
      logger.info('\n🎉 Coordinates migrated successfully!');
      logger.info('💡 You can now test the location endpoints:');
      logger.info('   node test-location-endpoints.js');
    }

    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateCoordinates();
