# Username Generator - Quick Summary

## 🎯 What It Does

Automatically generates unique, food-themed usernames for customers during registration.

## ✨ Examples

- `SpicySamosa789`
- `BiryaniLover456`
- `CrispyDosaFan`
- `TheCurryKing`
- `TastyNaanMaster`

## 🚀 How It Works

1. Customer registers (email or OTP)
2. System generates unique username
3. Username saved to database
4. Returned in registration response

## 📝 Registration Response

```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "email": "customer@example.com",
    "username": "SpicySamosa789",  // ← Auto-generated!
    "role": "customer"
  }
}
```

## 🎨 4 Username Patterns

1. **Adjective + Noun + Number** → `SpicySamosa123`
2. **Noun + Suffix + Number** → `BiryaniLover456`
3. **Adjective + Noun + Suffix** → `TastyCurryFan`
4. **The + Noun + Suffix** → `TheSamosaKing`

## 📊 Word Lists

- **36 Adjectives:** Spicy, Crispy, Tasty, Yummy, etc.
- **48 Food Nouns:** Samosa, Biryani, Dosa, Curry, etc.
- **22 Suffixes:** Lover, Fan, Master, King, etc.

**Total Combinations:** Millions of unique usernames possible!

## 💻 Code Location

- **Generator:** `src/utils/usernameGenerator.js`
- **Integration:** `src/controllers/authController.js`
- **Test:** `test-username-generator.js`

## 🧪 Test It

```bash
# Generate 20 sample usernames
node test-username-generator.js

# Test with database connection
node test-username-generator.js --with-db
```

## 📱 Frontend Usage

```jsx
// Display in profile
<div className="username">
  @{user.username}
</div>

// Show in reviews
<div className="review-author">
  <span>@{user.username}</span>
  <span>⭐⭐⭐⭐⭐</span>
</div>

// Use in leaderboard
<div className="leaderboard">
  <span>#1</span>
  <span>@{user.username}</span>
  <span>1,250 pts</span>
</div>
```

## ✅ Features

- ✅ Automatic generation
- ✅ Uniqueness guaranteed
- ✅ Food-themed
- ✅ Fun & memorable
- ✅ No user input needed
- ✅ Works with email & OTP registration

## 🎯 Use Cases

1. **Reviews** - Display username instead of real name
2. **Leaderboards** - Gamification rankings
3. **Referrals** - Share username with friends
4. **Social** - Community interactions
5. **Privacy** - Protect real identity

## 📚 Full Documentation

See `USERNAME_GENERATOR_FEATURE.md` for complete details.

## 🔧 Customization

Want to add more words? Edit `src/utils/usernameGenerator.js`:

```javascript
const foodNouns = [
  ...existingWords,
  'Biryani', 'Samosa', 'Dosa'  // Add your words here
];
```

## 🎉 That's It!

Customers now get fun, unique usernames automatically! 🍽️
