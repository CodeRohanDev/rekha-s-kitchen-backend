/**
 * Test script for Favorites API endpoints
 * 
 * Usage:
 * 1. Start the server: npm start
 * 2. Run this script: node test-favorites-endpoints.js
 * 
 * Prerequisites:
 * - Valid user account with authentication token
 * - At least one menu item in the database
 */

const BASE_URL = 'http://localhost:3000/api/v1';

// Replace with your actual tokens and IDs
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';
const TEST_ITEM_ID = 'YOUR_MENU_ITEM_ID_HERE';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    const data = await response.json();
    return {
      status: response.status,
      data
    };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return {
      status: 0,
      error: error.message
    };
  }
}

// Test functions
async function testAddFavorite() {
  console.log('\n📝 Test 1: Add Item to Favorites');
  console.log('='.repeat(50));
  
  const result = await apiRequest('/favorites', {
    method: 'POST',
    body: JSON.stringify({
      item_id: TEST_ITEM_ID
    })
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 201) {
    console.log('✅ Successfully added to favorites');
    return result.data.data.favorite_id;
  } else if (result.status === 409) {
    console.log('ℹ️  Item already in favorites');
    return null;
  } else {
    console.log('❌ Failed to add to favorites');
    return null;
  }
}

async function testGetFavorites() {
  console.log('\n📋 Test 2: Get All Favorites');
  console.log('='.repeat(50));
  
  const result = await apiRequest('/favorites?page=1&limit=10', {
    method: 'GET'
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log(`✅ Retrieved ${result.data.data.favorites.length} favorites`);
    return result.data.data.favorites;
  } else {
    console.log('❌ Failed to get favorites');
    return [];
  }
}

async function testGetFavoritesCount() {
  console.log('\n🔢 Test 3: Get Favorites Count');
  console.log('='.repeat(50));
  
  const result = await apiRequest('/favorites/count', {
    method: 'GET'
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log(`✅ Total favorites: ${result.data.data.count}`);
    return result.data.data.count;
  } else {
    console.log('❌ Failed to get count');
    return 0;
  }
}

async function testCheckFavorite() {
  console.log('\n🔍 Test 4: Check if Item is Favorite');
  console.log('='.repeat(50));
  
  const result = await apiRequest(`/favorites/check/${TEST_ITEM_ID}`, {
    method: 'GET'
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    const isFavorite = result.data.data.is_favorite;
    console.log(`✅ Item is ${isFavorite ? 'favorited' : 'not favorited'}`);
    return isFavorite;
  } else {
    console.log('❌ Failed to check favorite status');
    return false;
  }
}

async function testRemoveFavorite() {
  console.log('\n🗑️  Test 5: Remove Item from Favorites');
  console.log('='.repeat(50));
  
  const result = await apiRequest(`/favorites/${TEST_ITEM_ID}`, {
    method: 'DELETE'
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('✅ Successfully removed from favorites');
    return true;
  } else if (result.status === 404) {
    console.log('ℹ️  Item not in favorites');
    return false;
  } else {
    console.log('❌ Failed to remove from favorites');
    return false;
  }
}

async function testClearAllFavorites() {
  console.log('\n🧹 Test 6: Clear All Favorites');
  console.log('='.repeat(50));
  
  const result = await apiRequest('/favorites', {
    method: 'DELETE'
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('✅ Successfully cleared all favorites');
    return true;
  } else {
    console.log('❌ Failed to clear favorites');
    return false;
  }
}

async function testFilterByOutlet(outletId) {
  console.log('\n🏪 Test 7: Filter Favorites by Outlet');
  console.log('='.repeat(50));
  
  const result = await apiRequest(`/favorites?outlet_id=${outletId}`, {
    method: 'GET'
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log(`✅ Retrieved ${result.data.data.favorites.length} favorites for outlet`);
    return result.data.data.favorites;
  } else {
    console.log('❌ Failed to filter favorites');
    return [];
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 Starting Favorites API Tests');
  console.log('='.repeat(50));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Item ID: ${TEST_ITEM_ID}`);
  console.log('='.repeat(50));

  // Check if tokens are set
  if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE' || TEST_ITEM_ID === 'YOUR_MENU_ITEM_ID_HERE') {
    console.log('\n❌ ERROR: Please update ACCESS_TOKEN and TEST_ITEM_ID in the script');
    console.log('\nTo get your access token:');
    console.log('1. Login via POST /api/v1/auth/login');
    console.log('2. Copy the access_token from the response');
    console.log('\nTo get a menu item ID:');
    console.log('1. Call GET /api/v1/menu/items');
    console.log('2. Copy any item ID from the response');
    return;
  }

  try {
    // Test 1: Add to favorites
    await testAddFavorite();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Get all favorites
    const favorites = await testGetFavorites();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Get count
    await testGetFavoritesCount();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 4: Check favorite status
    await testCheckFavorite();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 5: Filter by outlet (if we have favorites)
    if (favorites.length > 0 && favorites[0].item.outlet) {
      await testFilterByOutlet(favorites[0].item.outlet.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test 6: Remove from favorites
    await testRemoveFavorite();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 7: Add again for clear test
    await testAddFavorite();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 8: Clear all favorites
    await testClearAllFavorites();

    console.log('\n✅ All tests completed!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run tests
runAllTests();
