# Admin Coupon Management API Documentation

## Base URL
```
http://your-api-domain.com/api/v1/coupons
```

## Authentication
All admin endpoints require authentication and admin role:
```
Authorization: Bearer <access_token>
```

**Required Roles:** `super_admin` or `outlet_admin`

---

## Overview

The coupon management system allows administrators to create, manage, and track discount coupons. Super admins can create global coupons, while outlet admins can create coupons for their assigned outlets.

---

## Admin Endpoints

### 1. Create Coupon

Create a new discount coupon.

**Endpoint:** `POST /`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "WELCOME20",
  "description": "Get 20% off on your first order",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_order_value": 299,
  "max_discount": 100,
  "usage_limit": 1000,
  "usage_per_user": 1,
  "valid_from": "2025-10-30",
  "valid_until": "2025-12-31",
  "applicable_outlets": [],
  "applicable_items": [],
  "applicable_categories": [],
  "first_order_only": true,
  "is_active": true
}
```

**Field Validations:**
- `code`: Required, 3-20 characters, uppercase, unique
- `description`: Required, max 500 characters
- `discount_type`: Required, "percentage" or "fixed"
- `discount_value`: Required, positive number
- `min_order_value`: Optional, number >= 0 (can be null)
- `max_discount`: Optional, positive number (can be null)
- `usage_limit`: Optional, integer >= 1 (can be null for unlimited)
- `usage_per_user`: Optional, integer >= 1 (default: 1)
- `valid_from`: Optional, valid date (can be null, defaults to now)
- `valid_until`: Optional, valid date (can be null for no expiry)
- `applicable_outlets`: Optional, array of outlet IDs (empty = all outlets)
- `applicable_items`: Optional, array of menu item IDs (empty = all items)
- `applicable_categories`: Optional, array of category IDs (empty = all categories)
- `first_order_only`: Optional, boolean (default: false)
- `is_active`: Optional, boolean (default: true)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "coupon_id": "coupon_abc123",
    "code": "WELCOME20",
    "discount_type": "percentage",
    "discount_value": 20,
    "valid_from": "2025-10-30T00:00:00Z",
    "valid_until": "2025-12-31T23:59:59Z"
  }
}
```

**Error Responses:**

**Coupon Code Already Exists (409):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Coupon code already exists"
  }
}
```

**Invalid Percentage (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Percentage discount cannot exceed 100%"
  }
}
```

**Outlet Admin - No Outlet Assigned (403):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No outlet assigned to you"
  }
}
```

---

### 2. Get All Coupons

Get list of all coupons with optional filtering.

**Endpoint:** `GET /`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `is_active` (optional): Filter by active status ("true" or "false")
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Example Request:**
```
GET /?is_active=true&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": "coupon_abc123",
        "code": "WELCOME20",
        "description": "Get 20% off on your first order",
        "discount_type": "percentage",
        "discount_value": 20,
        "min_order_value": 299,
        "max_discount": 100,
        "usage_limit": 1000,
        "usage_per_user": 1,
        "valid_from": "2025-10-30T00:00:00Z",
        "valid_until": "2025-12-31T23:59:59Z",
        "applicable_outlets": [],
        "applicable_items": [],
        "applicable_categories": [],
        "first_order_only": true,
        "is_active": true,
        "is_global": true,
        "total_usage": 45,
        "total_discount_given": 2250,
        "created_by": "admin_user_id",
        "created_by_role": "super_admin",
        "created_at": "2025-10-30T10:00:00Z",
        "updated_at": "2025-10-30T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 95,
      "items_per_page": 20,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

---

### 3. Get Single Coupon

Get details of a specific coupon.

**Endpoint:** `GET /:couponId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": "coupon_abc123",
      "code": "WELCOME20",
      "description": "Get 20% off on your first order",
      "discount_type": "percentage",
      "discount_value": 20,
      "min_order_value": 299,
      "max_discount": 100,
      "usage_limit": 1000,
      "usage_per_user": 1,
      "valid_from": "2025-10-30T00:00:00Z",
      "valid_until": "2025-12-31T23:59:59Z",
      "applicable_outlets": [],
      "applicable_items": [],
      "applicable_categories": [],
      "first_order_only": true,
      "is_active": true,
      "is_global": true,
      "total_usage": 45,
      "total_discount_given": 2250,
      "created_by": "admin_user_id",
      "created_by_role": "super_admin",
      "created_at": "2025-10-30T10:00:00Z",
      "updated_at": "2025-10-30T10:00:00Z"
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Coupon not found"
  }
}
```

---

### 4. Update Coupon

Update an existing coupon.

