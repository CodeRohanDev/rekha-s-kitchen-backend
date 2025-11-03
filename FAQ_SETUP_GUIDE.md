# FAQ System - Complete Setup Guide

This guide walks you through setting up the FAQ system from scratch.

---

## Prerequisites

- ✅ Node.js and npm installed
- ✅ Firebase project configured
- ✅ Server running on port 3000 (or your configured port)
- ✅ Super admin account created

---

## Step 1: Verify Installation

Check that all FAQ files are in place:

```bash
# Backend files
ls src/controllers/faqController.js
ls src/routes/faqs.js

# Scripts
ls scripts/initialize-faqs.js

# Documentation
ls ADMIN_FAQ_MANAGEMENT_API_DOCS.md
ls MOBILE_FAQ_API_DOCS.md
```

---

## Step 2: Create Super Admin Account

If you don't have a super admin account yet:

```bash
curl -X POST http://localhost:3000/api/v1/auth/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rekhaskitchen.com",
    "password": "YourSecurePassword123!",
    "phone": "+1234567890",
    "first_name": "Admin",
    "last_name": "User",
    "secret_key": "REKHAS_KITCHEN_SUPER_ADMIN_2024"
  }'
```

**Note:** This endpoint only works in development mode.

---

## Step 3: Get Access Token

Login to get your access token:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rekhaskitchen.com",
    "password": "YourSecurePassword123!"
  }'
```

**Save the `access_token` from the response.** You'll need it for the next steps.

Example response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "...",
      "expires_in": null
    }
  }
}
```

---

## Step 4: Initialize FAQ System

Run the initialization script to populate sample FAQs:

```bash
# Set your access token as environment variable
export SUPER_ADMIN_TOKEN="your_access_token_here"

# Run initialization script
node scripts/initialize-faqs.js
```

**Expected output:**
```
============================================================
🚀 FAQ SYSTEM INITIALIZATION
============================================================

📍 API Base URL: http://localhost:3000/api/v1
🔑 Using access token: eyJhbGciOiJIUzI1Ni...

📂 Processing category: GENERAL
------------------------------------------------------------
✅ Created: "What is Rekha's Kitchen?..."
   ID: faq_abc123
✅ Created: "What areas do you deliver to?..."
   ID: faq_def456
...

============================================================
📊 INITIALIZATION SUMMARY
============================================================
✅ Successfully created: 47 FAQs
❌ Failed: 0 FAQs
📁 Categories: 8

✨ FAQ system initialized successfully!
```

---

## Step 5: Verify Installation

### Test Public Endpoints (No Auth Required)

**Get all FAQs:**
```bash
curl http://localhost:3000/api/v1/faqs
```

**Get categories:**
```bash
curl http://localhost:3000/api/v1/faqs/categories
```

**Search FAQs:**
```bash
curl "http://localhost:3000/api/v1/faqs/search?q=delivery"
```

### Test Admin Endpoints (Auth Required)

**Get all FAQs (admin view):**
```bash
curl -X GET http://localhost:3000/api/v1/faqs/admin/all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Create a new FAQ:**
```bash
curl -X POST http://localhost:3000/api/v1/faqs/admin \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Test question?",
    "answer": "Test answer",
    "category": "general",
    "display_order": 100
  }'
```

---

## Step 6: Run Test Suite (Optional)

Run the comprehensive test suite:

```bash
# Edit test-faq-endpoints.js and update ACCESS_TOKEN
# Then run:
node test-faq-endpoints.js
```

---

## Step 7: Mobile Integration

Share these endpoints with your mobile developers:

### Public Endpoints (No Auth)
- `GET /api/v1/faqs` - Get all active FAQs
- `GET /api/v1/faqs?category=orders` - Filter by category
- `GET /api/v1/faqs/search?q=query` - Search FAQs
- `GET /api/v1/faqs/categories` - Get categories

### Documentation
- Share `MOBILE_FAQ_API_DOCS.md` with mobile team
- Includes Flutter/Dart code examples
- Complete UI implementation guide

---

## Troubleshooting

### Issue: "Please set your access token"

**Solution:**
```bash
# Make sure you set the environment variable
export SUPER_ADMIN_TOKEN="your_actual_token"

