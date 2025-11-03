require('dotenv').config();
const { db, collections } = require('../src/config/database');
const logger = require('../src/utils/logger');
const readline = require('readline');

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function clearMenuData() {
  try {
    logger.info('🗑️  Menu Data Cleanup Script');
    logger.info('================================\n');
    
    // Step 1: Count existing data
    logger.info('📊 Checking existing data...');
    
    const categoriesSnapshot = await db.collection(collections.MENU_CATEGORIES).get();
    const itemsSnapshot = await db.collection(collections.MENU_ITEMS).get();
    
    const categoryCount = categoriesSnapshot.size;
    const itemCount = itemsSnapshot.size;
    
    logger.info(`Found:`);
    logger.info(`  - ${categoryCount} categories`);
    logger.info(`  - ${itemCount} menu items\n`);
    
    if (categoryCount === 0 && itemCount === 0) {
      logger.info('✨ No data to delete. Database is already clean!');
      rl.close();
      process.exit(0);
      return;
    }
    
    // Step 2: Ask for confirmation
    logger.warn('⚠️  WARNING: This will permanently delete ALL menu categories and items!');
    logger.warn('⚠️  This action CANNOT be undone!\n');
    
    const answer = await askQuestion('Are you sure you want to continue? (yes/no): ');
    
    if (answer.toLowerCase() !== 'yes') {
      logger.info('❌ Operation cancelled by user.');
      rl.close();
      process.exit(0);
      return;
    }
    
    // Double confirmation for safety
    const doubleCheck = await askQuestion('\n🔴 Final confirmation - Type "DELETE" to proceed: ');
    
    if (doubleCheck !== 'DELETE') {
      logger.info('❌ Operation cancelled. Confirmation text did not match.');
      rl.close();
      process.exit(0);
      return;
    }
    
    logger.info('\n🚀 Starting deletion process...\n');
    
    // Step 3: Delete all menu items first
    if (itemCount > 0) {
      logger.info('🗑️  Deleting menu items...');
      const itemBatch = db.batch();
      let itemDeleteCount = 0;
      
      itemsSnapshot.docs.forEach(doc => {
        itemBatch.delete(doc.ref);
        itemDeleteCount++;
      });
      
      await itemBatch.commit();
      logger.info(`✅ Deleted ${itemDeleteCount} menu items`);
    }
    
    // Step 4: Delete all categories
    if (categoryCount > 0) {
      logger.info('🗑️  Deleting categories...');
      const categoryBatch = db.batch();
      let categoryDeleteCount = 0;
      
      categoriesSnapshot.docs.forEach(doc => {
        categoryBatch.delete(doc.ref);
        categoryDeleteCount++;
      });
      
      await categoryBatch.commit();
      logger.info(`✅ Deleted ${categoryDeleteCount} categories`);
    }
    
    // Step 5: Verify deletion
    logger.info('\n🔍 Verifying deletion...');
    const verifyCategories = await db.collection(collections.MENU_CATEGORIES).get();
    const verifyItems = await db.collection(collections.MENU_ITEMS).get();
    
    if (verifyCategories.size === 0 && verifyItems.size === 0) {
      logger.info('✅ Verification successful - All data deleted!');
    } else {
      logger.warn('⚠️  Warning: Some data may still exist');
      logger.warn(`  - Categories remaining: ${verifyCategories.size}`);
      logger.warn(`  - Items remaining: ${verifyItems.size}`);
    }
    
    logger.info('\n✨ Cleanup completed successfully!');
    logger.info('📊 Summary:');
    logger.info(`   - Categories deleted: ${categoryCount}`);
    logger.info(`   - Menu items deleted: ${itemCount}`);
    logger.info('\n💡 You can now run "npm run seed-products" to add demo data again.');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during cleanup:', error);
    rl.close();
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  logger.info('\n\n❌ Operation cancelled by user (Ctrl+C)');
  rl.close();
  process.exit(0);
});

// Run the cleanup
clearMenuData();
