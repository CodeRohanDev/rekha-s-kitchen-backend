# Admin Dashboard API Documentation
**Rekha's Kitchen - Complete Admin Panel API Reference**

**Base URL:** `http://localhost:5050/api/v1`

**Authentication:** Bearer Token in Header: `Authorization: Bearer <token>`

---

## 📑 Quick Navigation

**Super Admin:** [Auth](#1-authentication) | [Outlets](#2-outlet-management) | [Menu](#3-menu-management) | [Orders](#4-order-management) | [Staff](#5-staff-management) | [Analytics](#6-analytics) | [Coupons](#7-coupon-management) | [Loyalty](#8-loyalty-management) | [Referral](#9-referral-management) | [Delivery](#10-delivery-management)

**Outlet Admin:** [Orders](#4-order-management) | [Menu](#3-menu-management) | [Staff](#5-staff-management) | [Reviews](#11-review-management) | [Notifications](#12-notifications)

**Kitchen Staff:** [Orders](#4-order-management) | [Menu Items](#3-menu-management)

---

## 1. Authentication

### Login (All Roles)
`POST /auth/login`

**Request:**
```json
{
  "email": "admin@rekhaskitchen.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "email": "admin@rekhaskitchen.com",
    "role": "super_admin",
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

### Get Profile
`GET /auth/profile` 🔒

### Logout
`POST /auth/logout` 🔒

### Refresh Token
`POST /auth/refresh-token`

---

## 2. Outlet Management

### Create Outlet (Super Admin Only)
`POST /outlets` 🔒

**Request:**
```json
{
  "name": "Rekha's Kitchen - Andheri",
  "address": {
    "street": "123 Main Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400053",
    "country": "India"
  },
  "phone": "+919876543210",
  "email": "andheri@rekhaskitchen.com",
  "coordinates": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "service_radius": 10,
  "operating_hours": {
    "monday": "10:00-22:00",
    "tuesday": "10:00-22:00",
    "wednesday": "10:00-22:00",
    "thursday": "10:00-22:00",
    "friday": "10:00-23:00",
    "saturday": "10:00-23:00",
    "sunday": "10:00-22:00"
  },
  "delivery_fee_config": {
    "baseDistance": 5,
    "baseFee": 0,
    "perKmFee": 10,
    "maxFee": 100
  },
  "avg_preparation_time": 20
}
```

### Get All Outlets
`GET /outlets?page=1&limit=10&is_active=true` 🔒

### Get Single Outlet
`GET /outlets/:outletId` 🔒

### Update Outlet
`PUT /outlets/:outletId` 🔒

### Delete/Deactivate Outlet
`DELETE /outlets/:outletId` 🔒 (Super Admin Only)

### Get Outlet Statistics
`GET /outlets/:outletId/stats` 🔒

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "outlet_id": "outlet123",
      "outlet_name": "Rekha's Kitchen - Andheri",
      "total_orders": 1250,
      "total_revenue": 125000,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Get Outlet Staff
`GET /outlets/:outletId/staff` 🔒

---

## 3. Menu Management

### Categories

#### Create Category
`POST /menu/categories` 🔒

**Request:**
```json
{
  "name": "Appetizers",
  "description": "Start your meal with our delicious starters",
  "display_order": 1,
  "is_active": true
}
```

#### Get All Categories
`GET /menu/categories?is_active=true&include_items=true`

#### Get Single Category
`GET /menu/categories/:categoryId`

#### Update Category
`PUT /menu/categories/:categoryId` 🔒

#### Delete Category
`DELETE /menu/categories/:categoryId` 🔒

### Menu Items

#### Create Menu Item
`POST /menu/items` 🔒

**Request:**
```json
{
  "category_id": "cat123",
  "name": "Butter Chicken",
  "description": "Creamy tomato-based chicken curry",
  "price": 420,
  "is_vegetarian": false,
  "is_vegan": false,
  "is_gluten_free": false,
  "spice_level": "mild",
  "preparation_time": 20,
  "min_order_quantity": 1,
  "ingredients": ["chicken", "tomato", "cream", "butter"],
  "nutritional_info": {
    "calories": 450,
    "protein": 25,
    "carbs": 15,
    "fat": 30
  },
  "image_url": "https://example.com/butter-chicken.jpg",
  "is_available": true,
  "outlet_specific": false,
  "outlet_ids": []
}
```

#### Get All Menu Items
`GET /menu/items?category_id=cat1&is_available=true&page=1&limit=20`

#### Get Single Menu Item
`GET /menu/items/:itemId`

#### Update Menu Item
`PUT /menu/items/:itemId` 🔒

#### Delete Menu Item
`DELETE /menu/items/:itemId` 🔒

#### Toggle Item Availability
`PATCH /menu/items/:itemId/availability` 🔒

**Request:**
```json
{
  "is_available": false
}
```

#### Get Full Menu
`GET /menu/full?outlet_id=outlet123`

---

## 4. Order Management

### Get All Orders
`GET /orders?status=pending&outlet_id=outlet123&page=1&limit=20` 🔒

**Query Parameters:**
- `status` - pending/confirmed/preparing/ready/out_for_delivery/delivered/cancelled
- `outlet_id` - Filter by outlet
- `order_type` - pickup/delivery/dine_in
- `start_date` - ISO date
- `end_date` - ISO date
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order123",
        "order_number": "ORD-2024-001",
        "customer": {
          "id": "user123",
          "name": "John Doe",
          "phone": "+919876543210"
        },
        "outlet_id": "outlet123",
        "status": "pending",
        "order_type": "delivery",
        "items": [...],
        "subtotal": 840,
        "delivery_fee": 50,
        "discount": 90,
        "total": 800,
        "payment_method": "card",
        "payment_status": "paid",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 95
    }
  }
}
```

### Get Single Order
`GET /orders/:orderId` 🔒

### Update Order Status
`PATCH /orders/:orderId/status` 🔒

**Request:**
```json
{
  "status": "confirmed",
  "notes": "Order confirmed, preparing food"
}
```

**Status Flow:**
```
pending → confirmed → preparing → ready → out_for_delivery → delivered
                                    ↓
                                cancelled
```

### Cancel Order
`POST /orders/:orderId/cancel` 🔒

**Request:**
```json
{
  "reason": "Customer requested cancellation",
  "cancellation_reason_code": "customer_request"
}
```

### Assign Delivery Person
`POST /orders/:orderId/assign-delivery` 🔒

**Request:**
```json
{
  "delivery_boy_id": "user456"
}
```

### Get Order Statistics
`GET /orders/stats?outlet_id=outlet123&start_date=2024-01-01&end_date=2024-01-31` 🔒

**Response:**
```json
{
  "success": true,
  "data": {
    "total_orders": 1250,
    "total_revenue": 125000,
    "average_order_value": 800,
    "orders_by_status": {
      "pending": 5,
      "confirmed": 10,
      "preparing": 8,
      "delivered": 1200,
      "cancelled": 27
    },
    "orders_by_type": {
      "delivery": 800,
      "pickup": 350,
      "dine_in": 100
    }
  }
}
```

---

## 5. Staff Management

### Create Staff Member
`POST /auth/staff` 🔒

**Request:**
```json
{
  "email": "staff@rekhaskitchen.com",
  "password": "SecurePass123!",
  "phone": "+919876543210",
  "first_name": "Raj",
  "last_name": "Kumar",
  "role": "kitchen_staff",
  "outlet_id": "outlet123",
  "shift_hours": {
    "start": "10:00",
    "end": "18:00"
  }
}
```

**Roles:**
- `outlet_admin` - Outlet manager
- `kitchen_staff` - Kitchen staff
- `delivery_boy` - Delivery person

### Get All Staff
`GET /users/staff?page=1&limit=20` 🔒

### Update Staff
`PUT /users/staff/:staffId` 🔒

### Deactivate Staff
`DELETE /users/staff/:staffId` 🔒

---

## 6. Analytics

### Get Dashboard Analytics
`GET /analytics/dashboard?outlet_id=outlet123&period=today` 🔒

**Query Parameters:**
- `period` - today/week/month/year/custom
- `start_date` - For custom period
- `end_date` - For custom period
- `outlet_id` - Filter by outlet

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_orders": 45,
      "total_revenue": 38500,
      "average_order_value": 856,
      "total_customers": 38
    },
    "orders_by_status": {
      "pending": 3,
      "confirmed": 5,
      "preparing": 7,
      "ready": 2,
      "out_for_delivery": 8,
      "delivered": 18,
      "cancelled": 2
    },
    "revenue_trend": [
      { "date": "2024-01-15", "revenue": 12500, "orders": 15 },
      { "date": "2024-01-16", "revenue": 15000, "orders": 18 }
    ],
    "top_selling_items": [
      {
        "item_id": "item123",
        "name": "Butter Chicken",
        "orders": 25,
        "revenue": 10500
      }
    ]
  }
}
```

### Get Revenue Analytics
`GET /analytics/revenue?outlet_id=outlet123&start_date=2024-01-01&end_date=2024-01-31` 🔒

### Get Customer Analytics
`GET /analytics/customers?outlet_id=outlet123` 🔒

### Get Menu Performance
`GET /analytics/menu-performance?outlet_id=outlet123` 🔒

---

## 7. Coupon Management

### Create Coupon
`POST /coupons` 🔒

**Request:**
```json
{
  "code": "SAVE20",
  "description": "Get 20% off on orders above ₹500",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_order_value": 500,
  "max_discount": 100,
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": "2024-12-31T23:59:59Z",
  "usage_limit": 1000,
  "user_usage_limit": 1,
  "applicable_outlets": ["outlet123"],
  "applicable_categories": [],
  "applicable_items": [],
  "is_active": true
}
```

**Discount Types:**
- `percentage` - Percentage discount
- `fixed` - Fixed amount discount
- `free_delivery` - Free delivery

### Get All Coupons
`GET /coupons?page=1&limit=20&is_active=true` 🔒

### Get Single Coupon
`GET /coupons/:couponId` 🔒

### Update Coupon
`PUT /coupons/:couponId` 🔒

### Delete Coupon
`DELETE /coupons/:couponId` 🔒

### Get Coupon Statistics
`GET /coupons/:couponId/stats` 🔒

**Response:**
```json
{
  "success": true,
  "data": {
    "coupon_id": "coupon123",
    "code": "SAVE20",
    "total_usage": 245,
    "total_discount_given": 24500,
    "total_revenue_generated": 122500,
    "unique_users": 245
  }
}
```

---

## 8. Loyalty Management

### Get Loyalty Programs
`GET /loyalty/programs` 🔒

### Configure Loyalty Program
`POST /loyalty/programs/configure` 🔒 (Super Admin Only)

**Request:**
```json
{
  "program_type": "milestone",
  "name": "Milestone Rewards",
  "description": "Earn rewards at order milestones",
  "is_active": true,
  "milestones": [
    {
      "milestone": 5,
      "reward_type": "discount",
      "reward_value": 50,
      "reward_description": "₹50 off on next order"
    },
    {
      "milestone": 10,
      "reward_type": "free_item",
      "reward_value": "item123",
      "reward_description": "Free Gulab Jamun"
    }
  ]
}
```

### Toggle Program
`PATCH /loyalty/programs/:programId/toggle` 🔒

### Get All User Accounts
`GET /loyalty/admin/accounts?page=1&limit=20` 🔒

### Get User Account
`GET /loyalty/admin/accounts/:userId` 🔒

### Manage User Account
`POST /loyalty/admin/accounts/:userId/manage` 🔒

**Request:**
```json
{
  "action": "reset",
  "reason": "Customer request"
}
```

**Actions:**
- `reset` - Reset account
- `freeze` - Freeze account
- `unfreeze` - Unfreeze account

### Get Loyalty Analytics
`GET /loyalty/admin/analytics` 🔒

---

## 9. Referral Management

### Get Referral Program
`GET /referral/program` 🔒

### Configure Referral Program
`POST /referral/program/configure` 🔒 (Super Admin Only)

**Request:**
```json
{
  "is_active": true,
  "referrer_reward": {
    "type": "discount",
    "value": 100,
    "description": "₹100 off on next order"
  },
  "referee_reward": {
    "type": "discount",
    "value": 50,
    "description": "₹50 off on first order"
  },
  "min_order_value": 300,
  "max_referrals_per_user": 50
}
```

### Get All Accounts
`GET /referral/admin/accounts?page=1&limit=20` 🔒

### Get Referral Analytics
`GET /referral/admin/analytics` 🔒

---

## 10. Delivery Management

### Get Delivery Fee Config
`GET /delivery/fee-config` 🔒

### Update Delivery Fee Config
`PUT /delivery/fee-config` 🔒

**Request:**
```json
{
  "base_distance": 5,
  "base_fee": 0,
  "per_km_fee": 10,
  "max_fee": 100,
  "free_delivery_threshold": 500
}
```

### Get Delivery Payout Config
`GET /delivery/payout-config` 🔒

### Update Delivery Payout Config
`PUT /delivery/payout-config` 🔒

---

## 11. Review Management

### Get All Reviews
`GET /reviews?outlet_id=outlet123&page=1&limit=20`

### Get Single Review
`GET /reviews/:reviewId`

### Respond to Review
`POST /reviews/:reviewId/respond` 🔒

**Request:**
```json
{
  "response": "Thank you for your feedback! We're glad you enjoyed your meal."
}
```

### Delete Review
`DELETE /reviews/:reviewId` 🔒

### Get Review Statistics
`GET /reviews/stats/summary?outlet_id=outlet123`

---

## 12. Notifications

### Send Notification
`POST /notifications/send` 🔒

**Request:**
```json
{
  "user_id": "user123",
  "type": "order_status",
  "title": "Order Delivered",
  "message": "Your order #ORD-2024-001 has been delivered",
  "data": {
    "order_id": "order123"
  }
}
```

### Send Bulk Notifications
`POST /notifications/send-bulk` 🔒 (Super Admin Only)

**Request:**
```json
{
  "user_ids": ["user123", "user456"],
  "type": "promotional",
  "title": "Special Offer",
  "message": "Get 20% off on your next order!",
  "data": {
    "coupon_code": "SAVE20"
  }
}
```

### Get Notification Statistics
`GET /notifications/stats` 🔒

---

## 13. User Management

### Get All Customers
`GET /users?role=customer&page=1&limit=20` 🔒

### Get Customer Details
`GET /users/:userId` 🔒

### Get Customer Orders
`GET /orders?customer_id=user123` 🔒

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Role-Based Access Control

### Super Admin
- Full access to all endpoints
- Can create/manage outlets
- Can create outlet admins
- Can configure system-wide settings
- Can view all analytics

### Outlet Admin
- Manage assigned outlet(s)
- Manage outlet staff
- View outlet orders and analytics
- Manage outlet menu
- Cannot create other outlet admins

### Kitchen Staff
- View orders for assigned outlet
- Update order status (preparing, ready)
- Toggle menu item availability
- Cannot access analytics or settings

### Delivery Boy
- View assigned deliveries
- Update delivery status
- Cannot access other features

---

## Rate Limiting

- **Authentication endpoints:** 5 requests per 15 minutes
- **General endpoints:** 100 requests per 15 minutes
- **Analytics endpoints:** 50 requests per 15 minutes

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 95,
    "items_per_page": 10,
    "has_next": true,
    "has_previous": false
  }
}
```

