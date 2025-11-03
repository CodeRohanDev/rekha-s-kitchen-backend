# Auto-Generated Food-Themed Usernames

## Overview

When customers register, the system automatically generates a unique, fun, food-related username. This creates a friendly, engaging experience and eliminates the need for customers to think of usernames.

## Features

✅ **Automatic Generation** - No user input required  
✅ **Food-Themed** - All usernames are food-related  
✅ **Unique** - Checks database to ensure uniqueness  
✅ **Fun & Memorable** - Easy to remember and share  
✅ **Multiple Patterns** - 4 different username patterns

## Username Patterns

### Pattern 1: Adjective + Noun + Number
Examples:
- `SpicySamosa123`
- `CrispyDosa456`
- `TastyBiryani789`

### Pattern 2: Noun + Suffix + Number
Examples:
- `BiryaniLover456`
- `SamosaFan789`
- `CurryMaster123`

### Pattern 3: Adjective + Noun + Suffix
Examples:
- `SpicyCurryFan`
- `CrispyPakoraLover`
- `TastyNaanKing`

### Pattern 4: The + Noun + Suffix
Examples:
- `TheSamosaKing`
- `TheBiryaniQueen`
- `TheCurryMaster`

## Word Lists

### Adjectives (36 words)
Spicy, Sweet, Crispy, Tasty, Yummy, Savory, Tangy, Zesty, Delicious, Hungry, Crunchy, Juicy, Fresh, Golden, Sizzling, Smoky, Creamy, Buttery, Cheesy, Minty, Peppy, Spiced, Toasted, Grilled, Baked, Fried, Steamed, Roasted, Glazed, Caramel, Chocolate, Vanilla, Mango, Berry, Citrus, Tropical

### Food Nouns (48 words)
Samosa, Biryani, Naan, Curry, Tikka, Masala, Dosa, Idli, Pakora, Kebab, Paneer, Tandoor, Chai, Lassi, Kulfi, Gulab, Raita, Chutney, Paratha, Roti, Pulao, Korma, Vindaloo, Bhaji, Vada, Uttapam, Puri, Halwa, Kheer, Jalebi, Ladoo, Barfi, Momo, Chaat, Kachori, Dhokla, Poha, Upma, Rasam, Appam, Pizza, Burger, Taco, Sushi, Pasta, Waffle, Cookie, Brownie

### Suffixes (22 words)
Lover, Fan, Eater, Muncher, Foodie, Connoisseur, Enthusiast, Addict, Craver, Hunter, Seeker, Master, Chef, Guru, King, Queen, Prince, Princess, Boss, Hero, Star, Legend

## API Response

### Registration Response
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user_id": "user123",
    "email": "customer@example.com",
    "username": "SpicySamosa789",
    "role": "customer"
  }
}
```

### OTP Registration Response
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user123",
      "phone": "+1234567890",
      "username": "BiryaniLover456",
      "role": "customer",
      "profile": {
        "first_name": "John",
        "last_name": "Doe",
        "username": "BiryaniLover456"
      }
    },
    "tokens": {
      "access_token": "...",
      "refresh_token": "..."
    },
    "is_new_user": true
  }
}
```

### Profile Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "customer@example.com",
      "username": "TastyCurryFan",
      "phone": "+1234567890",
      "role": "customer",
      "profile": {
        "first_name": "John",
        "last_name": "Doe",
        "username": "TastyCurryFan"
      }
    }
  }
}
```

## Implementation Details

### Username Generation Process

1. **Select Pattern** - Randomly choose one of 4 patterns
2. **Generate Username** - Combine words based on pattern
3. **Check Availability** - Query database for existing username
4. **Retry if Taken** - Try up to 10 times
5. **Fallback** - Add timestamp if all attempts fail

### Code Example

```javascript
const { generateUniqueUsername } = require('../utils/usernameGenerator');

// Generate unique username
const username = await generateUniqueUsername();
// Returns: "SpicySamosa789"

// Check if username is available
const isAvailable = await isUsernameAvailable("BiryaniLover123");
// Returns: true or false

