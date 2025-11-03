/**
 * Test script for Minimum Order Quantity feature
 * 
 * This script demonstrates how the minimum order quantity validation works
 * Run after seeding products with: npm run seed-products
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Test configuration
const config = {
  // You'll need to replace these with actual values after setup
  authToken: 'YOUR_AUTH_TOKEN_HERE',
  outletId: 'YOUR_OUTLET_ID_HERE',
  butterNaanId: 'YOUR_BUTTER_NAAN_ITEM_ID_HERE'
};

async function testMinOrderQuantity() {
  console.log('🧪 Testing Minimum Order Quantity Feature\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Get menu items to find items with min_order_quantity
    console.log('\n📋 Test 1: Fetching menu items with minimum order quantities...');
    
    const menuResponse = await axios.get(`${API_BASE_URL}/menu/items`, {
      headers: { Authorization: `Bearer ${config.authToken}` }
    });

    const itemsWithMinQty = menuResponse.data.data.items.filter(
      item => item.min_order_quantity > 1
    );

    console.log(`✅ Found ${itemsWithMinQty.length} items with minimum order quantities:`);
    itemsWithMinQty.forEach(item => {
      console.log(`   - ${item.name}: Min ${item.min_order_quantity}`);
    });

    if (itemsWithMinQty.length === 0) {
      console.log('⚠️  No items with minimum order quantities found.');
      console.log('   Run: npm run seed-products');
      return;
    }

    // Test 2: Try to order below minimum (should fail)
    console.log('\n❌ Test 2: Attempting to order below minimum quantity...');
    
    const testItem = itemsWithMinQty[0];
    console.log(`   Item: ${testItem.name}`);
    console.log(`   Min Quantity: ${testItem.min_order_quantity}`);
    console.log(`   Ordering: 1 (below minimum)`);

    try {
      await axios.post(
        `${API_BASE_URL}/orders`,
        {
          outlet_id: config.outletId,
          order_type: 'pickup',
          items: [
            {
              menu_item_id: testItem.id,
              quantity: 1
            }
          ],
          payment_method: 'card'
        },
        {
          headers: { Authorization: `Bearer ${config.authToken}` }
        }
      );
      console.log('❌ FAILED: Order should have been rejected!');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ PASSED: Order correctly rejected');
        console.log(`   Error: ${error.response.data.error.message}`);
      } else {
        console.log('⚠️  Unexpected error:', error.message);
      }
    }

    // Test 3: Order with exact minimum (should succeed)
    console.log('\n✅ Test 3: Ordering exact minimum quantity...');
    console.log(`   Item: ${testItem.name}`);
    console.log(`   Min Quantity: ${testItem.min_order_quantity}`);
    console.log(`   Ordering: ${testItem.min_order_quantity} (exact minimum)`);

    try {
      const orderResponse = await axios.post(
        `${API_BASE_URL}/orders`,
        {
          outlet_id: config.outletId,
          order_type: 'pickup',
          items: [
            {
              menu_item_id: testItem.id,
              quantity: testItem.min_order_quantity
            }
          ],
          payment_method: 'card'
        },
        {
          headers: { Authorization: `Bearer ${config.authToken}` }
        }
      );
      console.log('✅ PASSED: Order created successfully');
      console.log(`   Order ID: ${orderResponse.data.data.order_id}`);
    } catch (error) {
      console.log('❌ FAILED: Order should have been accepted');
      console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 4: Order above minimum (should succeed)
    console.log('\n✅ Test 4: Ordering above minimum quantity...');
    const aboveMin = testItem.min_order_quantity + 2;
    console.log(`   Item: ${testItem.name}`);
    console.log(`   Min Quantity: ${testItem.min_order_quantity}`);
    console.log(`   Ordering: ${aboveMin} (above minimum)`);

    try {
      const orderResponse = await axios.post(
        `${API_BASE_URL}/orders`,
        {
          outlet_id: config.outletId,
          order_type: 'pickup',
          items: [
            {
              menu_item_id: testItem.id,
              quantity: aboveMin
            }
          ],
          payment_method: 'card'
        },
        {
          headers: { Authorization: `Bearer ${config.authToken}` }
        }
      );
      console.log('✅ PASSED: Order created successfully');
      console.log(`   Order ID: ${orderResponse.data.data.order_id}`);
    } catch (error) {
      console.log('❌ FAILED: Order should have been accepted');
      console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 5: Item without minimum (should accept quantity 1)
    console.log('\n✅ Test 5: Ordering item without minimum quantity...');
    
    const itemWithoutMin = menuResponse.data.data.items.find(
      item => !item.min_order_quantity || item.min_order_quantity === 1
    );

    if (itemWithoutMin) {
      console.log(`   Item: ${itemWithoutMin.name}`);
      console.log(`   Min Quantity: ${itemWithoutMin.min_order_quantity || 1}`);
      console.log(`   Ordering: 1`);

      try {
        const orderResponse = await axios.post(
          `${API_BASE_URL}/orders`,
          {
            outlet_id: config.outletId,
            order_type: 'pickup',
            items: [
              {
                menu_item_id: itemWithoutMin.id,
                quantity: 1
              }
            ],
            payment_method: 'card'
          },
          {
            headers: { Authorization: `Bearer ${config.authToken}` }
          }
        );
        console.log('✅ PASSED: Order created successfully');
        console.log(`   Order ID: ${orderResponse.data.data.order_id}`);
      } catch (error) {
        console.log('❌ FAILED: Order should have been accepted');
        console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
      }
    } else {
      console.log('⚠️  No items without minimum quantity found');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Testing completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Instructions
console.log('📝 SETUP INSTRUCTIONS:');
console.log('1. Start the server: npm start');
console.log('2. Seed products: npm run seed-products');
console.log('3. Create a user and get auth token');
console.log('4. Create an outlet and get outlet ID');
console.log('5. Update config object in this file with:');
console.log('   - authToken');
console.log('   - outletId');
console.log('6. Run this test: node test-min-order-quantity.js\n');

// Check if config is set
if (config.authToken === 'YOUR_AUTH_TOKEN_HERE') {
  console.log('⚠️  Please update the config object with your actual values before running tests.\n');
} else {
  testMinOrderQuantity();
}
