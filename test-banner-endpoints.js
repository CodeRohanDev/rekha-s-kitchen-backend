/**
 * Banner API Test Script
 * 
 * Tests all banner endpoints for the hero banner feature
 */

const BASE_URL = 'http://localhost:3000/api/v1';

// Test tokens (replace with actual tokens)
const SUPER_ADMIN_TOKEN = 'your_super_admin_token_here';
const OUTLET_ADMIN_TOKEN = 'your_outlet_admin_token_here';

// Test data
const testBanner = {
  title: "50% Off First Order",
  subtitle: "New customers only",
  description: "Get 50% discount on your first order above ₹299",
  image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
  banner_type: "promotional",
  action_type: "coupon",
  action_data: {
    coupon_code: "FIRST50"
  },
  target_audience: "new_users",
  display_order: 0,
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  is_active: true
};

let createdBannerId = null;

// Helper function to make requests
async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Request failed:', error.message);
    return { status: 0, error: error.message };
  }
}

// Test functions
async function testGetBanners() {
  console.log('\n📋 Test 1: Get All Banners (Public)');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/banners');
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('✅ Test passed');
  } else {
    console.log('❌ Test failed');
  }
}

async function testGetBannersWithFilters() {
  console.log('\n📋 Test 2: Get Banners with Filters');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/banners?banner_type=promotional&active_only=true');
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('✅ Test passed');
  } else {
    console.log('❌ Test failed');
  }
}

async function testCreateBanner() {
  console.log('\n➕ Test 3: Create Banner (Super Admin)');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/banners', 'POST', testBanner, SUPER_ADMIN_TOKEN);
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 201 && result.data.success) {
    createdBannerId = result.data.data.banner_id;
    console.log('✅ Test passed - Banner ID:', createdBannerId);
  } else {
    console.log('❌ Test failed');
  }
}

async function testGetBannerById() {
  if (!createdBannerId) {
    console.log('\n⚠️  Test 4: Skipped (no banner created)');
    return;
  }

  console.log('\n🔍 Test 4: Get Banner by ID');
  console.log('='.repeat(50));
  
  const result = await makeRequest(`/banners/${createdBannerId}`);
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('✅ Test passed');
  } else {
    console.log('❌ Test failed');
  }
}

async function testTrackBannerView() {
  if (!createdBannerId) {
    console.log('\n⚠️  Test 5: Skipped (no banner created)');
    return;
  }

  console.log('\n👁️  Test 5: Track Banner View');
  console.log('='.repeat(50));
  
  const result = await makeRequest(`/banners/${createdBannerId}/view`, 'POST');
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('✅ Test passed');
  } else {
    console.log('❌ Test failed');
  }
}

async function testTrackBannerClick() {
  if (!createdBannerId) {
    console.log('\n⚠️  Test 6: Skipped (no banner created)');
    return;
  }

  console.log('\n👆 Test 6: Track Banner Click');
  console.log('='.repeat(50));
  
  const result = await makeRequest(`/banners/${createdBannerId}/click`, 'POST');
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('✅ Test passed');
  } else {
    console.log('❌ Test failed');
  }
}

async function testUpdateBanner() {
  if (!createdBannerId) {
    console.log('\n⚠️  Test 7: Skipped (no banner created)');
    return;
  }

  console.log('\n✏️  Test 7: Update Banner');
  console.log('='.repeat(50));
  
  const updateData = {
    title: "UPDATED: 50% Off First Order",
    display_order: 5
  };
  
  const result = await makeRequest(`/banners/${createdBannerId}`, 'PUT', updateData, SUPER_ADMIN_TOKEN);
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('✅ Test passed');
  } else {
    console.log('❌ Test failed');
  }
}

async function testToggleBannerStatus() {
  if (!createdBannerId) {
    console.log('\n⚠️  Test 8: Skipped (no banner created)');
    return;
  }

  console.log('\n🔄 Test 8: Toggle Banner Status');
  console.log('='.repeat(50));
  
  const result = await makeRequest(`/banners/${createdBannerId}/toggle`, 'PATCH', 
    { is_active: false }, SUPER_ADMIN_TOKEN);
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('✅ Test passed');
  } else {
    console.log('❌ Test failed');
  }
}

async function testGetBannerAnalytics() {
  if (!createdBannerId) {
    console.log('\n⚠️  Test 9: Skipped (no banner created)');
    return;
  }

  console.log('\n📊 Test 9: Get Banner Analytics');
  console.log('='.repeat(50));
  
  const result = await makeRequest(`/banners/${createdBannerId}/analytics`, 'GET', null, SUPER_ADMIN_TOKEN);
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('✅ Test passed');
  } else {
    console.log('❌ Test failed');
  }
}

async function testDeleteBanner() {
  if (!createdBannerId) {
    console.log('\n⚠️  Test 10: Skipped (no banner created)');
    return;
  }

  console.log('\n🗑️  Test 10: Delete Banner');
  console.log('='.repeat(50));
  
  const result = await makeRequest(`/banners/${createdBannerId}`, 'DELETE', null, SUPER_ADMIN_TOKEN);
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200) {
    console.log('✅ Test passed');
  } else {
    console.log('❌ Test failed');
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting Banner API Tests');
  console.log('='.repeat(50));
  console.log('Base URL:', BASE_URL);
  console.log('Time:', new Date().toISOString());
  
  try {
    // Public endpoints
    await testGetBanners();
    await testGetBannersWithFilters();
    
    // Admin endpoints (require authentication)
    await testCreateBanner();
    await testGetBannerById();
    await testTrackBannerView();
    await testTrackBannerClick();
    await testUpdateBanner();
    await testToggleBannerStatus();
    await testGetBannerAnalytics();
    await testDeleteBanner();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Instructions
console.log(`
📝 INSTRUCTIONS:
1. Make sure the server is running on ${BASE_URL}
2. Replace SUPER_ADMIN_TOKEN and OUTLET_ADMIN_TOKEN with actual tokens
3. Run: node test-banner-endpoints.js

To get tokens:
- Login as super admin: POST /api/v1/auth/login
- Login as outlet admin: POST /api/v1/auth/login
- Copy the token from the response
`);

// Run tests if tokens are provided
if (SUPER_ADMIN_TOKEN !== 'your_super_admin_token_here') {
  runAllTests();
} else {
  console.log('\n⚠️  Please update the tokens in the script before running tests\n');
}
