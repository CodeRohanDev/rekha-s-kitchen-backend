# FAQ System - Quick Reference

## Overview
Complete FAQ management system with admin controls and public mobile endpoints.

## Quick Start

**Initialize with sample FAQs:**
```bash
export SUPER_ADMIN_TOKEN="your_token"
node scripts/initialize-faqs.js
```

This creates 40+ sample FAQs across all categories.

---

## Admin Endpoints (Super Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/faqs/admin` | Create new FAQ |
| GET | `/api/v1/faqs/admin/all` | Get all FAQs (with filters) |
| GET | `/api/v1/faqs/admin/:faqId` | Get single FAQ |
| PUT | `/api/v1/faqs/admin/:faqId` | Update FAQ |
| DELETE | `/api/v1/faqs/admin/:faqId` | Delete FAQ |
| PATCH | `/api/v1/faqs/admin/:faqId/toggle` | Toggle active status |
| POST | `/api/v1/faqs/admin/reorder` | Reorder multiple FAQs |

---

## Mobile/Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/faqs` | Get all active FAQs (grouped by category) |
| GET | `/api/v1/faqs/search?q=query` | Search FAQs |
| GET | `/api/v1/faqs/categories` | Get all categories with counts |

---

## FAQ Categories

- `general` - General questions
- `orders` - Order-related
- `payments` - Payment & billing
- `delivery` - Delivery & shipping
- `account` - Account management
- `menu` - Menu & food
- `loyalty` - Loyalty program
- `technical` - Technical support

---

## Quick Examples

### Create FAQ
```bash
curl -X POST http://localhost:3000/api/v1/faqs/admin \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I track my order?",
    "answer": "You can track your order from the Orders section...",
    "category": "orders",
    "display_order": 0
  }'
```

### Get All FAQs (Mobile)
```bash
curl http://localhost:3000/api/v1/faqs
```

### Search FAQs
```bash
curl "http://localhost:3000/api/v1/faqs/search?q=delivery"
```

### Update FAQ
```bash
curl -X PUT http://localhost:3000/api/v1/faqs/admin/FAQ_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answer": "Updated answer..."}'
```

### Toggle Status
```bash
curl -X PATCH http://localhost:3000/api/v1/faqs/admin/FAQ_ID/toggle \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

---

## Field Validations

### Create/Update FAQ
- `question`: 10-500 characters (required for create)
- `answer`: 10-2000 characters (required for create)
- `category`: One of predefined categories
- `display_order`: Integer >= 0
- `is_active`: Boolean

---

## Response Format

### Grouped FAQs (Mobile)
```json
{
  "success": true,
  "data": {
    "faqs": {
      "orders": [
        {
          "id": "faq_123",
          "question": "...",
          "answer": "...",
          "display_order": 0
        }
      ],
      "payments": [...]
    },
    "total": 15
  }
}
```

### Search Results
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "faq_123",
        "question": "...",
        "answer": "...",
        "category": "orders"
      }
    ],
    "total": 3,
    "query": "delivery"
  }
}
```

---

## Files Created

1. **Backend:**
   - `src/controllers/faqController.js` - FAQ controller
   - `src/routes/faqs.js` - FAQ routes
   - Updated `src/middleware/validation.js` - FAQ schemas
   - Updated `src/config/database.js` - Added FAQS collection
   - Updated `src/app.js` - Registered FAQ routes

2. **Documentation:**
   - `ADMIN_FAQ_MANAGEMENT_API_DOCS.md` - Admin documentation
   - `MOBILE_FAQ_API_DOCS.md` - Mobile developer documentation
   - `FAQ_QUICK_REFERENCE.md` - This file

---

## Testing Checklist

### Admin Functions
- [ ] Create FAQ
- [ ] Get all FAQs with filters
- [ ] Get single FAQ
- [ ] Update FAQ
- [ ] Delete FAQ
- [ ] Toggle FAQ status
- [ ] Reorder FAQs
- [ ] Filter by category
- [ ] Filter by active status

### Mobile Functions
- [ ] Get all FAQs
- [ ] Get FAQs by category
- [ ] Search FAQs
- [ ] Get categories
- [ ] Verify only active FAQs shown
- [ ] Verify proper grouping

### Edge Cases
- [ ] Empty FAQ list
- [ ] Search with no results
- [ ] Invalid category
- [ ] Short search query (< 2 chars)
- [ ] Special characters in search
- [ ] Very long question/answer

---

## Common Issues

### FAQ not showing in mobile app
- Check `is_active` is true
- Verify category is correct
- Check display_order

### Search not working
- Ensure query is at least 2 characters
- Search is case-insensitive
- Searches both question and answer

### Reorder not working
- Ensure all FAQ IDs are valid
- Check display_order values are unique
- Verify admin permissions

---

## Rate Limits

- All endpoints: 100 requests per 15 minutes
- No authentication required for public endpoints
- Admin endpoints require super_admin role

---

## Next Steps

1. Test all endpoints
2. Create sample FAQs for each category
3. Integrate with mobile app
4. Set up monitoring
5. Train admins on FAQ management
