# Customer App API Documentation
**Rekha's Kitchen - Complete Customer API Reference**

**Base URL:** `http://localhost:3000/api`

**Authentication:** Bearer Token in Header: `Authorization: Bearer <token>`

---

## 📑 Quick Navigation
- [Authentication](#1-authentication) | [Locations](#2-location--outlets) | [Menu](#3-menu--products) | [Banners](#4-banners--promotions)
- [Carts](#5-shopping-carts) | [Orders](#6-orders) | [Reviews](#7-reviews--ratings) | [Coupons](#8-coupons--discounts)
- [Loyalty](#9-loyalty-program) | [Referral](#10-referral-program) | [Notifications](#11-notifications) | [Profile](#12-user-profile)

---

## 1. Authentication

### Register Customer
`POST /auth/register`
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "customer"
}
```

### Login
`POST /auth/login`
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!"
}
```


**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "email": "customer@example.com",
    "username": "SpicySamosa789",
    "role": "customer",
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

### Send OTP (Mobile Login)
`POST /auth/otp/send`
```json
{ "phone": "+1234567890" }
```

### Verify OTP
`POST /auth/otp/verify`
```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

### Resend OTP
`POST /auth/otp/resend`
```json
{ "phone": "+1234567890" }
```

### Refresh Token
`POST /auth/refresh-token`
```json
{ "refresh_token": "eyJhbGc..." }
```

### Logout
`POST /auth/logout` 🔒

### Get Profile
`GET /auth/profile` 🔒

---

## 2. Location & Outlets

### Get Nearby Outlets
`GET /outlets/nearby?latitude=19.0760&longitude=72.8777&radius=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "outlets": [
      {
        "id": "outlet123",
        "name": "Rekha's Kitchen - Andheri",
        "address": {
          "street": "123 Main Road",
          "city": "Mumbai",
          "state": "Maharashtra",
          "pincode": "400053"
        },
        "phone": "+919876543210",
        "distance": 2.5,
        "service_radius": 10,
        "is_serviceable": true,
        "coordinates": {
          "latitude": 19.0760,
          "longitude": 72.8777
        },
        "operating_hours": {
          "monday": "10:00-22:00",
          "tuesday": "10:00-22:00"
        },
        "rating": 4.5,
        "total_orders": 1250
      }
    ],
    "search_location": {
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "search_radius": 10,
    "total": 3
  }
}
```

### Check Serviceability
`POST /outlets/check-serviceability`

**Request (with coordinates):**
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "serviceable": true,
    "primary_outlet": {
      "outlet_id": "outlet123",
      "outlet_name": "Rekha's Kitchen - Andheri",
      "distance": 2.5,
      "estimated_time": 35,
      "address": {
        "street": "123 Main Road",
        "city": "Mumbai",
        "state": "Maharashtra"
      }
    },
    "all_outlets": [
      {
        "outlet_id": "outlet123",
        "outlet_name": "Rekha's Kitchen - Andheri",
        "distance": 2.5,
        "estimated_time": 35,
        "address": {...}
      }
    ],
    "total_outlets": 1,
    "message": "Delivery available at your location"
  }
}
```

**Note:** Delivery fees are calculated separately using the delivery API, not returned in serviceability check.

### Get Service Areas
`GET /outlets/service-areas`

**Response:**
```json
{
  "success": true,
  "data": {
    "service_areas": {
      "cities": ["Mumbai", "Navi Mumbai", "Thane"],
      "states": ["Maharashtra"],
      "outlets": [
        {
          "id": "outlet123",
          "name": "Rekha's Kitchen - Andheri",
          "city": "Mumbai",
          "state": "Maharashtra",
          "service_radius": 10,
          "coordinates": {
            "latitude": 19.0760,
            "longitude": 72.8777
          }
        }
      ]
    },
    "total_cities": 3,
    "total_outlets": 5
  }
}
```

### Get Outlet Details
`GET /outlets/public/:outletId`

**Response:**
```json
{
  "success": true,
  "data": {
    "outlet": {
      "id": "outlet123",
      "name": "Rekha's Kitchen - Andheri",
      "address": {
        "street": "123 Main Road",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400053"
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
      "average_rating": 4.5,
      "total_orders": 1250,
      "avg_preparation_time": 20,
      "is_accepting_orders": true
    }
  }
}
```

**Note:** Delivery fees are now handled by a separate delivery model, not stored in outlet configuration.

---

## 3. Menu & Products

### Get Full Menu (All Categories + Items)
`GET /menu/full?outlet_id=outlet123&include_unavailable=false`

**Query Parameters:**
- `outlet_id` (required) - Outlet ID to fetch menu for
- `include_unavailable` (optional) - Include unavailable items (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "menu": [
      {
        "id": "cat1",
        "name": "Appetizers",
        "description": "Start your meal...",
        "outlet_id": "outlet123",
        "display_order": 1,
        "items": [
          {
            "id": "item1",
            "name": "Samosa (2 pcs)",
            "price": 40,
            "description": "Crispy pastry...",
            "outlet_id": "outlet123",
            "is_vegetarian": true,
            "spice_level": "mild",
            "preparation_time": 10,
            "min_order_quantity": 2,
            "is_available": true,
            "image_url": "https://..."
          }
        ]
      }
    ],
    "outlet_id": "outlet123"
  }
}
```

**Important:** Each outlet has its own menu. Always provide `outlet_id` to get the correct menu.

### Get All Categories
`GET /menu/categories?outlet_id=outlet123&is_active=true&include_items=true`

**Query Parameters:**
- `outlet_id` (required) - Filter by outlet
- `is_active` (optional) - Filter by active status
- `include_items` (optional) - Include menu items

### Get Single Category
`GET /menu/categories/:categoryId?include_items=true`

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "cat123",
      "name": "Appetizers",
      "description": "Start your meal...",
      "outlet_id": "outlet123",
      "display_order": 1,
      "is_active": true,
      "items": [...]
    }
  }
}
```