// Validate username format
const isValid = isValidUsername("SpicySamosa789");
// Returns: true
```

## Database Schema

### Users Collection
```javascript
{
  id: "user123",
  email: "customer@example.com",
  username: "SpicySamosa789",  // NEW FIELD
  phone: "+1234567890",
  role: "customer",
  created_at: "2024-01-15T10:00:00Z"
}
```

### User Profiles Collection
```javascript
{
  user_id: "user123",
  first_name: "John",
  last_name: "Doe",
  username: "SpicySamosa789",  // NEW FIELD
  avatar_url: "https://...",
  addresses: []
}
```

## Frontend Implementation

### Display Username

```jsx
// In profile page
<div className="username">
  <span className="label">Username:</span>
  <span className="value">@{user.username}</span>
</div>

// In reviews
<div className="review-author">
  <img src={user.avatar_url} alt={user.username} />
  <span>@{user.username}</span>
</div>

// In leaderboard
<div className="leaderboard-item">
  <span className="rank">#1</span>
  <span className="username">@{user.username}</span>
  <span className="points">{user.points} pts</span>
</div>
```

### Share Username

```jsx
// Referral sharing
<div className="referral-code">
  <p>Your username: <strong>@{user.username}</strong></p>
  <p>Share with friends!</p>
  <button onClick={() => shareUsername(user.username)}>
    Share Username
  </button>
</div>
```

## Use Cases

### 1. Social Features
- Display in reviews and ratings
- Show in leaderboards
- Use in referral program
- Community interactions

### 2. Gamification
- Username-based achievements
- Public profiles
- Social sharing
- Competition rankings

### 3. Personalization
- Friendly greeting: "Welcome back, @SpicySamosa789!"
- Personalized notifications
- Custom badges
- Profile customization

### 4. Marketing
- Shareable usernames
- Social media integration
- User-generated content
- Community building

## Customization

### Add More Words

Edit `src/utils/usernameGenerator.js`:

```javascript
// Add more adjectives
const foodAdjectives = [
  ...existingWords,
  'Spicy', 'Tangy', 'Crispy'  // Add your words
];

// Add more nouns
const foodNouns = [
  ...existingWords,
  'Biryani', 'Samosa', 'Dosa'  // Add your words
];
```

### Change Patterns

```javascript
// Add new pattern
const patterns = [
  ...existingPatterns,
  // Pattern 5: Adjective + Adjective + Noun
  () => {
    const adj1 = foodAdjectives[Math.floor(Math.random() * foodAdjectives.length)];
    const adj2 = foodAdjectives[Math.floor(Math.random() * foodAdjectives.length)];
    const noun = foodNouns[Math.floor(Math.random() * foodNouns.length)];
    return `${adj1}${adj2}${noun}`;
  }
];
```

## Testing

### Test Username Generation

```javascript
// Test in Node.js console
const { generateFoodUsername } = require('./src/utils/usernameGenerator');

// Generate 10 usernames
for (let i = 0; i < 10; i++) {
  console.log(generateFoodUsername());
}

// Output:
// SpicySamosa789
// BiryaniLover456
// CrispyDosaFan
// TheCurryKing
// TastyNaanMaster
// ...
```

### Test Registration

```bash
# Register new customer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User",
    "phone": "+1234567890",
    "role": "customer"
  }'

# Check response for username field
```

## Migration

### For Existing Users

Existing users without usernames can be updated:

```javascript
// Migration script
const { generateUniqueUsername } = require('./src/utils/usernameGenerator');
const { db, collections } = require('./src/config/database');

async function migrateUsernames() {
  const usersSnapshot = await db.collection(collections.USERS)
    .where('username', '==', null)
    .get();
  
  for (const doc of usersSnapshot.docs) {
    const username = await generateUniqueUsername();
    await doc.ref.update({ username });
    console.log(`Updated user ${doc.id} with username: ${username}`);
  }
}

migrateUsernames();
```

## Best Practices

1. **Display Prominently** - Show username in profile and reviews
2. **Allow Sharing** - Make it easy to share usernames
3. **Use in Notifications** - Personalize with username
4. **Gamification** - Use for leaderboards and achievements
5. **Privacy** - Username is public, don't expose sensitive data

## Future Enhancements

- [ ] Allow users to change username (once per month)
- [ ] Username suggestions if user wants custom
- [ ] Username badges and achievements
- [ ] Username-based search
- [ ] Username verification badges
- [ ] Custom username for premium users

## Summary

✅ **Automatic** - Generated on registration  
✅ **Unique** - Database-checked uniqueness  
✅ **Fun** - Food-themed and memorable  
✅ **Scalable** - Millions of combinations  
✅ **Flexible** - Easy to customize  

The username generator creates a fun, engaging experience for customers while maintaining uniqueness and brand consistency with food-themed names.
