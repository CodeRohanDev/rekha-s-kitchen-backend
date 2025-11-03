/**
 * Food-themed Username Generator
 * Generates unique, fun, food-related usernames for customers
 */

const { dbHelpers, collections } = require('../config/database');

// Food-related adjectives (short and simple)
const foodAdjectives = [
    'Spicy', 'Sweet', 'Hot', 'Tasty', 'Yummy', 'Tangy', 'Zesty',
    'Crispy', 'Juicy', 'Fresh', 'Golden', 'Smoky', 'Creamy', 'Masala',
    'Desi', 'Royal', 'Mini', 'Mega', 'Super', 'Happy', 'Lucky'
];

// Indian food items (short names only)
const foodNouns = [
    'Dosa', 'Idli', 'Vada', 'Puri', 'Roti', 'Naan', 'Chai', 'Lassi',
    'Kulfi', 'Gulab', 'Raita', 'Tikka', 'Kebab', 'Paneer', 'Aloo',
    'Gobi', 'Bhaji', 'Pakora', 'Samosa', 'Chaat', 'Poha', 'Upma',
    'Kheer', 'Halwa', 'Ladoo', 'Barfi', 'Momo', 'Dhokla', 'Kachori',
    'Pulao', 'Korma', 'Rasam', 'Appam', 'Bhel', 'Sev', 'Namak',
    'Mirch', 'Jeera', 'Haldi', 'Ghee', 'Dal', 'Rice', 'Atta'
];

// Food-related suffixes (short)
const foodSuffixes = [
    'Lover', 'Fan', 'Eater', 'Foodie', 'Master', 'Chef', 'Guru',
    'King', 'Queen', 'Boss', 'Hero', 'Star', 'Pro', 'Champ'
];

/**
 * Generate a random food-themed username
 * Format: Short Indian food-themed names
 */
function generateFoodUsername() {
    const patterns = [
        // Pattern 1: Noun + Number (e.g., Dosa123, Chai456)
        () => {
            const noun = foodNouns[Math.floor(Math.random() * foodNouns.length)];
            const num = Math.floor(Math.random() * 1000);
            return `${noun}${num}`;
        },

        // Pattern 2: Adjective + Noun (e.g., SpicyDosa, HotChai)
        () => {
            const adj = foodAdjectives[Math.floor(Math.random() * foodAdjectives.length)];
            const noun = foodNouns[Math.floor(Math.random() * foodNouns.length)];
            return `${adj}${noun}`;
        },

        // Pattern 3: Noun + Suffix (e.g., DosaFan, ChaiLover)
        () => {
            const noun = foodNouns[Math.floor(Math.random() * foodNouns.length)];
            const suffix = foodSuffixes[Math.floor(Math.random() * foodSuffixes.length)];
            return `${noun}${suffix}`;
        },

        // Pattern 4: Adjective + Noun + Number (e.g., SpicyDosa99)
        () => {
            const adj = foodAdjectives[Math.floor(Math.random() * foodAdjectives.length)];
            const noun = foodNouns[Math.floor(Math.random() * foodNouns.length)];
            const num = Math.floor(Math.random() * 100);
            return `${adj}${noun}${num}`;
        }
    ];

    // Randomly select a pattern
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return pattern();
}

/**
 * Check if username already exists
 */
async function isUsernameAvailable(username) {
    try {
        const existingUsers = await dbHelpers.getDocs(collections.USERS, [
            { type: 'where', field: 'username', operator: '==', value: username }
        ]);

        return existingUsers.length === 0;
    } catch (error) {
        console.error('Error checking username availability:', error);
        return false;
    }
}

/**
 * Generate a unique food-themed username
 * Tries up to 10 times to find an available username
 */
async function generateUniqueUsername(maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        const username = generateFoodUsername();
        const isAvailable = await isUsernameAvailable(username);

        if (isAvailable) {
            return username;
        }
    }

    // Fallback: Add timestamp if all attempts fail
    const fallbackUsername = generateFoodUsername() + Date.now().toString().slice(-4);
    return fallbackUsername;
}

/**
 * Generate username from user's name (alternative method)
 * Format: FirstName + FoodNoun + Number
 */
function generateUsernameFromName(fullName) {
    const firstName = fullName.split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const noun = foodNouns[Math.floor(Math.random() * foodNouns.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${firstName}${noun}${num}`;
}

/**
 * Validate username format
 */
function isValidUsername(username) {
    // Username should be 3-30 characters, alphanumeric only
    const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
    return usernameRegex.test(username);
}

module.exports = {
    generateUniqueUsername,
    generateUsernameFromName,
    isUsernameAvailable,
    isValidUsername,
    generateFoodUsername
};
