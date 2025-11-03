// Test script to verify analytics endpoints
// Run with: node test-analytics-endpoints.js

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test endpoints
const endpoints = [
  '/api/v1/analytics/dashboard',
  '/api/v1/analytics/active-users',
  '/api/v1/analytics/active-users/trend',
  '/api/v1/analytics/customer-behavior',
  '/api/v1/analytics/customer-cohorts',
  '/api/v1/analytics/revenue/trends',
  '/api/v1/analytics/popular-items'
];

console.log('🧪 Testing Analytics Endpoints...\n');
console.log('Note: All should return 401 (Unauthorized) without token');
console.log('If you get 404, the route is not registered\n');

let completed = 0;
const results = [];

endpoints.forEach((endpoint) => {
  const url = `${BASE_URL}${endpoint}`;
  
  http.get(url, (res) => {
    const status = res.statusCode;
    const statusText = status === 401 ? '✅ Route exists (needs auth)' : 
                       status === 404 ? '❌ Route NOT found' :
                       `⚠️  Status ${status}`;
    
    results.push({ endpoint, status, statusText });
    completed++;
    
    if (completed === endpoints.length) {
      printResults();
    }
  }).on('error', (err) => {
    results.push({ endpoint, status: 'ERROR', statusText: `❌ ${err.message}` });
    completed++;
    
    if (completed === endpoints.length) {
      printResults();
    }
  });
});

function printResults() {
  console.log('\n📊 Results:\n');
  results.forEach(({ endpoint, status, statusText }) => {
    console.log(`${statusText}`);
    console.log(`   ${endpoint} - Status: ${status}\n`);
  });
  
  const allGood = results.every(r => r.status === 401);
  
  if (allGood) {
    console.log('✅ All routes are registered correctly!');
    console.log('   They return 401 because authentication is required.');
    console.log('   Test with a super_admin token to verify full functionality.\n');
  } else {
    const notFound = results.filter(r => r.status === 404);
    if (notFound.length > 0) {
      console.log('❌ Some routes are not registered:');
      notFound.forEach(r => console.log(`   - ${r.endpoint}`));
      console.log('\n💡 Make sure to restart your server after adding routes!\n');
    }
  }
}
