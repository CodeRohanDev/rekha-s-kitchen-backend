# Delivery Management API Documentation for Admin & Manager Dashboard

Complete API reference for building admin and manager dashboards with delivery management features.

## Base URL
```
https://localhost:5050/api/v1
```

## Authentication
All endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Role-Based Access
- **super_admin**: Full access to all endpoints
- **outlet_admin**: Access to outlet-specific delivery management
- **kitchen_staff**: Limited access to order status updates
- **delivery_boy**: Access to assigned deliveries only

---

## Table of Contents
1. [Order Management](#order-management)
2. [Delivery Assignment](#delivery-assignment)
3. [Delivery Fee Configuration](#delivery-fee-configuration)
4. [Delivery Partner Payout](#delivery-partner-payout)
5. [Payout Schedules](#payout-schedules)
6. [Delivery Personnel Management](#delivery-personnel-management)
7. [Analytics & Reports](#analytics--reports)
8. [Real-time Tracking](#real-time-tracking)

---

## Order Management

### 1. Get All Orders
Retrieve orders with filtering options for dashboard display.

**Endpoint:** `GET /api/v1/orders`

**Access:** super_admin, outlet_admin, kitchen_staff, delivery_boy

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by order status |
| outlet_id | string | Filter by outlet |
| order_type | string | "delivery" or "pickup" |
| date_from | string | Start date (ISO format) |
| date_to | string | End date (ISO format) |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

**Example Request:**
```
GET /api/v1/orders?status=out_for_delivery&order_type=delivery&page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_123",
        "order_number": "ORD-1730000000-ABC123",
        "customer_id": "user_456",
        "customer_name": "John Doe",
        "outlet_id": "outlet_789",
        "outlet_name": "Downtown Branch",
        "order_type": "delivery",
        "status": "out_for_delivery",
        "payment_status": "pending",
        "payment_method": "card",
        "delivery_address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zip_code": "10001",
          "coordinates": {
            "latitude": 40.7128,
            "longitude": -74.0060
          }
        },
        "items": [...],
        "subtotal": 450.00,
        "delivery_fee": 50.00,
        "tax": 36.00,
        "discount": 0,
        "total": 536.00,
        "assigned_to": "delivery_user_001",
        "estimated_delivery_time": 45,
        "created_at": "2025-10-27T10:30:00Z",
        "updated_at": "2025-10-27T10:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

**Order Status Values:**
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed by outlet
- `preparing` - Being prepared in kitchen
- `ready` - Ready for pickup/delivery
- `out_for_delivery` - Delivery partner on the way
- `delivered` - Successfully delivered
- `completed` - Order completed
- `cancelled` - Order cancelled

---

### 2. Get Single Order Details
Retrieve complete details of a specific order.

**Endpoint:** `GET /api/v1/orders/:orderId`

**Access:** All authenticated users (with ownership validation)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_123",
      "order_number": "ORD-1730000000-ABC123",
      "status": "out_for_delivery",
      "items": [
        {
          "menu_item_id": "item_001",
          "name": "Margherita Pizza",
          "price": 12.99,
          "quantity": 2,
          "special_instructions": "Extra cheese",
          "subtotal": 25.98
        }
      ],
      "outlet_details": {
        "id": "outlet_789",
        "name": "Downtown Branch",
        "address": "456 Market St",
        "phone": "+1234567890"
      },
      "customer_details": {
        "id": "user_456",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1987654321"
      },
      "delivery_partner": {
        "id": "delivery_user_001",
        "name": "Mike Wilson",
        "phone": "+1555666777",
        "vehicle_type": "bike"
      },
      ...
    }
  }
}
```

---

### 3. Update Order Status
Update the status of an order (for kitchen staff and delivery partners).

**Endpoint:** `PATCH /api/v1/orders/:orderId/status`

**Access:** super_admin, outlet_admin, kitchen_staff, delivery_boy

**Request Body:**
```json
{
  "status": "preparing",
  "notes": "Started preparing order"
}
```

**Valid Status Transitions:**
```
pending → confirmed → preparing → ready → out_for_delivery → delivered
         ↓           ↓          ↓        ↓                  ↓
      cancelled   cancelled  cancelled cancelled        cancelled
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "order_id": "order_123",
    "status": "preparing"
  }
}
```

---

### 4. Get Order Statistics
Get aggregated order statistics for dashboard.

**Endpoint:** `GET /api/v1/orders/stats`

**Access:** super_admin, outlet_admin

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| outlet_id | string | Filter by outlet |
| date_from | string | Start date |
| date_to | string | End date |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_orders": 1250,
      "pending": 15,
      "confirmed": 8,
      "preparing": 12,
      "ready": 5,
      "out_for_delivery": 20,
      "delivered": 1150,
      "completed": 1150,
      "cancelled": 40,
      "total_revenue": 125000.00,
      "average_order_value": 100.00
    }
  }
}
```

---

## Delivery Assignment

### 5. Assign Delivery Partner
Assign a delivery partner to an order.

**Endpoint:** `POST /api/v1/orders/:orderId/assign-delivery`

**Access:** super_admin, outlet_admin

**Request Body:**
```json
{
  "delivery_person_id": "delivery_user_001"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Delivery person assigned successfully"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR` - Not a delivery order or invalid delivery person
- `404 NOT_FOUND` - Order or delivery person not found

---

### 6. Get Available Delivery Partners
Get list of available delivery partners for assignment.

**Endpoint:** `GET /api/v1/users/staff?role=delivery_boy&status=available`

**Access:** super_admin, outlet_admin

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "id": "delivery_user_001",
        "email": "mike@example.com",
        "phone": "+1555666777",
        "role": "delivery_boy",
        "profile": {
          "first_name": "Mike",
          "last_name": "Wilson",
          "vehicle_type": "bike",
          "vehicle_number": "ABC123"
        },
        "is_active": true,
        "current_orders": 2,
        "availability_status": "available"
      }
    ]
  }
}
```

---

## Delivery Fee Configuration

### 7. Get Active Fee Structure (Public)
Get current delivery fee structure for customers.

**Endpoint:** `GET /api/v1/delivery/fee-structure`

**Access:** Public (no authentication required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "config": {
      "id": "config_001",
      "name": "Standard Delivery Fees",
      "description": "Default delivery fee structure",
      "is_active": true,
      "tiers": [
        {
          "tier_name": "Short Distance",
          "distance_min": 0,
          "distance_max": 5,
          "brackets": [
            {
              "order_min": 0,
              "order_max": 500,
              "base_fee": 50,
              "per_km_fee": 0,
              "discount_percent": 0
            },
            {
              "order_min": 500,
              "order_max": null,
              "base_fee": 0,
              "per_km_fee": 0,
              "discount_percent": 0
            }
          ]
        },
        {
          "tier_name": "Medium Distance",
          "distance_min": 5,
          "distance_max": 10,
          "brackets": [
            {
              "order_min": 0,
              "order_max": 500,
              "base_fee": 50,
              "per_km_fee": 10,
              "discount_percent": 0
            },
            {
              "order_min": 500,
              "order_max": null,
              "base_fee": 30,
              "per_km_fee": 5,
              "discount_percent": 0
            }
          ]
        }
      ]
    }
  }
}
```

---

### 8. Calculate Delivery Fee
Calculate delivery fee for a specific order.

**Endpoint:** `POST /api/v1/delivery/calculate-fee`

**Access:** Public (no authentication required)

**Request Body:**
```json
{
  "order_value": 450,
  "distance_km": 7.5,
  "outlet_id": "outlet_789"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "order_value": 450,
    "distance_km": 7.5,
    "delivery_fee": 75.00,
    "breakdown": {
      "tier": "Medium Distance",
      "base_fee": 50,
      "distance_fee": 25,
      "discount": 0,
      "calculation": "₹50 + (7.5 - 5) × ₹10 = ₹75.00"
    },
    "free_delivery_at": 500
  }
}
```

---

### 9. Get Fee Configurations (Admin)
Get all delivery fee configurations.

**Endpoint:** `GET /api/v1/delivery/admin/fee-config`

**Access:** super_admin only

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "configs": [
      {
        "id": "config_001",
        "name": "Standard Delivery Fees",
        "description": "Default delivery fee structure",
        "is_active": true,
        "tiers": [...],
        "created_by": "admin_user_001",
        "created_at": "2025-10-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 10. Update Fee Configuration (Admin)
Create or update delivery fee configuration.

**Endpoint:** `POST /api/v1/delivery/admin/fee-config`

**Access:** super_admin only

**Request Body:**
```json
{
  "name": "Premium Delivery Fees",
  "description": "Updated fee structure for 2025",
  "is_active": true,
  "tiers": [
    {
      "tier_name": "Short Distance",
      "distance_min": 0,
      "distance_max": 5,
      "brackets": [
        {
          "order_min": 0,
          "order_max": 500,
          "base_fee": 50,
          "per_km_fee": 0,
          "discount_percent": 0
        },
        {
          "order_min": 500,
          "order_max": null,
          "base_fee": 0,
          "per_km_fee": 0,
          "discount_percent": 0
        }
      ]
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Delivery fee configuration updated successfully",
  "data": {
    "config": {
      "id": "config_002",
      "name": "Premium Delivery Fees",
      ...
    }
  }
}
```

**Important Notes:**
- Setting `is_active: true` automatically deactivates all other configurations
- Only one configuration can be active at a time
- Changes take effect immediately for new orders

---

## Delivery Partner Payout

### 11. Get Payout Configurations
Get delivery partner payout configurations.

**Endpoint:** `GET /api/v1/delivery/admin/payout-config`

**Access:** super_admin only

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "configs": [
      {
        "id": "payout_config_001",
        "name": "Standard Partner Payout",
        "description": "Default payout structure for delivery partners",
        "is_active": true,
        "tiers": [
          {
            "tier_name": "Short Distance",
            "distance_min": 0,
            "distance_max": 5,
            "base_payout": 30,
            "per_km_payout": 0
          },
          {
            "tier_name": "Medium Distance",
            "distance_min": 5,
            "distance_max": 10,
            "base_payout": 30,
            "per_km_payout": 8
          },
          {
            "tier_name": "Long Distance",
            "distance_min": 10,
            "distance_max": 20,
            "base_payout": 50,
            "per_km_payout": 10
          }
        ]
      }
    ]
  }
}
```

---

### 12. Update Payout Configuration
Create or update delivery partner payout configuration.

**Endpoint:** `POST /api/v1/delivery/admin/payout-config`

**Access:** super_admin only

**Request Body:**
```json
{
  "name": "Updated Partner Payout 2025",
  "description": "Revised payout structure",
  "is_active": true,
  "tiers": [
    {
      "tier_name": "Short Distance",
      "distance_min": 0,
      "distance_max": 5,
      "base_payout": 35,
      "per_km_payout": 0
    },
    {
      "tier_name": "Medium Distance",
      "distance_min": 5,
      "distance_max": 10,
      "base_payout": 35,
      "per_km_payout": 10
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Delivery payout configuration updated successfully",
  "data": {
    "config": {
      "id": "payout_config_002",
      ...
    }
  }
}
```

**Payout Calculation Example:**
```
Distance: 7.5 km
Tier: Medium Distance (5-10 km)
Base Payout: ₹35
Per KM Payout: ₹10
Extra Distance: 7.5 - 5 = 2.5 km
Total Payout: ₹35 + (2.5 × ₹10) = ₹60
```

---

## Payout Schedules

### 13. Get Global Payout Schedule
Get the global payout schedule that applies to all delivery partners.

**Endpoint:** `GET /api/v1/delivery/admin/payout-schedule/global`

**Access:** super_admin only

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "id": "schedule_global_001",
      "schedule_type": "weekly",
      "day_of_week": 5,
      "day_of_month": null,
      "custom_days": null,
      "time": "18:00",
      "is_active": true,
      "applies_to": "all",
      "created_by": "admin_user_001",
      "created_at": "2025-10-01T00:00:00Z"
    }
  }
}
```

**Schedule Types:**
- `daily` - Payout every day at specified time
- `weekly` - Payout on specific day of week (0=Sunday, 6=Saturday)
- `monthly` - Payout on specific day of month (1-31)
- `custom` - Payout on custom days (array of dates)

---

### 14. Update Global Payout Schedule
Set or update the global payout schedule.

**Endpoint:** `POST /api/v1/delivery/admin/payout-schedule/global`

**Access:** super_admin only

**Request Body (Weekly Schedule):**
```json
{
  "schedule_type": "weekly",
  "day_of_week": 5,
  "time": "18:00",
  "is_active": true
}
```

**Request Body (Monthly Schedule):**
```json
{
  "schedule_type": "monthly",
  "day_of_month": 1,
  "time": "09:00",
  "is_active": true
}
```

**Request Body (Daily Schedule):**
```json
{
  "schedule_type": "daily",
  "time": "23:59",
  "is_active": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Global payout schedule updated successfully",
  "data": {
    "schedule": {
      "id": "schedule_global_002",
      "schedule_type": "weekly",
      "day_of_week": 5,
      "time": "18:00",
      ...
    }
  }
}
```

---

### 15. Get Individual Payout Schedules
Get custom payout schedules for specific delivery partners.

**Endpoint:** `GET /api/v1/delivery/admin/payout-schedule/individual`

**Access:** super_admin only

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": "schedule_ind_001",
        "user_id": "delivery_user_001",
        "schedule_type": "monthly",
        "day_of_month": 15,
        "time": "12:00",
        "is_active": true,
        "applies_to": "individual",
        "overrides_global": true,
        "user_info": {
          "id": "delivery_user_001",
          "name": "Mike Wilson",
          "email": "mike@example.com",
          "phone": "+1555666777"
        },
        "created_at": "2025-10-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    }
  }
}
```

---

### 16. Set Individual Payout Schedule
Create custom payout schedule for a specific delivery partner.

**Endpoint:** `POST /api/v1/delivery/admin/payout-schedule/individual`

**Access:** super_admin only

**Request Body:**
```json
{
  "user_id": "delivery_user_001",
  "schedule_type": "monthly",
  "day_of_month": 15,
  "time": "12:00",
  "overrides_global": true,
  "is_active": true
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string | Yes | Delivery partner user ID |
| schedule_type | string | Yes | "daily", "weekly", "monthly", "custom" |
| day_of_week | number | Conditional | Required if weekly (0-6) |
| day_of_month | number | Conditional | Required if monthly (1-31) |
| custom_days | array | Conditional | Required if custom |
| time | string | Yes | Time in HH:MM format |
| overrides_global | boolean | Yes | Whether to override global schedule |
| is_active | boolean | Yes | Schedule active status |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Individual payout schedule set successfully",
  "data": {
    "schedule": {
      "id": "schedule_ind_002",
      "user_id": "delivery_user_001",
      ...
    }
  }
}
```

**Error Responses:**
- `404 NOT_FOUND` - User not found
- `400 VALIDATION_ERROR` - User is not a delivery partner

---

### 17. Delete Individual Payout Schedule
Remove custom schedule for a delivery partner (they will follow global schedule).

**Endpoint:** `DELETE /api/v1/delivery/admin/payout-schedule/individual/:scheduleId`

**Access:** super_admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Individual schedule deleted. User will follow global schedule."
}
```

---

## Delivery Personnel Management

### 18. Get Delivery Staff
Get list of all delivery partners with filtering.

**Endpoint:** `GET /api/v1/users/staff?role=delivery_boy`

**Access:** super_admin, outlet_admin

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| role | string | Filter by role (use "delivery_boy") |
| status | string | "active", "inactive", "available", "busy" |
| outlet_id | string | Filter by assigned outlet |
| page | number | Page number |
| limit | number | Items per page |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "id": "delivery_user_001",
        "email": "mike@example.com",
        "phone": "+1555666777",
        "role": "delivery_boy",
        "profile": {
          "first_name": "Mike",
          "last_name": "Wilson",
          "date_of_birth": "1995-05-15",
          "vehicle_type": "bike",
          "vehicle_number": "ABC123",
          "license_number": "DL123456",
          "profile_image": "https://..."
        },
        "is_active": true,
        "is_verified": true,
        "current_orders": 2,
        "total_deliveries": 450,
        "rating": 4.8,
        "availability_status": "busy",
        "created_at": "2025-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25
    }
  }
}
```

---

### 19. Update Delivery Staff
Update delivery partner information or status.

**Endpoint:** `PUT /api/v1/users/staff/:staffId`

**Access:** super_admin, outlet_admin

**Request Body:**
```json
{
  "is_active": true,
  "is_verified": true,
  "profile": {
    "vehicle_type": "scooter",
    "vehicle_number": "XYZ789"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Staff updated successfully",
  "data": {
    "staff": {
      "id": "delivery_user_001",
      ...
    }
  }
}
```

---

### 20. Deactivate Delivery Staff
Deactivate a delivery partner account.

**Endpoint:** `DELETE /api/v1/users/staff/:staffId`

**Access:** super_admin, outlet_admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "Staff deactivated successfully"
}
```

---

## Analytics & Reports

### 21. Delivery Performance Metrics
Get delivery performance analytics for dashboard.

**Endpoint:** `GET /api/v1/analytics/delivery-performance`

**Access:** super_admin, outlet_admin

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| date_from | string | Start date (ISO format) |
| date_to | string | End date (ISO format) |
| outlet_id | string | Filter by outlet |
| delivery_person_id | string | Filter by delivery partner |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_deliveries": 1250,
      "successful_deliveries": 1200,
      "cancelled_deliveries": 50,
      "success_rate": 96.0,
      "average_delivery_time": 35,
      "on_time_deliveries": 1100,
      "on_time_percentage": 91.67,
      "total_distance_km": 5000,
      "total_delivery_fees": 62500.00,
      "total_partner_payouts": 45000.00,
      "average_rating": 4.7
    },
    "top_performers": [
      {
        "delivery_person_id": "delivery_user_001",
        "name": "Mike Wilson",
        "total_deliveries": 150,
        "success_rate": 98.5,
        "average_rating": 4.9,
        "total_earnings": 7500.00
      }
    ],
    "daily_breakdown": [
      {
        "date": "2025-10-27",
        "deliveries": 45,
        "revenue": 2250.00,
        "payouts": 1620.00
      }
    ]
  }
}
```

---

### 22. Partner Earnings Report
Get earnings report for delivery partners.

**Endpoint:** `GET /api/v1/analytics/partner-earnings`

**Access:** super_admin

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| date_from | string | Start date |
| date_to | string | End date |
| delivery_person_id | string | Specific partner (optional) |
| status | string | "pending", "paid", "all" |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "earnings": [
      {
        "delivery_person_id": "delivery_user_001",
        "name": "Mike Wilson",
        "total_deliveries": 150,
        "total_distance_km": 600,
        "total_earnings": 7500.00,
        "paid_amount": 6000.00,
        "pending_amount": 1500.00,
        "last_payout_date": "2025-10-20T00:00:00Z",
        "next_payout_date": "2025-10-27T18:00:00Z"
      }
    ],
    "summary": {
      "total_partners": 25,
      "total_earnings": 187500.00,
      "total_paid": 150000.00,
      "total_pending": 37500.00
    }
  }
}
```