### Get Menu Items (with Filters)
`GET /menu/items?outlet_id=outlet123&category_id=cat1&is_vegetarian=true&is_available=true&spice_level=mild`

**Query Parameters:**
- `outlet_id` (required) - Filter by outlet
- `category_id` (optional) - Filter by category
- `is_vegetarian` (optional) - Filter vegetarian items
- `is_vegan` (optional) - Filter vegan items
- `is_available` (optional) - Filter by availability
- `spice_level` (optional) - Filter by spice level (none/mild/medium/hot)

### Get Single Menu Item
`GET /menu/items/:itemId`

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item123",
      "category_id": "cat1",
      "outlet_id": "outlet123",
      "name": "Butter Chicken",
      "description": "Creamy tomato-based chicken curry",
      "price": 420,
      "is_vegetarian": false,
      "is_vegan": false,
      "spice_level": "mild",
      "preparation_time": 20,
      "min_order_quantity": 1,
      "ingredients": ["chicken", "tomato", "cream"],
      "nutritional_info": { "calories": 450 },
      "image_url": "https://...",
      "is_available": true,
      "average_rating": 4.5,
      "review_count": 120,
      "category_name": "Main Course"
    }
  }
}
```

---

## 4. Banners & Promotions

### Get All Banners
`GET /banners?outlet_id=outlet123&banner_type=offer&active_only=true`

**Query Parameters:**
- `outlet_id` (optional) - Filter by outlet (shows global + outlet-specific banners)
- `banner_type` (optional) - Filter by type: 'promotional', 'offer', 'announcement', 'seasonal'
- `active_only` (optional) - Filter by active status: 'true' or 'false' (default: fetch all)

**Response:**
```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "id": "banner123",
        "title": "20% OFF",
        "subtitle": "On all orders above ₹500",
        "description": "Limited time offer",
        "image_url": "https://res.cloudinary.com/.../banner.png",
        "banner_type": "offer",
        "action_type": "coupon",
        "action_data": {
          "coupon_code": "SAVE20"
        },
        "target_audience": "all",
        "is_global": true,
        "applicable_outlets": [],
        "display_order": 1,
        "start_date": "2024-01-01T00:00:00Z",
        "end_date": "2024-12-31T23:59:59Z",
        "is_active": true,
        "views_count": 1250,
        "clicks_count": 340
      }
    ],
    "total": 5
  }
}
```

**Banner Types:**
- `promotional` - General promotional banners
- `offer` - Special offers and discounts
- `announcement` - Important announcements
- `seasonal` - Seasonal/festival banners

**Action Types:**
- `none` - No action (informational only)
- `deep_link` - Navigate to app screen
- `menu_item` - Show specific menu item
- `category` - Show menu category
- `outlet` - Show outlet details
- `coupon` - Apply coupon code
- `external_url` - Open external URL

**Target Audience:**
- `all` - All users
- `new_users` - New customers only
- `loyal_customers` - Loyalty program members
- `location_based` - Based on user location

**Notes:**
- Banners are automatically filtered by date range (only active period shown)
- If `outlet_id` is provided, returns global banners + outlet-specific banners
- If no `outlet_id`, only global banners are returned
- Sorted by `display_order` and creation date

### Get Single Banner
`GET /banners/:bannerId`

**Response:**
```json
{
  "success": true,
  "data": {
    "banner": {
      "id": "banner123",
      "title": "20% OFF",
      "subtitle": "On all orders above ₹500",
      "description": "Limited time offer. Use code SAVE20 at checkout.",
      "image_url": "https://res.cloudinary.com/.../banner.png",
      "banner_type": "offer",
      "action_type": "coupon",
      "action_data": {
        "coupon_code": "SAVE20"
      },
      "target_audience": "all",
      "is_global": true,
      "applicable_outlets": [],
      "display_order": 1,
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-12-31T23:59:59Z",
      "is_active": true,
      "views_count": 1250,
      "clicks_count": 340,
      "created_at": "2024-01-01T00:00:00Z",
      "created_by": "admin123",
      "created_by_role": "super_admin"
    }
  }
}
```

### Track Banner View
`POST /banners/:bannerId/view`

**Description:** Track when a banner is viewed by a user (for analytics)

**Response:**
```json
{
  "success": true,
  "message": "View tracked successfully"
}
```

**Note:** Call this endpoint when the banner is displayed to the user

### Track Banner Click
`POST /banners/:bannerId/click`

**Description:** Track when a user clicks/taps on a banner (for analytics)

**Response:**
```json
{
  "success": true,
  "message": "Click tracked successfully",
  "data": {
    "action_type": "coupon",
    "action_data": {
      "coupon_code": "SAVE20"
    }
  }
}
```

**Note:** 
- Call this endpoint when user interacts with the banner
- Response includes action details to help you handle the action
- Use `action_type` and `action_data` to determine what action to take in your app

### Banner Action Handling Examples

**Coupon Action:**
```javascript
// When action_type is "coupon"
if (banner.action_type === 'coupon') {
  const couponCode = banner.action_data.coupon_code;
  // Auto-apply coupon or show coupon code to user
}
```

**Menu Item Action:**
```javascript
// When action_type is "menu_item"
if (banner.action_type === 'menu_item') {
  const itemId = banner.action_data.menu_item_id;
  // Navigate to menu item details page
}
```

**Category Action:**
```javascript
// When action_type is "category"
if (banner.action_type === 'category') {
  const categoryId = banner.action_data.category_id;
  // Navigate to category page
}
```

**External URL Action:**
```javascript
// When action_type is "external_url"
if (banner.action_type === 'external_url') {
  const url = banner.action_data.url;
  // Open URL in browser or webview
}
```

---

## 5. Shopping Carts

### Create Cart 🔒
`POST /carts`
```json
{
  "name": "Weekend Party",
  "outlet_id": "outlet123",
  "notes": "For Saturday dinner"
}
```

### Get My Carts 🔒
`GET /carts?is_active=true`

### Get Single Cart 🔒
`GET /carts/:cartId`

### Add Item to Cart 🔒
`POST /carts/:cartId/items`
```json
{
  "menu_item_id": "item123",
  "quantity": 2,
  "special_instructions": "Extra spicy"
}
```

### Update Cart Item 🔒
`PUT /carts/:cartId/items/:itemId`
```json
{
  "quantity": 3
}
```

### Remove Item from Cart 🔒
`DELETE /carts/:cartId/items/:itemId`

### Clear Cart 🔒
`POST /carts/:cartId/clear`

### Update Cart 🔒
`PUT /carts/:cartId`
```json
{
  "name": "Family Dinner"
}
```

### Duplicate Cart 🔒
`POST /carts/:cartId/duplicate`

### Delete Cart 🔒
`DELETE /carts/:cartId`

### Checkout Cart 🔒
`POST /carts/:cartId/checkout`
```json
{
  "order_type": "delivery",
  "delivery_address": {...},
  "payment_method": "card"
}
```

---

## 6. Orders

### Create Order 🔒
`POST /orders`
```json
{
  "outlet_id": "outlet123",
  "order_type": "delivery",
  "delivery_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "phone": "+1234567890"
  },
  "items": [
    {
      "menu_item_id": "item123",
      "quantity": 2,
      "special_instructions": "Extra spicy"
    }
  ],
  "payment_method": "card",
  "coupon_code": "SAVE20",
  "special_instructions": "Ring doorbell"
}
```


**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "order123",
    "order_number": "ORD-2024-001",
    "status": "pending",
    "subtotal": 840,
    "delivery_fee": 50,
    "discount": 90,
    "total": 800,
    "estimated_time": 35
  }
}
```

