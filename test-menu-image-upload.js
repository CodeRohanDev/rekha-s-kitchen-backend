/**
 * Test script for Menu Item Image Upload
 * 
 * Usage:
 * 1. Start the server: npm start
 * 2. Place a test image in the project root (test-image.jpg)
 * 3. Update ACCESS_TOKEN and CATEGORY_ID below
 * 4. Run: node test-menu-image-upload.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';

// Replace with your actual values
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';
const CATEGORY_ID = 'YOUR_CATEGORY_ID_HERE';
const TEST_IMAGE_PATH = './test-image.jpg'; // Place a test image here

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`
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

// Test 1: Upload image only
async function testUploadImageOnly() {
  console.log('\n📸 Test 1: Upload Image Only');
  console.log('='.repeat(50));

  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('❌ Test image not found at:', TEST_IMAGE_PATH);
    console.log('Please place a test image (JPEG/PNG) at the project root');
    return null;
  }

  try {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));

    const result = await apiRequest('/menu/items/upload-image', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 201) {
      console.log('✅ Image uploaded successfully');
      console.log('Image URL:', result.data.data.image_url);
      return result.data.data.image_url;
    } else {
      console.log('❌ Failed to upload image');
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

// Test 2: Upload and create menu item
async function testUploadAndCreate() {
  console.log('\n🍽️  Test 2: Upload and Create Menu Item');
  console.log('='.repeat(50));

  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('❌ Test image not found');
    return null;
  }

  try {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));
    formData.append('category_id', CATEGORY_ID);
    formData.append('name', `Test Item ${Date.now()}`);
    formData.append('description', 'Test menu item created via API');
    formData.append('price', '199');
    formData.append('is_vegetarian', 'true');
    formData.append('spice_level', 'medium');
    formData.append('preparation_time', '15');
    formData.append('ingredients', JSON.stringify(['Test Ingredient 1', 'Test Ingredient 2']));
    formData.append('nutritional_info', JSON.stringify({ calories: 250, protein: '10g' }));
    formData.append('is_available', 'true');

    const result = await apiRequest('/menu/items/upload-and-create', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 201) {
      console.log('✅ Menu item created successfully');
      console.log('Item ID:', result.data.data.item_id);
      console.log('Image URL:', result.data.data.item.image_url);
      return {
        itemId: result.data.data.item_id,
        imageUrl: result.data.data.item.image_url
      };
    } else {
      console.log('❌ Failed to create menu item');
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

// Test 3: Delete image
async function testDeleteImage(imageUrl) {
  console.log('\n🗑️  Test 3: Delete Image');
  console.log('='.repeat(50));

  if (!imageUrl) {
    console.log('⏭️  Skipping - no image URL provided');
    return;
  }

  const result = await apiRequest('/menu/items/delete-image', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image_url: imageUrl })
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));

  if (result.status === 200) {
    console.log('✅ Image deleted successfully');
  } else {
    console.log('❌ Failed to delete image');
  }
}

// Test 4: Delete menu item (should auto-delete image)
async function testDeleteMenuItem(itemId) {
  console.log('\n🗑️  Test 4: Delete Menu Item (Auto-delete Image)');
  console.log('='.repeat(50));

  if (!itemId) {
    console.log('⏭️  Skipping - no item ID provided');
    return;
  }

  const result = await apiRequest(`/menu/items/${itemId}`, {
    method: 'DELETE'
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));

  if (result.status === 200) {
    console.log('✅ Menu item deleted successfully');
    console.log('ℹ️  Image should be auto-deleted from Cloudinary');
  } else {
    console.log('❌ Failed to delete menu item');
  }
}

// Test 5: Validate file size limit
async function testFileSizeLimit() {
  console.log('\n⚠️  Test 5: File Size Validation');
  console.log('='.repeat(50));
  console.log('ℹ️  This test would require a file > 5MB');
  console.log('ℹ️  Skipping automated test - test manually if needed');
}

// Test 6: Validate file type
async function testFileTypeValidation() {
  console.log('\n⚠️  Test 6: File Type Validation');
  console.log('='.repeat(50));
  console.log('ℹ️  This test would require a non-image file');
  console.log('ℹ️  Skipping automated test - test manually if needed');
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 Starting Menu Item Image Upload Tests');
  console.log('='.repeat(50));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Category ID: ${CATEGORY_ID}`);
  console.log(`Test Image: ${TEST_IMAGE_PATH}`);
  console.log('='.repeat(50));

  // Check if tokens are set
  if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE' || CATEGORY_ID === 'YOUR_CATEGORY_ID_HERE') {
    console.log('\n❌ ERROR: Please update ACCESS_TOKEN and CATEGORY_ID in the script');
    console.log('\nTo get your access token:');
    console.log('1. Login via POST /api/v1/auth/login');
    console.log('2. Copy the access_token from the response');
    console.log('\nTo get a category ID:');
    console.log('1. Call GET /api/v1/menu/categories');
    console.log('2. Copy any category ID from the response');
    console.log('\nTo create a test image:');
    console.log('1. Place any JPEG/PNG image in the project root');
    console.log('2. Rename it to test-image.jpg');
    return;
  }

  try {
    // Test 1: Upload image only
    const imageUrl = await testUploadImageOnly();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Upload and create menu item
    const result = await testUploadAndCreate();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Delete image (from test 1)
    if (imageUrl) {
      await testDeleteImage(imageUrl);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test 4: Delete menu item (from test 2) - should auto-delete image
    if (result && result.itemId) {
      await testDeleteMenuItem(result.itemId);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test 5 & 6: Validation tests
    await testFileSizeLimit();
    await testFileTypeValidation();

    console.log('\n✅ All tests completed!');
    console.log('='.repeat(50));
    console.log('\n📝 Manual Tests to Perform:');
    console.log('1. Upload a file > 5MB (should fail)');
    console.log('2. Upload a non-image file (should fail)');
    console.log('3. Upload without authentication (should fail)');
    console.log('4. Upload as customer role (should fail)');
    console.log('5. Check Cloudinary dashboard to verify uploads');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run tests
runAllTests();