---

## Real-time Tracking

### 23. Get Active Deliveries
Get all currently active deliveries for real-time tracking.

**Endpoint:** `GET /api/v1/orders?status=out_for_delivery`

**Access:** super_admin, outlet_admin

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_123",
        "order_number": "ORD-1730000000-ABC123",
        "customer_name": "John Doe",
        "delivery_address": {
          "street": "123 Main St",
          "coordinates": {
            "latitude": 40.7128,
            "longitude": -74.0060
          }
        },
        "delivery_partner": {
          "id": "delivery_user_001",
          "name": "Mike Wilson",
          "phone": "+1555666777",
          "current_location": {
            "latitude": 40.7100,
            "longitude": -74.0050
          }
        },
        "estimated_delivery_time": 45,
        "time_elapsed": 15,
        "status": "out_for_delivery"
      }
    ]
  }
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Data Models

### Order Object
```typescript
interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  outlet_id: string;
  order_type: 'delivery' | 'pickup';
  status: OrderStatus;
  payment_status: 'pending' | 'completed' | 'refunded';
  payment_method: string;
  delivery_address?: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  tax: number;
  discount: number;
  total: number;
  assigned_to?: string;
  estimated_delivery_time: number;
  created_at: string;
  updated_at: string;
}
```

### Delivery Fee Config
```typescript
interface DeliveryFeeConfig {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  tiers: FeeTier[];
  created_by: string;
  created_at: string;
}

interface FeeTier {
  tier_name: string;
  distance_min: number;
  distance_max: number;
  brackets: FeeBracket[];
}

interface FeeBracket {
  order_min: number;
  order_max: number | null;
  base_fee: number;
  per_km_fee: number;
  discount_percent: number;
}
```

