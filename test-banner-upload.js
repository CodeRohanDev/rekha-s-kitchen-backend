/**
 * Banner Image Upload Test Script
 * 
 * Tests the Firebase Storage upload functionality for banners
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test token (replace with actual token)
const ADMIN_TOKEN = 'your_admin_token_here';

// Helper function to create a test image buffer
function createTestImageBuffer() {
  // Create a simple 1x1 PNG image buffer for testing
  // This is a valid PNG file (1x1 red pixel)
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D,
    0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
    0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
}

// Helper function to make multipart/form-data request
async function uploadFile(endpoint, filePath, token) {
  const FormData = require('form-data');
  const form = new FormData();
  
  // If filePath is a buffer, use it directly
  if (Buffer.isBuffer(filePath)) {
    form.append('image', filePath, {
      filename: 'test-banner.png',
      contentType: 'image/png'
    });
  } else {
    // Otherwise, read from file
    form.append('image', fs.createReadStream(filePath));
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Upload failed:', error.message);
    return { status: 0, error: error.message };
  }
}

// Helper function for JSON requests
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

let uploadedImageUrl = null;
let createdBannerId = null;

// Test functions
async function testUploadImage() {
  console.log('\n📤 Test 1: Upload Banner Image');
  console.log('='.repeat(50));
  
  // Create a test image buffer
  const imageBuffer = createTestImageBuffer();
  
  const result = await uploadFile('/banners/upload-image', imageBuffer, ADMIN_TOKEN);
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 201 && result.data.success) {
    uploadedImageUrl = result.data.data.image_url;
    console.log('✅ Test passed - Image URL:', uploadedImageUrl);
  } else {
    console.log('❌ Test failed');
  }
}

async function testUploadWithoutFile() {
  console.log('\n📤 Test 2: Upload Without File (Should Fail)');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/banners/upload-image', 'POST', {}, ADMIN_TOKEN);
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 400) {
    console.log('✅ Test passed - Correctly rejected');
  } else {
    console.log('❌ Test failed - Should have been rejected');
  }
}

async function testCreateBannerWithUploadedImage() {
  if (!uploadedImageUrl) {
    console.log('\n⚠️  Test 3: Skipped (no image uploaded)');
    return;
  }

  console.log('\n➕ Test 3: Create Banner with Uploaded Image');
  console.log('='.repeat(50));
  
  const bannerData = {
    title: "Test Banner with Uploaded Image",
    subtitle: "Testing Firebase Storage",
    description: "This banner uses an image uploaded to Firebase Storage",
    image_url: uploadedImageUrl,
    banner_type: "promotional",
    action_type: "none",
    display_order: 0,
    is_active: true
  };
  
  const result = await makeRequest('/banners', 'POST', bannerData, ADMIN_TOKEN);
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 201 && result.data.success) {
    createdBannerId = result.data.data.banner_id;
    console.log('✅ Test passed - Banner ID:', createdBannerId);
  } else {
    console.log('❌ Test failed');
  }
}

async function testDeleteImage() {
  if (!uploadedImageUrl) {
    console.log('\n⚠️  Test 4: Skipped (no image uploaded)');
    return;
  }

  console.log('\n🗑️  Test 4: Delete Uploaded Image');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/banners/delete-image', 'DELETE', 
    { image_url: uploadedImageUrl }, ADMIN_TOKEN);
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
    console.log('\n⚠️  Test 5: Skipped (no banner created)');
    return;
  }

  console.log('\n🗑️  Test 5: Delete Banner (Should also delete image)');
  console.log('='.repeat(50));
  
  const result = await makeRequest(`/banners/${createdBannerId}`, 'DELETE', null, ADMIN_TOKEN);
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
  console.log('\n🚀 Starting Banner Upload Tests');
  console.log('='.repeat(50));
  console.log('Base URL:', BASE_URL);
  console.log('Time:', new Date().toISOString());
  
  try {
    await testUploadImage();
    await testUploadWithoutFile();
    await testCreateBannerWithUploadedImage();
    // Note: Skipping delete tests to keep the uploaded image for manual verification
    // await testDeleteImage();
    // await testDeleteBanner();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!');
    console.log('='.repeat(50));
    
    if (uploadedImageUrl) {
      console.log('\n📸 Uploaded Image URL:');
      console.log(uploadedImageUrl);
      console.log('\nYou can view this image in your browser or Firebase Console');
    }
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Instructions
console.log(`
📝 INSTRUCTIONS:
1. Make sure the server is running on ${BASE_URL}
2. Replace ADMIN_TOKEN with actual admin token
3. Ensure Firebase Storage is properly configured
4. Run: node test-banner-upload.js

To get token:
- Login as admin: POST /api/v1/auth/login
- Copy the token from the response

Firebase Storage Setup:
- Make sure FIREBASE_STORAGE_BUCKET is set in .env
- Or it will default to: your-project-id.appspot.com
- Ensure Storage is enabled in Firebase Console
`);

// Check if form-data is installed
try {
  require('form-data');
} catch (error) {
  console.log('\n⚠️  Installing required dependency: form-data');
  console.log('Run: npm install form-data\n');
  process.exit(1);
}

// Run tests if token is provided
if (ADMIN_TOKEN !== 'your_admin_token_here') {
  runAllTests();
} else {
  console.log('\n⚠️  Please update ADMIN_TOKEN in the script before running tests\n');
}
