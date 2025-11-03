# Admin FAQ Management API Documentation

## Base URL
```
http://your-api-domain.com/api/v1/faqs
```

## Authentication
All admin endpoints require authentication and super_admin role:
```
Authorization: Bearer <access_token>
```

---

## FAQ Categories

The system supports the following predefined categories:
- `general` - General questions about the service
- `orders` - Order-related questions
- `payments` - Payment and billing questions
- `delivery` - Delivery and shipping questions
- `account` - Account management questions
- `menu` - Menu and food-related questions
- `loyalty` - Loyalty program questions
- `technical` - Technical support questions

---

## Admin Endpoints

### 1. Create FAQ

Create a new FAQ entry.

**Endpoint:** `POST /admin`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "question": "How do I track my order?",
  "answer": "You can track your order in real-time from the Orders section of the app. You'll receive notifications at each stage of your order preparation and delivery.",
  "category": "orders",
  "display_order": 1,
  "is_active": true
}
```

**Field Validations:**
- `question`: Required, 10-500 characters
- `answer`: Required, 10-2000 characters
- `category`: Optional, one of the predefined categories (default: "general")
- `display_order`: Optional, integer >= 0 (default: 0)
- `is_active`: Optional, boolean (default: true)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "FAQ created successfully",
  "data": {
    "faq": {
      "id": "faq_abc123",
      "question": "How do I track my order?",
      "answer": "You can track your order in real-time from the Orders section of the app...",
      "category": "orders",
      "display_order": 1,
      "is_active": true,
      "created_by": "admin_user_id",
      "created_at": "2025-10-29T12:00:00Z",
      "updated_at": "2025-10-29T12:00:00Z"
    }
  }
}
```

---

### 2. Get All FAQs (Admin)

Get all FAQs including inactive ones with filtering and pagination.

**Endpoint:** `GET /admin/all`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `category` (optional): Filter by category
- `is_active` (optional): Filter by active status ("true" or "false")
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Example Request:**
```
GET /admin/all?category=orders&is_active=true&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "faqs": [
      {
        "id": "faq_abc123",
        "question": "How do I track my order?",
        "answer": "You can track your order in real-time...",
        "category": "orders",
        "display_order": 1,
        "is_active": true,
        "created_by": "admin_user_id",
        "created_at": "2025-10-29T12:00:00Z",
        "updated_at": "2025-10-29T12:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 45,
      "items_per_page": 20,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

---

### 3. Get Single FAQ

Get a specific FAQ by ID.

**Endpoint:** `GET /admin/:faqId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "faq": {
      "id": "faq_abc123",
      "question": "How do I track my order?",
      "answer": "You can track your order in real-time...",
      "category": "orders",
      "display_order": 1,
      "is_active": true,
      "created_by": "admin_user_id",
      "created_at": "2025-10-29T12:00:00Z",
      "updated_at": "2025-10-29T12:00:00Z"
    }
  }
}
```

---

### 4. Update FAQ

Update an existing FAQ.

**Endpoint:** `PUT /admin/:faqId`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "question": "How can I track my order status?",
  "answer": "Updated answer with more details...",
  "category": "orders",
  "display_order": 2,
  "is_active": true
}
```

**Field Validations:**
- `question`: Optional, 10-500 characters
- `answer`: Optional, 10-2000 characters
- `category`: Optional, one of the predefined categories
- `display_order`: Optional, integer >= 0
- `is_active`: Optional, boolean

**Response (200 OK):**
```json
{
  "success": true,
  "message": "FAQ updated successfully",
  "data": {
    "faq": {
      "id": "faq_abc123",
      "question": "How can I track my order status?",
      "answer": "Updated answer with more details...",
      "category": "orders",
      "display_order": 2,
      "is_active": true,
      "created_by": "admin_user_id",
      "updated_by": "admin_user_id",
      "created_at": "2025-10-29T12:00:00Z",
      "updated_at": "2025-10-29T13:00:00Z"
    }
  }
}
```

---

### 5. Delete FAQ

Permanently delete an FAQ.

**Endpoint:** `DELETE /admin/:faqId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "FAQ deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: FAQ not found

---

### 6. Toggle FAQ Status

Activate or deactivate an FAQ without deleting it.

**Endpoint:** `PATCH /admin/:faqId/toggle`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "is_active": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "FAQ deactivated successfully",
  "data": {
    "faq": {
      "id": "faq_abc123",
      "question": "How do I track my order?",
      "answer": "You can track your order in real-time...",
      "category": "orders",
      "display_order": 1,
      "is_active": false,
      "updated_by": "admin_user_id",
      "updated_at": "2025-10-29T14:00:00Z"
    }
  }
}
```