### Payout Schedule
```typescript
interface PayoutSchedule {
  id: string;
  user_id?: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  day_of_week?: number;
  day_of_month?: number;
  custom_days?: string[];
  time: string;
  is_active: boolean;
  applies_to: 'all' | 'individual';
  overrides_global?: boolean;
  created_by: string;
  created_at: string;
}
```

---

## Dashboard Implementation Examples

### React Admin Dashboard - Order Management

```javascript
import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Select, DatePicker } from 'antd';

const OrderManagementDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    order_type: 'delivery',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(
        `https://localhost:5050/api/v1/orders?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();
      if (result.success) {
        setOrders(result.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(
        `https://localhost:5050/api/v1/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      const result = await response.json();
      if (result.success) {
        message.success('Order status updated');
        fetchOrders();
      }
    } catch (error) {
      message.error('Failed to update order status');
    }
  };

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          confirmed: 'blue',
          preparing: 'cyan',
          ready: 'green',
          out_for_delivery: 'purple',
          delivered: 'success',
          cancelled: 'red'
        };
        return <Badge status={colors[status]} text={status} />;
      }
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `₹${total.toFixed(2)}`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(value) => updateOrderStatus(record.id, value)}
          style={{ width: 150 }}
        >
          <Select.Option value="confirmed">Confirm</Select.Option>
          <Select.Option value="preparing">Preparing</Select.Option>
          <Select.Option value="ready">Ready</Select.Option>
          <Select.Option value="out_for_delivery">Out for Delivery</Select.Option>
          <Select.Option value="delivered">Delivered</Select.Option>
        </Select>
      )
    }
  ];

  return (
    <div>
      <h1>Order Management</h1>
      
      <div style={{ marginBottom: 16 }}>
        <Select
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          style={{ width: 200, marginRight: 8 }}
        >
          <Select.Option value="all">All Orders</Select.Option>
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="out_for_delivery">Out for Delivery</Select.Option>
          <Select.Option value="delivered">Delivered</Select.Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        rowKey="id"
        pagination={{
          current: filters.page,
          pageSize: filters.limit,
          onChange: (page) => setFilters({ ...filters, page })
        }}
      />
    </div>
  );
};

export default OrderManagementDashboard;
```

---

### Delivery Assignment Component

```javascript
import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, message } from 'antd';

const DeliveryAssignmentModal = ({ orderId, visible, onClose, onSuccess }) => {
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchAvailablePartners();
    }
  }, [visible]);

  const fetchAvailablePartners = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(
        'https://localhost:5050/api/v1/users/staff?role=delivery_boy&status=available',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();
      if (result.success) {
        setDeliveryPartners(result.data.staff);
      }
    } catch (error) {
      message.error('Failed to fetch delivery partners');
    }
  };

  const assignDelivery = async () => {
    if (!selectedPartner) {
      message.warning('Please select a delivery partner');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(
        `https://localhost:5050/api/v1/orders/${orderId}/assign-delivery`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            delivery_person_id: selectedPartner
          })
        }
      );

      const result = await response.json();
      if (result.success) {
        message.success('Delivery partner assigned successfully');
        onSuccess();
        onClose();
      } else {
        message.error(result.error.message);
      }
    } catch (error) {
      message.error('Failed to assign delivery partner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Assign Delivery Partner"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="assign"
          type="primary"
          loading={loading}
          onClick={assignDelivery}
        >
          Assign
        </Button>
      ]}
    >
      <Select
        placeholder="Select delivery partner"
        style={{ width: '100%' }}
        value={selectedPartner}
        onChange={setSelectedPartner}
      >
        {deliveryPartners.map(partner => (
          <Select.Option key={partner.id} value={partner.id}>
            {partner.profile.first_name} {partner.profile.last_name} - 
            {partner.current_orders} active orders
          </Select.Option>
        ))}
      </Select>
    </Modal>
  );
};

