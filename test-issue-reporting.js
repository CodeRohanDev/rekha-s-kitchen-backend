/**
 * Test script for Issue Reporting API
 * 
 * Usage:
 * 1. Start the server: npm start
 * 2. Place a test image in the project root (test-issue-image.jpg)
 * 3. Update ACCESS_TOKEN below
 * 4. Run: node test-issue-reporting.js
 */

const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api/v1';

// Replace with your actual token
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';
const TEST_IMAGE_PATH = './test-issue-image.jpg';

// Helper function
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

// Test 1: Report issue without images
async function testReportIssueWithoutImages() {
  console.log('\n📝 Test 1: Report Issue Without Images');
  console.log('='.repeat(50));

  try {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    formData.append('issue_type', 'app_issue');
    formData.append('subject', 'Test Issue - App Crash');
    formData.append('description', 'The app crashes when I try to view my order history');
    formData.append('priority', 'medium');

    const result = await apiRequest('/issues', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 201) {
      console.log('✅ Issue reported successfully');
      console.log('Issue Number:', result.data.data.issue_number);
      return result.data.data.issue_id;
    } else {
      console.log('❌ Failed to report issue');
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

// Test 2: Report issue with images
async function testReportIssueWithImages() {
  console.log('\n📸 Test 2: Report Issue With Images');
  console.log('='.repeat(50));

  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('⏭️  Skipping - test image not found at:', TEST_IMAGE_PATH);
    return null;
  }

  try {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    formData.append('images', fs.createReadStream(TEST_IMAGE_PATH));
    formData.append('issue_type', 'food_quality');
    formData.append('subject', 'Test Issue - Food Quality');
    formData.append('description', 'The food arrived cold and packaging was damaged');
    formData.append('priority', 'high');

    const result = await apiRequest('/issues', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 201) {
      console.log('✅ Issue with image reported successfully');
      return result.data.data.issue_id;
    } else {
      console.log('❌ Failed to report issue');
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

// Test 3: Get my issues
async function testGetMyIssues() {
  console.log('\n📋 Test 3: Get My Issues');
  console.log('='.repeat(50));

  const result = await apiRequest('/issues/my-issues?page=1&limit=10', {
    method: 'GET'
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));

  if (result.status === 200) {
    console.log(`✅ Retrieved ${result.data.data.issues.length} issues`);
    return result.data.data.issues;
  } else {
    console.log('❌ Failed to get issues');
    return [];
  }
}

// Test 4: Get issue details
async function testGetIssueDetails(issueId) {
  console.log('\n🔍 Test 4: Get Issue Details');
  console.log('='.repeat(50));

  if (!issueId) {
    console.log('⏭️  Skipping - no issue ID provided');
    return;
  }

  const result = await apiRequest(`/issues/${issueId}`, {
    method: 'GET'
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));

  if (result.status === 200) {
    console.log('✅ Retrieved issue details');
  } else {
    console.log('❌ Failed to get issue details');
  }
}

// Test 5: Add comment
async function testAddComment(issueId) {
  console.log('\n💬 Test 5: Add Comment');
  console.log('='.repeat(50));

  if (!issueId) {
    console.log('⏭️  Skipping - no issue ID provided');
    return;
  }

  const result = await apiRequest(`/issues/${issueId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      comment: 'This is a test comment. Thank you for looking into this issue.'
    })
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));

  if (result.status === 200) {
    console.log('✅ Comment added successfully');
  } else {
    console.log('❌ Failed to add comment');
  }
}

// Test 6: Filter issues by status
async function testFilterByStatus() {
  console.log('\n🔎 Test 6: Filter Issues by Status');
  console.log('='.repeat(50));

  const result = await apiRequest('/issues/my-issues?status=open', {
    method: 'GET'
  });

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));

  if (result.status === 200) {
    console.log(`✅ Retrieved ${result.data.data.issues.length} open issues`);
  } else {
    console.log('❌ Failed to filter issues');
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 Starting Issue Reporting API Tests');
  console.log('='.repeat(50));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Image: ${TEST_IMAGE_PATH}`);
  console.log('='.repeat(50));

  // Check if token is set
  if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
    console.log('\n❌ ERROR: Please update ACCESS_TOKEN in the script');
    console.log('\nTo get your access token:');
    console.log('1. Login via POST /api/v1/auth/login');
    console.log('2. Copy the access_token from the response');
    console.log('\nTo create a test image:');
    console.log('1. Place any JPEG/PNG image in the project root');
    console.log('2. Rename it to test-issue-image.jpg');
    return;
  }

  try {
    // Test 1: Report issue without images
    const issueId1 = await testReportIssueWithoutImages();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Report issue with images
    const issueId2 = await testReportIssueWithImages();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Get my issues
    const issues = await testGetMyIssues();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 4: Get issue details
    const testIssueId = issueId1 || issueId2 || (issues.length > 0 ? issues[0].id : null);
    await testGetIssueDetails(testIssueId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 5: Add comment
    await testAddComment(testIssueId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 6: Filter by status
    await testFilterByStatus();

    console.log('\n✅ All tests completed!');
    console.log('='.repeat(50));
    console.log('\n📝 Manual Tests to Perform:');
    console.log('1. Upload more than 5 images (should fail)');
    console.log('2. Upload file > 5MB (should fail)');
    console.log('3. Upload non-image file (should fail)');
    console.log('4. Test without authentication (should fail)');
    console.log('5. Check Cloudinary dashboard to verify uploads');
    console.log('6. Test admin endpoints (requires admin token)');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run tests
runAllTests();