**Endpoint:** `PUT /:couponId`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "description": "Updated description",
  "discount_value": 25,
  "min_order_value": 399,
  "max_discount": 150,
  "usage_limit": 2000,
  "valid_until": "2026-01-31",
  "is_active": true
}
```

**Field Validations:**
- All fields are optional
- Same validation rules as create endpoint
- Cannot change `code` if coupon has been used

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    "coupon": {
      "id": "coupon_abc123",
      "code": "WELCOME20",
      "description": "Updated description",
      "discount_type": "percentage",
      "discount_value": 25,
      "min_order_value": 399,
      "max_discount": 150,
      "usage_limit": 2000,
      "valid_until": "2026-01-31T23:59:59Z",
      "is_active": true,
      "updated_by": "admin_user_id",
      "updated_at": "2025-10-30T15:00:00Z"
    }
  }
}
```

**Error Responses:**

**Cannot Change Used Coupon Code (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot change code of a used coupon"
  }
}
```

**Coupon Not Found (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Coupon not found"
  }
}
```

---

### 5. Delete Coupon

Soft delete a coupon (deactivates instead of permanent deletion).

**Endpoint:** `DELETE /:couponId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

**Note:** This performs a soft delete by setting `is_active: false`. The coupon data is preserved for historical records.

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Coupon not found"
  }
}
```

---

### 6. Get Coupon Statistics

Get usage statistics for a specific coupon.

**Endpoint:** `GET /:couponId/stats`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "coupon_id": "coupon_abc123",
      "code": "WELCOME20",
      "total_usage": 45,
      "total_discount_given": 2250,
      "usage_limit": 1000,
      "remaining_uses": 955,
      "orders_count": 45,
      "average_discount": 50
    }
  }
}
```

**Response Fields:**
- `total_usage`: Number of times coupon has been used
- `total_discount_given`: Total discount amount given (₹)
- `usage_limit`: Maximum usage limit (null = unlimited)
- `remaining_uses`: Remaining uses ("Unlimited" if no limit)
- `orders_count`: Number of orders using this coupon
- `average_discount`: Average discount per order (₹)

---

## Coupon Types

### 1. Percentage Discount

Gives a percentage off the order total with optional maximum cap.

**Example:**
```json
{
  "discount_type": "percentage",
  "discount_value": 20,
  "max_discount": 100
}
```

**Calculation:**
- Order ₹500 → 20% = ₹100 discount (within cap)
- Order ₹1000 → 20% = ₹200, but capped at ₹100

### 2. Fixed Discount

Gives a flat amount off the order total.

**Example:**
```json
{
  "discount_type": "fixed",
  "discount_value": 50,
  "max_discount": null
}
```

**Calculation:**
- Order ₹500 → ₹50 discount
- Order ₹1000 → ₹50 discount

---

## Coupon Restrictions

### 1. Minimum Order Value

Require minimum order amount to use coupon.

```json
{
  "min_order_value": 299
}
```

### 2. Usage Limits

**Global Usage Limit:**
```json
{
  "usage_limit": 1000
}
```
Total times coupon can be used across all users.

**Per User Limit:**
```json
{
  "usage_per_user": 3
}
```
Times each user can use the coupon.

### 3. Validity Period

**Start Date:**
```json
{
  "valid_from": "2025-10-30"
}
```

**End Date:**
```json
{
  "valid_until": "2025-12-31"
}
```

Set to `null` for no expiry.

### 4. First Order Only

```json
{
  "first_order_only": true
}
```

Coupon only valid for users who haven't placed any completed orders.

### 5. Outlet Restrictions

**All Outlets:**
```json
{
  "applicable_outlets": []
}
```

**Specific Outlets:**
```json
{
  "applicable_outlets": ["outlet_123", "outlet_456"]
}
```

### 6. Item/Category Restrictions

**All Items:**
```json
{
  "applicable_items": [],
  "applicable_categories": []
}
```

**Specific Items:**
```json
{
  "applicable_items": ["item_123", "item_456"]
}
```

**Specific Categories:**
```json
{
  "applicable_categories": ["category_789"]
}
```

---

## Role-Based Access

### Super Admin
- Can create global coupons (all outlets)
- Can create outlet-specific coupons
- Can view/edit/delete all coupons
- Full access to all features

### Outlet Admin
- Can only create coupons for their assigned outlet
- Coupons automatically restricted to their outlet
- Can view/edit/delete only their outlet's coupons
- Cannot create global coupons

---

## Common Error Responses

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "code",
        "message": "\"code\" is required"
      },
      {
        "field": "discount_value",
        "message": "\"discount_value\" must be a positive number"
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
    "message": "Coupon not found"
  }
}
```

**409 Conflict:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Coupon code already exists"
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

### 1. Coupon Code Naming