# Or edit the script directly
# Open scripts/initialize-faqs.js
# Update: const ACCESS_TOKEN = 'your_token_here';
```

### Issue: "Authentication required"

**Cause:** Token is invalid or expired

**Solution:**
1. Login again to get a fresh token
2. Update the ACCESS_TOKEN
3. Run the script again

### Issue: "Too many requests"

**Cause:** Rate limiting (100 requests per 15 minutes)

**Solution:**
- Wait 15 minutes and try again
- The script includes delays to avoid this
- If it still happens, increase delay in script

### Issue: "FAQ not found" when testing

**Cause:** FAQs weren't created successfully

**Solution:**
1. Check initialization script output for errors
2. Verify database connection
3. Check server logs
4. Try creating a FAQ manually via API

### Issue: FAQs not showing in mobile app

**Possible causes:**
- FAQ is inactive (`is_active: false`)
- Wrong category filter
- App not fetching from correct endpoint

**Solution:**
1. Check FAQ status in admin panel
2. Verify mobile app is calling correct endpoint
3. Check network requests in mobile app debugger

---

## Customization

### Adding More Sample FAQs

Edit `scripts/initialize-faqs.js`:

```javascript
const sampleFAQs = {
  general: [
    {
      question: 'Your new question?',
      answer: 'Your detailed answer...',
      display_order: 10
    },
    // Add more...
  ],
  // Other categories...
};
```

### Changing Categories

To add/modify categories, update:
1. `src/middleware/validation.js` - Add to category enum
2. `scripts/initialize-faqs.js` - Add sample FAQs
3. Documentation files

### Customizing Display Order

FAQs are ordered by `display_order` (ascending):
- 0 appears first
- 1 appears second
- etc.

Use the reorder endpoint to change order:
```bash
curl -X POST http://localhost:3000/api/v1/faqs/admin/reorder \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "faq_orders": [
      {"faq_id": "faq_1", "display_order": 0},
      {"faq_id": "faq_2", "display_order": 1}
    ]
  }'
```

---

## Production Deployment

### Before Going Live

1. **Review all FAQs**
   - Check for typos and grammar
   - Verify all information is accurate
   - Test all links

2. **Set appropriate display order**
   - Most important FAQs first
   - Group related questions

3. **Test thoroughly**
   - Test all endpoints
   - Verify mobile app integration
   - Check search functionality

4. **Security**
   - Ensure admin endpoints require authentication
   - Verify rate limiting is working
   - Check input validation

5. **Monitoring**
   - Set up logging
   - Monitor API usage
   - Track popular searches

### Production Checklist

- [ ] All sample FAQs reviewed and approved
- [ ] Display order optimized
- [ ] Mobile app tested with real data
- [ ] Search functionality tested
- [ ] Admin panel tested
- [ ] Rate limiting verified
- [ ] Error handling tested
- [ ] Documentation shared with team
- [ ] Monitoring set up
- [ ] Backup procedures in place

---

## Maintenance

### Regular Tasks

**Weekly:**
- Review new questions from support tickets
- Add FAQs for common issues
- Update outdated information

**Monthly:**
- Analyze FAQ usage/searches
- Reorder based on popularity
- Remove rarely viewed FAQs

**Quarterly:**
- Comprehensive review of all FAQs
- Update for new features
- Improve answers based on feedback

### Updating FAQs

```bash
# Update an FAQ
curl -X PUT http://localhost:3000/api/v1/faqs/admin/FAQ_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "Updated answer with new information..."
  }'
```

### Deactivating FAQs

Instead of deleting, deactivate outdated FAQs:

```bash
curl -X PATCH http://localhost:3000/api/v1/faqs/admin/FAQ_ID/toggle \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

---

## Next Steps

1. ✅ Complete this setup guide
2. 📱 Share mobile documentation with app developers
3. 🎨 Design FAQ UI in mobile app
4. 🧪 Test thoroughly
5. 🚀 Deploy to production
6. 📊 Monitor usage and improve

---

## Resources

### Documentation Files
- `ADMIN_FAQ_MANAGEMENT_API_DOCS.md` - Complete admin API docs
- `MOBILE_FAQ_API_DOCS.md` - Mobile developer guide
- `FAQ_QUICK_REFERENCE.md` - Quick reference
- `FAQ_SYSTEM_SUMMARY.md` - System overview
- `scripts/README.md` - Scripts documentation

### Test Files
- `test-faq-endpoints.js` - Comprehensive test suite
- `scripts/initialize-faqs.js` - Initialization script

### Support
- Check documentation first
- Review error messages
- Check server logs
- Contact development team

---

## Success Criteria

Your FAQ system is successfully set up when:

✅ Initialization script runs without errors  
✅ Public endpoints return FAQs  
✅ Admin can create/edit/delete FAQs  
✅ Search functionality works  
✅ Mobile app displays FAQs correctly  
✅ Categories are properly organized  
✅ All tests pass  

---

**Congratulations! Your FAQ system is ready to use! 🎉**