---

## Quick Reference

```
🔐 Authentication
POST   /auth/login             Login
POST   /auth/logout            Logout
GET    /auth/profile           Get profile

🏪 Outlets
POST   /outlets                Create outlet
GET    /outlets                List outlets
GET    /outlets/:id            Get outlet
PUT    /outlets/:id            Update outlet
DELETE /outlets/:id            Delete outlet
GET    /outlets/:id/stats      Outlet stats

🍽️ Menu
POST   /menu/categories        Create category
GET    /menu/categories        List categories
PUT    /menu/categories/:id    Update category
DELETE /menu/categories/:id    Delete category
POST   /menu/items             Create item
GET    /menu/items             List items
PUT    /menu/items/:id         Update item
DELETE /menu/items/:id         Delete item
PATCH  /menu/items/:id/availability  Toggle availability

📦 Orders
GET    /orders                 List orders
GET    /orders/:id             Get order
PATCH  /orders/:id/status      Update status
POST   /orders/:id/cancel      Cancel order
POST   /orders/:id/assign-delivery  Assign delivery
GET    /orders/stats           Order stats

👥 Staff
POST   /auth/staff             Create staff
GET    /users/staff            List staff
PUT    /users/staff/:id        Update staff
DELETE /users/staff/:id        Deactivate staff

📊 Analytics
GET    /analytics/dashboard    Dashboard stats
GET    /analytics/revenue      Revenue analytics
GET    /analytics/customers    Customer analytics
GET    /analytics/menu-performance  Menu performance

🎟️ Coupons
POST   /coupons                Create coupon
GET    /coupons                List coupons
PUT    /coupons/:id            Update coupon
DELETE /coupons/:id            Delete coupon
GET    /coupons/:id/stats      Coupon stats

⭐ Reviews
GET    /reviews                List reviews
POST   /reviews/:id/respond    Respond to review
DELETE /reviews/:id            Delete review

🔔 Notifications
POST   /notifications/send     Send notification
POST   /notifications/send-bulk  Send bulk
GET    /notifications/stats    Notification stats
```

---

**🔒 = Requires Authentication**

**End of Documentation**