**Good Examples:**
- `WELCOME20` - Clear purpose
- `SAVE50` - Clear value
- `DIWALI2025` - Event-based
- `FIRSTORDER` - Clear condition

**Bad Examples:**
- `ABC123` - Not descriptive
- `COUPON1` - Generic
- `TEST` - Confusing

### 2. Setting Limits

**Recommended:**
```json
{
  "usage_limit": 1000,
  "usage_per_user": 1,
  "min_order_value": 299
}
```

This prevents abuse while allowing reasonable usage.

### 3. Validity Periods

**For Promotions:**
```json
{
  "valid_from": "2025-10-30",
  "valid_until": "2025-11-15"
}
```

Set clear start and end dates.

**For Ongoing Offers:**
```json
{
  "valid_from": "2025-10-30",
  "valid_until": null
}
```

No end date, but can be deactivated anytime.

### 4. Maximum Discount Cap

For percentage coupons, always set a maximum:

```json
{
  "discount_type": "percentage",
  "discount_value": 20,
  "max_discount": 100
}
```

This prevents excessive discounts on large orders.

### 5. Testing Coupons

Before activating:
1. Create with `is_active: false`
2. Test validation
3. Verify calculations
4. Then set `is_active: true`

---

## Example Workflows

### Creating a Welcome Coupon

```bash
curl -X POST http://localhost:3000/api/v1/coupons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME20",
    "description": "Get 20% off on your first order",
    "discount_type": "percentage",
    "discount_value": 20,
    "min_order_value": 299,
    "max_discount": 100,
    "usage_per_user": 1,
    "first_order_only": true,
    "is_active": true
  }'
```

### Creating a Festival Offer

```bash
curl -X POST http://localhost:3000/api/v1/coupons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "DIWALI50",
    "description": "Flat ₹50 off on orders above ₹500",
    "discount_type": "fixed",
    "discount_value": 50,
    "min_order_value": 500,
    "usage_limit": 5000,
    "usage_per_user": 3,
    "valid_from": "2025-11-01",
    "valid_until": "2025-11-15",
    "is_active": true
  }'
```

### Updating a Coupon

```bash
curl -X PUT http://localhost:3000/api/v1/coupons/coupon_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "usage_limit": 10000,
    "valid_until": "2025-12-31"
  }'
```

### Getting Coupon Statistics

```bash
curl -X GET http://localhost:3000/api/v1/coupons/coupon_abc123/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Deactivating a Coupon

```bash
curl -X PUT http://localhost:3000/api/v1/coupons/coupon_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

---

## Admin Dashboard Implementation

### Coupons List View

**Recommended Columns:**
- Code
- Description
- Type (Percentage/Fixed)
- Value
- Usage (45/1000)
- Status (Active/Inactive)
- Valid Until
- Actions (Edit/Delete/Stats)

**Filters:**
- Active/Inactive
- Discount Type
- Expiring Soon
- Most Used

### Create/Edit Form

**Required Fields:**
- Coupon Code
- Description
- Discount Type
- Discount Value

**Optional Fields:**
- Minimum Order Value
- Maximum Discount
- Usage Limit
- Usage Per User
- Valid From
- Valid Until
- Applicable Outlets
- First Order Only
- Active Status

### Statistics Dashboard

**Key Metrics:**
- Total Coupons
- Active Coupons
- Total Usage
- Total Discount Given
- Most Popular Coupons
- Expiring Soon

---

## Testing with cURL

**Create Coupon:**
```bash
curl -X POST http://localhost:3000/api/v1/coupons \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST20",
    "description": "Test coupon",
    "discount_type": "percentage",
    "discount_value": 20,
    "min_order_value": 299,
    "max_discount": 100,
    "is_active": true
  }'
```

**Get All Coupons:**
```bash
curl -X GET "http://localhost:3000/api/v1/coupons?is_active=true&page=1&limit=20" \
  -H "Authorization: Bearer TOKEN"
```

**Get Single Coupon:**
```bash
curl -X GET http://localhost:3000/api/v1/coupons/COUPON_ID \
  -H "Authorization: Bearer TOKEN"
```

**Update Coupon:**
```bash
curl -X PUT http://localhost:3000/api/v1/coupons/COUPON_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "discount_value": 25
  }'
```

**Delete Coupon:**
```bash
curl -X DELETE http://localhost:3000/api/v1/coupons/COUPON_ID \
  -H "Authorization: Bearer TOKEN"
```

**Get Statistics:**
```bash
curl -X GET http://localhost:3000/api/v1/coupons/COUPON_ID/stats \
  -H "Authorization: Bearer TOKEN"
```

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per user
- Applies to all coupon endpoints
- Authentication required for all endpoints

---

## Support

For issues or questions about the coupon management system, contact the development team.