export default DeliveryAssignmentModal;
```

---

### Delivery Fee Configuration Component

```javascript
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, Space, message } from 'antd';

const DeliveryFeeConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const saveConfiguration = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(
        'https://localhost:5050/api/v1/delivery/admin/fee-config',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        }
      );

      const result = await response.json();
      if (result.success) {
        message.success('Configuration saved successfully');
      } else {
        message.error(result.error.message);
      }
    } catch (error) {
      message.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Delivery Fee Configuration">
      <Form
        form={form}
        layout="vertical"
        onFinish={saveConfiguration}
        initialValues={{
          name: 'Standard Delivery Fees',
          is_active: true,
          tiers: [
            {
              tier_name: 'Short Distance',
              distance_min: 0,
              distance_max: 5,
              brackets: [
                {
                  order_min: 0,
                  order_max: 500,
                  base_fee: 50,
                  per_km_fee: 0,
                  discount_percent: 0
                }
              ]
            }
          ]
        }}
      >
        <Form.Item
          name="name"
          label="Configuration Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea />
        </Form.Item>

        <Form.List name="tiers">
          {(fields, { add, remove }) => (
            <>
              {fields.map(field => (
                <Card key={field.key} style={{ marginBottom: 16 }}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'tier_name']}
                    label="Tier Name"
                  >
                    <Input />
                  </Form.Item>

                  <Space>
                    <Form.Item
                      {...field}
                      name={[field.name, 'distance_min']}
                      label="Min Distance (km)"
                    >
                      <InputNumber min={0} />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'distance_max']}
                      label="Max Distance (km)"
                    >
                      <InputNumber min={0} />
                    </Form.Item>
                  </Space>

                  <Button danger onClick={() => remove(field.name)}>
                    Remove Tier
                  </Button>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add()}>
                Add Tier
              </Button>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Configuration
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DeliveryFeeConfig;
```

---

### Analytics Dashboard Component

```javascript
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker } from 'antd';
import { Line, Bar } from '@ant-design/charts';

