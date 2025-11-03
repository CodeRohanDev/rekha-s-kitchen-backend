/**
 * Test script for Username Generator
 * Demonstrates food-themed username generation
 */

const { 
  generateFoodUsername, 
  generateUniqueUsername,
  isValidUsername 
} = require('./src/utils/usernameGenerator');

console.log('🍽️  Food-Themed Username Generator Test\n');
console.log('=' .repeat(50));

// Test 1: Generate 20 sample usernames
console.log('\n📝 Test 1: Generating 20 sample usernames...\n');

const usernames = [];
for (let i = 0; i < 20; i++) {
  const username = generateFoodUsername();
  usernames.push(username);
  console.log(`${(i + 1).toString().padStart(2, '0')}. ${username}`);
}

// Test 2: Check for duplicates
console.log('\n🔍 Test 2: Checking for duplicates...\n');
const uniqueUsernames = new Set(usernames);
console.log(`Generated: ${usernames.length} usernames`);
console.log(`Unique: ${uniqueUsernames.size} usernames`);
console.log(`Duplicates: ${usernames.length - uniqueUsernames.size}`);

if (uniqueUsernames.size === usernames.length) {
  console.log('✅ All usernames are unique!');
} else {
  console.log('⚠️  Some duplicates found (expected with small sample)');
}

// Test 3: Validate username format
console.log('\n✅ Test 3: Validating username format...\n');

const testCases = [
  { username: 'SpicySamosa789', expected: true },
  { username: 'BiryaniLover', expected: true },
  { username: 'AB', expected: false }, // Too short
  { username: 'This-Is-Invalid', expected: false }, // Contains hyphens
  { username: 'User@123', expected: false }, // Contains special char
  { username: 'ValidUsername123', expected: true }
];

testCases.forEach(({ username, expected }) => {
  const isValid = isValidUsername(username);
  const status = isValid === expected ? '✅' : '❌';
  console.log(`${status} "${username}" - Valid: ${isValid} (Expected: ${expected})`);
});

// Test 4: Pattern distribution
console.log('\n📊 Test 4: Analyzing pattern distribution...\n');

const patterns = {
  hasNumber: 0,
  hasThe: 0,
  length: []
};

usernames.forEach(username => {
  if (/\d/.test(username)) patterns.hasNumber++;
  if (username.startsWith('The')) patterns.hasThe++;
  patterns.length.push(username.length);
});

console.log(`Usernames with numbers: ${patterns.hasNumber}/${usernames.length}`);
console.log(`Usernames starting with "The": ${patterns.hasThe}/${usernames.length}`);
console.log(`Average length: ${Math.round(patterns.length.reduce((a, b) => a + b) / patterns.length)} characters`);
console.log(`Min length: ${Math.min(...patterns.length)} characters`);
console.log(`Max length: ${Math.max(...patterns.length)} characters`);

// Test 5: Generate unique username (requires database)
console.log('\n🔄 Test 5: Testing unique username generation...\n');
console.log('Note: This test requires database connection.');
console.log('Run with: node test-username-generator.js --with-db\n');

if (process.argv.includes('--with-db')) {
  (async () => {
    try {
      require('dotenv').config();
      console.log('Generating unique username from database...');
      const uniqueUsername = await generateUniqueUsername();
      console.log(`✅ Generated unique username: ${uniqueUsername}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  })();
} else {
  console.log('Skipped. Use --with-db flag to test with database.');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('✨ Username Generator Test Complete!\n');

console.log('📚 Sample Usernames Generated:');
console.log('   - ' + usernames.slice(0, 5).join('\n   - '));
console.log('   ... and 15 more\n');

console.log('💡 Usage in Code:');
console.log('   const { generateUniqueUsername } = require("./src/utils/usernameGenerator");');
console.log('   const username = await generateUniqueUsername();');
console.log('   console.log(username); // SpicySamosa789\n');

console.log('📖 Documentation: USERNAME_GENERATOR_FEATURE.md\n');