### Get My Orders 🔒
`GET /orders/my-orders?status=pending&page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order123",
        "order_number": "ORD-2024-001",
        "status": "delivered",
        "order_type": "delivery",
        "total": 800,
        "items": [...],
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 48
    }
  }
}
```

### Get Single Order 🔒
`GET /orders/:orderId`

### Cancel Order 🔒
`POST /orders/:orderId/cancel`
```json
{
  "reason": "Changed my mind",
  "cancellation_reason_code": "customer_request"
}
```

---

## 7. Reviews & Ratings

### Get Menu Item Reviews
`GET /reviews/menu-items/:itemId?page=1&limit=10`

### Get Outlet Reviews
`GET /reviews/outlets/:outletId?page=1&limit=10`

### Get Top Rated Items
`GET /reviews/top-rated?limit=10`

### Get Outlet Top Rated
`GET /reviews/outlets/:outletId/top-rated?limit=10`


### Create Review 🔒
`POST /reviews`
```json
{
  "order_id": "order123",
  "menu_item_id": "item123",
  "outlet_id": "outlet123",
  "rating": 5,
  "comment": "Absolutely delicious!",
  "food_quality": 5,
  "service_quality": 5,
  "delivery_speed": 4,
  "images": ["https://..."]
}
```

### Get My Reviews 🔒
`GET /reviews/my/reviews?page=1&limit=10`