const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams();
      
      if (dateRange.length === 2) {
        params.append('date_from', dateRange[0].toISOString());
        params.append('date_to', dateRange[1].toISOString());
      }

      const response = await fetch(
        `https://localhost:5050/api/v1/analytics/delivery-performance?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();
      if (result.success) {
        setMetrics(result.data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  if (!metrics) return <div>Loading...</div>;

  return (
    <div>
      <h1>Delivery Analytics</h1>

      <DatePicker.RangePicker
        onChange={setDateRange}
        style={{ marginBottom: 24 }}
      />

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Deliveries"
              value={metrics.total_deliveries}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={metrics.success_rate}
              suffix="%"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Delivery Time"
              value={metrics.average_delivery_time}
              suffix="min"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={metrics.total_delivery_fees}
              prefix="₹"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Daily Deliveries">
            <Line
              data={metrics.daily_breakdown}
              xField="date"
              yField="deliveries"
              height={300}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top Performers">
            <Bar
              data={metrics.top_performers}
              xField="total_deliveries"
              yField="name"
              height={300}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;
```

---

## Best Practices

### 1. Real-time Updates
- Implement WebSocket connections for live order updates
- Poll active deliveries every 30 seconds
- Show notifications for new orders

### 2. Error Handling
- Always check `success` field in responses
- Display user-friendly error messages
- Log errors for debugging
- Implement retry logic for failed requests

### 3. Performance
- Implement pagination for large lists
- Cache frequently accessed data
- Use debouncing for search/filter inputs
- Lazy load components

### 4. Security
- Store tokens securely
- Implement token refresh mechanism
- Validate user permissions on frontend
- Use HTTPS for all API calls

### 5. User Experience
- Show loading states
- Provide clear feedback for actions
- Implement optimistic UI updates
- Add confirmation dialogs for critical actions

---

## Testing

### Test Scenarios

1. **Order Management**
   - Fetch orders with different filters
   - Update order status through workflow
   - Assign delivery partner to order
   - Cancel order with reason

2. **Delivery Fee Configuration**
   - Create new fee structure
   - Activate/deactivate configurations
   - Calculate fees for different scenarios
   - Test tier and bracket logic

3. **Payout Management**
   - Set global payout schedule
   - Create individual schedules
   - Override global with individual
   - Delete individual schedules

4. **Analytics**
   - Fetch metrics with date ranges
   - Filter by outlet/partner
   - Export reports
   - Verify calculations

---

## Support & Resources

### API Endpoints Summary

**Orders:**
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/:orderId` - Get order details
- `PATCH /api/v1/orders/:orderId/status` - Update status
- `POST /api/v1/orders/:orderId/assign-delivery` - Assign delivery
- `GET /api/v1/orders/stats` - Get statistics

**Delivery Configuration:**
- `GET /api/v1/delivery/fee-structure` - Get fee structure
- `POST /api/v1/delivery/calculate-fee` - Calculate fee
- `GET /api/v1/delivery/admin/fee-config` - Get configs
- `POST /api/v1/delivery/admin/fee-config` - Update config

**Payout Management:**
- `GET /api/v1/delivery/admin/payout-config` - Get payout configs
- `POST /api/v1/delivery/admin/payout-config` - Update payout config
- `GET /api/v1/delivery/admin/payout-schedule/global` - Get global schedule
- `POST /api/v1/delivery/admin/payout-schedule/global` - Update global schedule
- `GET /api/v1/delivery/admin/payout-schedule/individual` - Get individual schedules
- `POST /api/v1/delivery/admin/payout-schedule/individual` - Set individual schedule
- `DELETE /api/v1/delivery/admin/payout-schedule/individual/:scheduleId` - Delete schedule

**Staff Management:**
- `GET /api/v1/users/staff` - Get staff list
- `PUT /api/v1/users/staff/:staffId` - Update staff
- `DELETE /api/v1/users/staff/:staffId` - Deactivate staff

### Contact
- Backend Team: backend@yourcompany.com
- Technical Support: support@yourcompany.com
- Documentation: https://docs.yourapi.com

---

**Last Updated:** October 27, 2025  
**API Version:** v1  
**Document Version:** 1.0.0