---

### 7. Reorder FAQs

Update the display order of multiple FAQs at once.

**Endpoint:** `POST /admin/reorder`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "faq_orders": [
    {
      "faq_id": "faq_abc123",
      "display_order": 0
    },
    {
      "faq_id": "faq_def456",
      "display_order": 1
    },
    {
      "faq_id": "faq_ghi789",
      "display_order": 2
    }
  ]
}
```

**Field Validations:**
- `faq_orders`: Required, array with at least 1 item
- `faq_id`: Required, string
- `display_order`: Required, integer >= 0

**Response (200 OK):**
```json
{
  "success": true,
  "message": "FAQs reordered successfully"
}
```

**Use Case:**
This endpoint is useful when you want to drag-and-drop FAQs to reorder them in your admin panel. Send all the new positions in a single request.

---

## Common Error Responses

All endpoints may return these error responses:

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "question",
        "message": "\"question\" length must be at least 10 characters long"
      }
    ]
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "FAQ not found"
  }
}
```

**429 Rate Limit Exceeded:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to process request"
  }
}
```

---

## Best Practices

### 1. FAQ Organization

**Use Clear Categories:**
- Group related questions together
- Use appropriate categories for easy filtering
- Keep category names consistent

**Display Order:**
- Lower numbers appear first (0, 1, 2, ...)
- Put most frequently asked questions at the top
- Use the reorder endpoint for bulk updates

### 2. Writing Good FAQs

**Questions:**
- Write questions as users would ask them
- Keep questions concise and specific
- Use natural language

**Answers:**
- Provide clear, step-by-step answers
- Include relevant details but avoid overwhelming users
- Use simple language
- Keep answers between 50-500 words

### 3. Content Management

**Regular Updates:**
- Review FAQs quarterly
- Update answers when features change
- Remove outdated FAQs

**Active Status:**
- Use `is_active: false` instead of deleting FAQs
- This preserves the FAQ for future reference
- You can reactivate it later if needed

### 4. Testing

**Before Publishing:**
- Test FAQ display on mobile app
- Verify all links work
- Check formatting and readability
- Ensure answers are accurate

---

## Example Workflow

### Creating a New FAQ Section

1. **Create FAQs:**
```bash
# Create first FAQ
POST /admin
{
  "question": "What are your delivery hours?",
  "answer": "We deliver from 10 AM to 10 PM daily...",
  "category": "delivery",
  "display_order": 0,
  "is_active": true
}

# Create second FAQ
POST /admin
{
  "question": "How much is the delivery fee?",
  "answer": "Delivery fees vary based on distance...",
  "category": "delivery",
  "display_order": 1,
  "is_active": true
}
```

2. **Review and Edit:**
```bash
# Get all delivery FAQs
GET /admin/all?category=delivery

# Update if needed
PUT /admin/faq_abc123
{
  "answer": "Updated delivery hours information..."
}
```

3. **Reorder if Needed:**
```bash
POST /admin/reorder
{
  "faq_orders": [
    { "faq_id": "faq_def456", "display_order": 0 },
    { "faq_id": "faq_abc123", "display_order": 1 }
  ]
}
```

4. **Publish:**
```bash
# Activate FAQ
PATCH /admin/faq_abc123/toggle
{
  "is_active": true
}
```

---

## Testing with cURL

**Create FAQ:**
```bash
curl -X POST http://localhost:3000/api/v1/faqs/admin \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I cancel my order?",
    "answer": "You can cancel your order within 5 minutes of placing it from the Orders section.",
    "category": "orders",
    "display_order": 0,
    "is_active": true
  }'
```

**Get All FAQs:**
```bash
curl -X GET "http://localhost:3000/api/v1/faqs/admin/all?category=orders&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update FAQ:**
```bash
curl -X PUT http://localhost:3000/api/v1/faqs/admin/faq_abc123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "Updated answer with more details..."
  }'
```

**Delete FAQ:**
```bash
curl -X DELETE http://localhost:3000/api/v1/faqs/admin/faq_abc123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Toggle Status:**
```bash
curl -X PATCH http://localhost:3000/api/v1/faqs/admin/faq_abc123/toggle \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

---

## Support

For issues or questions about the FAQ management system, contact the development team.
