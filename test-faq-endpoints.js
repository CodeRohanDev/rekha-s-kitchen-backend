/**
 * FAQ Endpoints Test Script
 * 
 * This script tests all FAQ endpoints (admin and mobile)
 * 
 * Usage:
 * 1. Start your server: npm start
 * 2. Create a super admin account
 * 3. Login and get access token
 * 4. Update ACCESS_TOKEN below
 * 5. Run: node test-faq-endpoints.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';
const ACCESS_TOKEN = 'YOUR_SUPER_ADMIN_ACCESS_TOKEN_HERE';

// Test data
let createdFAQIds = [];

// Helper function for API calls
async function apiCall(method, endpoint, data = null, requiresAuth = false) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (requiresAuth) {
      config.headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    }

    if (data) {
      config.headers['Content-Type'] = 'application/json';
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Test functions
async function testCreateFAQ() {
  console.log('\n📝 Testing: Create FAQ');
  console.log('='.repeat(50));

  const testFAQs = [
    {
      question: 'How do I track my order?',
      answer: 'You can track your order in real-time from the Orders section of the app. You\'ll receive notifications at each stage of your order preparation and delivery.',
      category: 'orders',
      display_order: 0,
      is_active: true
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards, UPI, digital wallets (Paytm, PhonePe, Google Pay), and cash on delivery.',
      category: 'payments',
      display_order: 0,
      is_active: true
    },
    {
      question: 'What are your delivery hours?',
      answer: 'We deliver from 10 AM to 10 PM daily. Orders placed outside these hours will be delivered the next day starting from 10 AM.',
      category: 'delivery',
      display_order: 0,
      is_active: true
    },
    {
      question: 'How do I earn loyalty points?',
      answer: 'You earn loyalty points with every order. For every ₹100 spent, you earn 10 points. You can redeem these points for discounts on future orders.',
      category: 'loyalty',
      display_order: 0,
      is_active: true
    },
    {
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order within 5 minutes of placing it from the Orders section. After that, please contact customer support for assistance.',
      category: 'orders',
      display_order: 1,
      is_active: true
    }
  ];

  for (const faq of testFAQs) {
    const result = await apiCall('POST', '/faqs/admin', faq, true);
    
    if (result.success) {
      console.log(`✅ Created FAQ: "${faq.question}"`);
      console.log(`   ID: ${result.data.data.faq.id}`);
      createdFAQIds.push(result.data.data.faq.id);
    } else {
      console.log(`❌ Failed to create FAQ: "${faq.question}"`);
      console.log(`   Error:`, result.error);
    }
  }
}

async function testGetAllFAQsAdmin() {
  console.log('\n📋 Testing: Get All FAQs (Admin)');
  console.log('='.repeat(50));

  // Test without filters
  let result = await apiCall('GET', '/faqs/admin/all', null, true);
  if (result.success) {
    console.log(`✅ Got all FAQs: ${result.data.data.faqs.length} items`);
    console.log(`   Pagination:`, result.data.data.pagination);
  } else {
    console.log('❌ Failed to get all FAQs');
    console.log('   Error:', result.error);
  }

  // Test with category filter
  result = await apiCall('GET', '/faqs/admin/all?category=orders', null, true);
  if (result.success) {
    console.log(`✅ Got FAQs filtered by category: ${result.data.data.faqs.length} items`);
  } else {
    console.log('❌ Failed to get filtered FAQs');
  }

  // Test with active filter
  result = await apiCall('GET', '/faqs/admin/all?is_active=true', null, true);
  if (result.success) {
    console.log(`✅ Got active FAQs: ${result.data.data.faqs.length} items`);
  } else {
    console.log('❌ Failed to get active FAQs');
  }
}

async function testGetSingleFAQ() {
  console.log('\n🔍 Testing: Get Single FAQ');
  console.log('='.repeat(50));

  if (createdFAQIds.length === 0) {
    console.log('⚠️  No FAQs created yet, skipping test');
    return;
  }

  const faqId = createdFAQIds[0];
  const result = await apiCall('GET', `/faqs/admin/${faqId}`, null, true);

  if (result.success) {
    console.log(`✅ Got FAQ: ${result.data.data.faq.question}`);
    console.log(`   Category: ${result.data.data.faq.category}`);
    console.log(`   Active: ${result.data.data.faq.is_active}`);
  } else {
    console.log('❌ Failed to get FAQ');
    console.log('   Error:', result.error);
  }
}

async function testUpdateFAQ() {
  console.log('\n✏️  Testing: Update FAQ');
  console.log('='.repeat(50));

  if (createdFAQIds.length === 0) {
    console.log('⚠️  No FAQs created yet, skipping test');
    return;
  }

  const faqId = createdFAQIds[0];
  const updateData = {
    answer: 'UPDATED: You can track your order in real-time from the Orders section. We provide live updates via push notifications and in-app tracking.',
    display_order: 5
  };

  const result = await apiCall('PUT', `/faqs/admin/${faqId}`, updateData, true);

  if (result.success) {
    console.log(`✅ Updated FAQ successfully`);
    console.log(`   New answer: ${result.data.data.faq.answer.substring(0, 50)}...`);
    console.log(`   New display order: ${result.data.data.faq.display_order}`);
  } else {
    console.log('❌ Failed to update FAQ');
    console.log('   Error:', result.error);
  }
}

async function testToggleFAQStatus() {
  console.log('\n🔄 Testing: Toggle FAQ Status');
  console.log('='.repeat(50));

  if (createdFAQIds.length === 0) {
    console.log('⚠️  No FAQs created yet, skipping test');
    return;
  }

  const faqId = createdFAQIds[0];

  // Deactivate
  let result = await apiCall('PATCH', `/faqs/admin/${faqId}/toggle`, { is_active: false }, true);
  if (result.success) {
    console.log(`✅ Deactivated FAQ`);
    console.log(`   Status: ${result.data.data.faq.is_active}`);
  } else {
    console.log('❌ Failed to deactivate FAQ');
    console.log('   Error:', result.error);
  }

  // Reactivate
  result = await apiCall('PATCH', `/faqs/admin/${faqId}/toggle`, { is_active: true }, true);
  if (result.success) {
    console.log(`✅ Reactivated FAQ`);
    console.log(`   Status: ${result.data.data.faq.is_active}`);
  } else {
    console.log('❌ Failed to reactivate FAQ');
  }
}

async function testReorderFAQs() {
  console.log('\n🔢 Testing: Reorder FAQs');
  console.log('='.repeat(50));

  if (createdFAQIds.length < 2) {
    console.log('⚠️  Need at least 2 FAQs, skipping test');
    return;
  }

  const reorderData = {
    faq_orders: createdFAQIds.slice(0, 3).map((id, index) => ({
      faq_id: id,
      display_order: index * 10
    }))
  };

  const result = await apiCall('POST', '/faqs/admin/reorder', reorderData, true);

  if (result.success) {
    console.log(`✅ Reordered ${reorderData.faq_orders.length} FAQs`);
    console.log(`   New order:`, reorderData.faq_orders);
  } else {
    console.log('❌ Failed to reorder FAQs');
    console.log('   Error:', result.error);
  }
}

async function testGetActiveFAQs() {
  console.log('\n📱 Testing: Get Active FAQs (Mobile)');
  console.log('='.repeat(50));

  // Get all active FAQs
  let result = await apiCall('GET', '/faqs', null, false);
  if (result.success) {
    console.log(`✅ Got active FAQs (grouped by category)`);
    console.log(`   Total: ${result.data.data.total}`);
    console.log(`   Categories:`, Object.keys(result.data.data.faqs));
  } else {
    console.log('❌ Failed to get active FAQs');
    console.log('   Error:', result.error);
  }

  // Get FAQs by category
  result = await apiCall('GET', '/faqs?category=orders', null, false);
  if (result.success) {
    console.log(`✅ Got FAQs filtered by category (orders)`);
    console.log(`   Total: ${result.data.data.total}`);
  } else {
    console.log('❌ Failed to get filtered FAQs');
  }
}

async function testSearchFAQs() {
  console.log('\n🔎 Testing: Search FAQs');
  console.log('='.repeat(50));

  // Search for "order"
  let result = await apiCall('GET', '/faqs/search?q=order', null, false);
  if (result.success) {
    console.log(`✅ Search for "order": ${result.data.data.total} results`);
    if (result.data.data.results.length > 0) {
      console.log(`   First result: ${result.data.data.results[0].question}`);
    }
  } else {
    console.log('❌ Failed to search FAQs');
    console.log('   Error:', result.error);
  }

  // Search for "delivery"
  result = await apiCall('GET', '/faqs/search?q=delivery', null, false);
  if (result.success) {
    console.log(`✅ Search for "delivery": ${result.data.data.total} results`);
  } else {
    console.log('❌ Failed to search FAQs');
  }

  // Test short query (should fail)
  result = await apiCall('GET', '/faqs/search?q=a', null, false);
  if (!result.success) {
    console.log(`✅ Short query validation working (rejected "a")`);
  } else {
    console.log('⚠️  Short query should have been rejected');
  }
}

async function testGetCategories() {
  console.log('\n📂 Testing: Get Categories');
  console.log('='.repeat(50));

  const result = await apiCall('GET', '/faqs/categories', null, false);

  if (result.success) {
    console.log(`✅ Got categories: ${result.data.data.categories.length} categories`);
    result.data.data.categories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.count} FAQs`);
    });
  } else {
    console.log('❌ Failed to get categories');
    console.log('   Error:', result.error);
  }
}

async function testDeleteFAQ() {
  console.log('\n🗑️  Testing: Delete FAQ');
  console.log('='.repeat(50));

  if (createdFAQIds.length === 0) {
    console.log('⚠️  No FAQs created yet, skipping test');
    return;
  }

  // Delete the last created FAQ
  const faqId = createdFAQIds[createdFAQIds.length - 1];
  const result = await apiCall('DELETE', `/faqs/admin/${faqId}`, null, true);

  if (result.success) {
    console.log(`✅ Deleted FAQ: ${faqId}`);
    createdFAQIds.pop(); // Remove from array
  } else {
    console.log('❌ Failed to delete FAQ');
    console.log('   Error:', result.error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n' + '='.repeat(50));
  console.log('🧪 FAQ ENDPOINTS TEST SUITE');
  console.log('='.repeat(50));

  if (ACCESS_TOKEN === 'YOUR_SUPER_ADMIN_ACCESS_TOKEN_HERE') {
    console.log('\n❌ ERROR: Please update ACCESS_TOKEN in the script');
    console.log('   1. Create a super admin account');
    console.log('   2. Login and get access token');
    console.log('   3. Update ACCESS_TOKEN variable');
    return;
  }

  try {
    // Admin tests
    await testCreateFAQ();
    await testGetAllFAQsAdmin();
    await testGetSingleFAQ();
    await testUpdateFAQ();
    await testToggleFAQStatus();
    await testReorderFAQs();

    // Mobile/Public tests
    await testGetActiveFAQs();
    await testSearchFAQs();
    await testGetCategories();

    // Cleanup
    await testDeleteFAQ();

    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS COMPLETED');
    console.log('='.repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`   Created FAQs: ${createdFAQIds.length + 1}`);
    console.log(`   Remaining FAQs: ${createdFAQIds.length}`);
    console.log(`\n💡 Note: ${createdFAQIds.length} test FAQs remain in database`);
    console.log(`   You can delete them manually or keep for testing`);

  } catch (error) {
    console.log('\n❌ Test suite failed with error:');
    console.log(error);
  }
}

// Run tests
runAllTests();