### Update Review 🔒
`PUT /reviews/:reviewId`
```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

### Delete Review 🔒
`DELETE /reviews/:reviewId`

### Mark Review as Helpful 🔒
`POST /reviews/:reviewId/helpful`

### Report Review 🔒
`POST /reviews/:reviewId/report`
```json
{
  "reason": "inappropriate_content",
  "details": "Contains offensive language"
}
```

---

## 8. Coupons & Discounts

### Get Available Coupons 🔒
`GET /coupons/available?outlet_id=outlet123`

**Response:**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": "coupon123",
        "code": "SAVE20",
        "description": "Get 20% off on orders above ₹500",
        "discount_type": "percentage",
        "discount_value": 20,
        "min_order_value": 500,
        "max_discount": 100,
        "valid_from": "2024-01-01T00:00:00Z",
        "valid_until": "2024-12-31T23:59:59Z",
        "usage_limit": 100,
        "user_usage_limit": 1
      }
    ]
  }
}
```

### Validate Coupon 🔒
`POST /coupons/validate`
```json
{
  "coupon_code": "SAVE20",
  "order_value": 60.00,
  "outlet_id": "outlet123",
  "items": [
    { "menu_item_id": "item123", "quantity": 2 }
  ]
}
```


**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount": 100,
    "final_amount": 600,
    "message": "Coupon applied successfully"
  }
}
```

---

## 9. Loyalty Program

### Get Loyalty Programs
`GET /loyalty/programs` 🔒

**Response:**
```json
{
  "success": true,
  "data": {
    "programs": [
      {
        "id": "prog1",
        "name": "Milestone Rewards",
        "type": "milestone",
        "is_active": true,
        "description": "Earn rewards at milestones"
      }
    ]
  }
}
```

### Get My Loyalty Account 🔒
`GET /loyalty/account`

**Response:**
```json
{
  "success": true,
  "data": {
    "account": {
      "user_id": "user123",
      "program_id": "prog1",
      "current_milestone": 5,
      "total_orders": 15,
      "lifetime_spending": 12500,
      "tier": "silver",
      "enrolled_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Get Milestone Progress 🔒
`GET /loyalty/milestone/progress`

**Response:**
```json
{
  "success": true,
  "data": {
    "current_milestone": 5,
    "next_milestone": 10,
    "orders_to_next": 5,
    "progress_percentage": 50,
    "milestones": [
      {
        "milestone": 5,
        "reward_type": "discount",
        "reward_value": 10,
        "achieved": true
      },
      {
        "milestone": 10,
        "reward_type": "free_item",
        "reward_value": "item123",
        "achieved": false
      }
    ]
  }
}
```

### Get Available Rewards 🔒
`GET /loyalty/milestone/rewards`

### Claim Milestone Reward 🔒
`POST /loyalty/milestone/claim`
```json
{
  "reward_id": "reward123"
}
```

### Get Loyalty Transactions 🔒
`GET /loyalty/transactions?page=1&limit=20`


---

## 10. Referral Program

### Get My Referral Account 🔒
`GET /referral/account`

**Response:**
```json
{
  "success": true,
  "data": {
    "account": {
      "user_id": "user123",
      "referral_code": "JOHN2024",
      "total_referrals": 5,
      "successful_referrals": 3,
      "total_rewards_earned": 500,
      "pending_rewards": 150
    }
  }
}
```

### Get My Referral Code 🔒
`GET /referral/my-code`

**Response:**
```json
{
  "success": true,
  "data": {
    "referral_code": "JOHN2024",
    "share_url": "https://app.com/register?ref=JOHN2024",
    "share_message": "Join Rekha's Kitchen using my code JOHN2024 and get ₹50 off!"
  }
}
```

### Apply Referral Code 🔒
`POST /referral/apply`
```json
{
  "referral_code": "JOHN2024"
}
```

### Get My Referrals 🔒
`GET /referral/my-referrals?page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "referrals": [
      {
        "id": "ref123",
        "referred_user_name": "Jane Doe",
        "status": "completed",
        "reward_earned": 150,
        "created_at": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### Get My Rewards 🔒
`GET /referral/rewards?status=available`

### Claim Referral Reward 🔒
`POST /referral/claim`
```json
{
  "reward_id": "reward123"
}
```

---

## 11. Notifications

### Get My Notifications 🔒
`GET /notifications?page=1&limit=20&is_read=false`

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif123",
        "type": "order_status",
        "title": "Order Delivered",
        "message": "Your order #ORD-2024-001 has been delivered",
        "is_read": false,
        "created_at": "2024-01-15T14:30:00Z",
        "data": {
          "order_id": "order123"
        }
      }
    ]
  }
}
```


### Mark Notification as Read 🔒
`PATCH /notifications/:notificationId/read`

### Mark All as Read 🔒
`POST /notifications/mark-all-read`

### Delete Notification 🔒
`DELETE /notifications/:notificationId`

### Get Notification Preferences 🔒
`GET /notifications/preferences`

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "order_updates": true,
      "promotions": true,
      "loyalty_updates": true,
      "email_notifications": true,
      "push_notifications": true,
      "sms_notifications": false
    }
  }
}
```

### Update Notification Preferences 🔒
`PUT /notifications/preferences`
```json
{
  "order_updates": true,
  "promotions": false,
  "loyalty_updates": true,
  "email_notifications": true,
  "push_notifications": true,
  "sms_notifications": false
}
```

---

## 12. User Profile

### Update Profile 🔒
`PUT /users/profile`
```json
{
  "full_name": "John Doe",
  "phone": "+1234567890",
  "email": "newemail@example.com",
  "date_of_birth": "1990-01-15",
  "profile_image": "https://..."
}
```

### Add Address 🔒
`POST /users/addresses`
```json
{
  "type": "home",
  "street": "123 Main St, Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zip_code": "400001",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "phone": "+919876543210",
  "is_default": true
}
```

**Required Fields:**
- `street` (string) - Full street address
- `city` (string) - City name
- `state` (string) - State name
- `zip_code` (string) - Postal code
- `latitude` (number) - Latitude coordinate (-90 to 90)
- `longitude` (number) - Longitude coordinate (-180 to 180)

**Optional Fields:**
- `type` (string) - Address type: 'home', 'work', or 'other' (default: 'home')
- `phone` (string) - Contact phone number
- `is_default` (boolean) - Set as default address (default: false)

### Update Address 🔒
`PUT /users/addresses/:addressId`
```json
{
  "type": "work",
  "street": "456 Business Park",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zip_code": "400002",
  "latitude": 19.0820,
  "longitude": 72.8850,
  "phone": "+919876543210",
  "is_default": false
}
```

**Note:** All fields are optional. Only include fields you want to update.

### Delete Address 🔒
`DELETE /users/addresses/:addressId`

---

## 13. Error Handling

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
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

### Example Error Responses

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Butter Naan requires a minimum order quantity of 2. You ordered 1."
  }
}
```

**Authentication Error:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**Not Found Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Menu item not found"
  }
}
```

---

## 14. Rate Limiting

All endpoints have rate limiting:

- **Authentication endpoints:** 5 requests per 15 minutes
- **General endpoints:** 100 requests per 15 minutes
- **Menu browsing:** 200 requests per 15 minutes

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678
```

---

## 15. Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 95,
      "items_per_page": 10,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

---

## 16. Filtering & Sorting

### Menu Items Filters
- `outlet_id` (required) - Filter by outlet
- `category_id` - Filter by category
- `is_vegetarian` - true/false
- `is_vegan` - true/false
- `is_available` - true/false
- `spice_level` - none/mild/medium/hot

### Order Filters
- `status` - pending/confirmed/preparing/ready/out_for_delivery/delivered/cancelled
- `order_type` - pickup/delivery/dine_in
- `start_date` - ISO date
- `end_date` - ISO date

---

## 17. Important Notes

### Outlet-Specific Menus
- **Each outlet has its own menu** - Categories and items are outlet-specific
- **Always provide outlet_id** - Required when fetching menus, categories, or items
- **Different prices per outlet** - Same item can have different prices at different outlets
- **Independent availability** - Item availability is managed per outlet

### Minimum Order Quantity
Some items have `min_order_quantity` > 1. Orders with quantities below minimum will be rejected:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Butter Naan requires a minimum order quantity of 2. You ordered 1."
  }
}
```

### Order Status Flow
```
pending → confirmed → preparing → ready → out_for_delivery → delivered
                                    ↓
                                cancelled
```

### Delivery Fees
- Delivery fees are **not stored in outlet configuration**
- Use the **separate delivery API** to calculate delivery fees
- Fees are calculated based on distance, order value, and other factors

### Coupon Validation
- Check `min_order_value` before applying
- Respect `user_usage_limit`
- Verify `valid_from` and `valid_until` dates
- Some coupons are outlet-specific

### Loyalty Program
- Only milestone program is active
- Points program has been removed
- Rewards must be claimed before use
- Check milestone progress regularly

---

## 18. Testing

### Postman Collection
Import the API collection for easy testing:
```bash
# Available at: /docs/postman_collection.json
```

### Test Credentials
```
Email: customer@test.com
Password: Test123!
Phone: +1234567890
OTP: 123456 (development only)
```

### Sample Data
Run seed script to populate demo products:
```bash
npm run seed-products
```

---

## 19. Support

**Documentation:** See `/docs` folder  
**Issues:** Contact support@rekhaskitchen.com  
**API Version:** v1.0.0  
**Last Updated:** January 2024

---

## Quick Reference Card

```
🔐 Auth
POST   /auth/register          Register
POST   /auth/login             Login
POST   /auth/otp/send          Send OTP
POST   /auth/otp/verify        Verify OTP
POST   /auth/logout            Logout

🍽️ Menu (outlet_id required)
GET    /menu/full?outlet_id=:id              Full menu
GET    /menu/categories?outlet_id=:id        Categories
GET    /menu/items?outlet_id=:id             Menu items
GET    /menu/items/:id                       Single item

🎨 Banners
GET    /banners                Get all banners
GET    /banners/:id            Get banner details
POST   /banners/:id/view       Track view
POST   /banners/:id/click      Track click

🛒 Carts
POST   /carts                  Create cart
GET    /carts                  My carts
POST   /carts/:id/items        Add item
PUT    /carts/:id/items/:item  Update item
DELETE /carts/:id/items/:item  Remove item
POST   /carts/:id/checkout     Checkout

📦 Orders
POST   /orders                 Create order
GET    /orders/my-orders       My orders
GET    /orders/:id             Order details
POST   /orders/:id/cancel      Cancel order

⭐ Reviews
POST   /reviews                Create review
GET    /reviews/my/reviews     My reviews
GET    /reviews/menu-items/:id Item reviews
GET    /reviews/top-rated      Top rated

🎟️ Coupons
GET    /coupons/available      Available coupons
POST   /coupons/validate       Validate coupon

🎁 Loyalty
GET    /loyalty/account        My account
GET    /loyalty/milestone/progress  Progress
POST   /loyalty/milestone/claim     Claim reward

👥 Referral
GET    /referral/my-code       My code
POST   /referral/apply         Apply code
GET    /referral/my-referrals  My referrals

🔔 Notifications
GET    /notifications          My notifications
PATCH  /notifications/:id/read Mark read
PUT    /notifications/preferences Update prefs

👤 Profile
PUT    /users/profile          Update profile
POST   /users/addresses        Add address
PUT    /users/addresses/:id    Update address
```

---

**🔒 = Requires Authentication**

**End of Documentation**
