# Outlet Management API Documentation
**Rekha's Kitchen - Outlet API Reference**

**Base URL:** `http://localhost:5050/api/v1`

**Authentication:** Bearer Token in Header: `Authorization: Bearer <token>`

---

## 📑 Table of Contents

1. [Admin Endpoints](#admin-endpoints) (Super Admin & Outlet Admin)
2. [Public Endpoints](#public-endpoints) (No Auth Required)
3. [Error Handling](#error-handling)
4. [Data Models](#data-models)

---

## Admin Endpoints

### 1. Create Outlet (Super Admin Only)

**Endpoint:** `POST /outlets` 🔒

**Auth:** Super Admin only

**Request Body:**
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
  "avg_preparation_time": 20
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Outlet created successfully",
  "data": {
    "outlet_id": "outlet123",
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
    "avg_preparation_time": 20,
    "is_active": true
  }
}
```

**Notes:**
- No delivery fee configuration needed (handled by separate delivery model)
- `coordinates` are optional but recommended for location-based features
- `service_radius` defaults to 10 km if not provided
- `avg_preparation_time` defaults to 20 minutes if not provided

---

### 2. Get All Outlets

**Endpoint:** `GET /outlets` 🔒

**Auth:** Super Admin, Outlet Admin

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `is_active` (optional) - Filter by active status (true/false)
- `city` (optional) - Filter by city
- `state` (optional) - Filter by state

**Example Request:**
```bash
GET /outlets?page=1&limit=10&is_active=true&city=Mumbai
```

**Response (200 OK):**
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
        "email": "andheri@rekhaskitchen.com",
        "coordinates": {
          "latitude": 19.0760,
          "longitude": 72.8777
        },
        "service_radius": 10,
        "is_active": true,
        "is_accepting_orders": true,
        "average_rating": 4.5,
        "total_orders": 1250,
        "total_revenue": 125000,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

**Notes:**
- Outlet Admins only see outlets they're assigned to
- Super Admins see all outlets

---

### 3. Get Single Outlet

**Endpoint:** `GET /outlets/:outletId` 🔒

**Auth:** Super Admin, Outlet Admin (assigned outlets only)

**Response (200 OK):**
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
      "avg_preparation_time": 20,
      "is_active": true,
      "is_accepting_orders": true,
      "average_rating": 4.5,
      "total_orders": 1250,
      "total_revenue": 125000,
      "created_by": "user123",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

---

### 4. Update Outlet

**Endpoint:** `PUT /outlets/:outletId` 🔒

**Auth:** Super Admin, Outlet Admin (assigned outlets only)

**Request Body (partial update supported):**
```json
{
  "name": "Rekha's Kitchen - Andheri West",
  "phone": "+919876543211",
  "service_radius": 12,
  "operating_hours": {
    "monday": "09:00-23:00",
    "tuesday": "09:00-23:00",
    "wednesday": "09:00-23:00",
    "thursday": "09:00-23:00",
    "friday": "09:00-00:00",
    "saturday": "09:00-00:00",
    "sunday": "09:00-23:00"
  },
  "is_accepting_orders": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Outlet updated successfully",
  "data": {
    "outlet": {
      "id": "outlet123",
      "name": "Rekha's Kitchen - Andheri West",
      "phone": "+919876543211",
      "service_radius": 12,
      "updated_by": "user123",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### 5. Delete/Deactivate Outlet

**Endpoint:** `DELETE /outlets/:outletId` 🔒

**Auth:** Super Admin only

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Outlet deactivated successfully"
}
```

**Notes:**
- Outlets are deactivated, not permanently deleted
- Maintains data integrity for historical orders
- Sets `is_active: false` and records deactivation details

---

### 6. Get Outlet Statistics

**Endpoint:** `GET /outlets/:outletId/stats` 🔒

**Auth:** Super Admin, Outlet Admin (assigned outlets only)

**Response (200 OK):**
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

---

### 7. Get Outlet Staff

**Endpoint:** `GET /outlets/:outletId/staff` 🔒

**Auth:** Super Admin, Outlet Admin (assigned outlets only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "outlet_id": "outlet123",
    "outlet_name": "Rekha's Kitchen - Andheri",
    "staff": [
      {
        "user_id": "user456",
        "email": "staff@rekhaskitchen.com",
        "role": "kitchen_staff",
        "phone": "+919876543210",
        "is_active": true,
        "profile": {
          "first_name": "Raj",
          "last_name": "Kumar"
        },
        "assignment": {
          "outlet_id": "outlet123",
          "assigned_at": "2024-01-01T00:00:00Z",
          "is_active": true
        }
      }
    ]
  }
}
```

---

## Public Endpoints

### 8. Get Nearby Outlets

**Endpoint:** `GET /outlets/nearby`

**Auth:** Not required (Public)

**Query Parameters:**
- `latitude` (required) - User's latitude
- `longitude` (required) - User's longitude
- `radius` (optional) - Search radius in km (default: 10)

**Example Request:**
```bash
GET /outlets/nearby?latitude=19.0760&longitude=72.8777&radius=10
```

**Response (200 OK):**
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

**Notes:**
- Returns outlets sorted by distance
- `is_serviceable` indicates if outlet can deliver to the location
- Only returns active outlets

---

### 9. Check Serviceability

**Endpoint:** `POST /outlets/check-serviceability`

**Auth:** Not required (Public)

**Request Body:**
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

**Response (200 OK - Serviceable):**
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
        "address": {
          "street": "123 Main Road",
          "city": "Mumbai"
        }
      }
    ],
    "total_outlets": 1,
    "message": "Delivery available at your location"
  }
}
```

**Response (200 OK - Not Serviceable):**
```json
{
  "success": true,
  "data": {
    "serviceable": false,
    "primary_outlet": null,
    "all_outlets": [],
    "total_outlets": 0,
    "message": "Sorry, we don't deliver to your location yet"
  }
}
```

**Notes:**
- Checks if any outlet can service the given location
- Returns closest outlet as `primary_outlet`
- Delivery fee calculation handled by separate delivery model
- Estimated time includes preparation + travel time

---

### 10. Get Service Areas

**Endpoint:** `GET /outlets/service-areas`

**Auth:** Not required (Public)

**Response (200 OK):**
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

**Notes:**
- Lists all cities and states where service is available
- Useful for displaying coverage areas on landing page

---

### 11. Get Public Outlet Details

**Endpoint:** `GET /outlets/public/:outletId`

**Auth:** Not required (Public)

**Response (200 OK):**
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

**Notes:**
- Returns only public information
- Does not include internal fields like revenue, created_by, etc.
- Only returns active outlets

---

## Error Handling

### Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data or coordinates |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions for this outlet |
| `NOT_FOUND` | 404 | Outlet not found |
| `CONFLICT` | 409 | Outlet with same name/email already exists |
| `INTERNAL_ERROR` | 500 | Server error |

### Example Error Responses

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid coordinates provided"
  }
}
```

**Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Outlet not found"
  }
}
```

**Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied for this outlet"
  }
}
```

**Conflict:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Outlet with this name already exists"
  }
}
```

---

## Data Models

### Outlet Model

```typescript
{
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  phone: string;
  email: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  service_radius: number;  // in kilometers
  operating_hours: {
    monday: string;     // "HH:MM-HH:MM"
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  avg_preparation_time: number;  // in minutes
  is_active: boolean;
  is_accepting_orders: boolean;
  average_rating: number;
  total_orders: number;
  total_revenue: number;
  created_by: string;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}
```

---

## Role-Based Access Control

### Super Admin
- ✅ Create outlets
- ✅ View all outlets
- ✅ Update any outlet
- ✅ Delete/deactivate outlets
- ✅ View all outlet statistics
- ✅ View all outlet staff

### Outlet Admin
- ❌ Cannot create outlets
- ✅ View assigned outlets only
- ✅ Update assigned outlets
- ❌ Cannot delete outlets
- ✅ View assigned outlet statistics
- ✅ View assigned outlet staff

### Public (No Auth)
- ✅ Get nearby outlets
- ✅ Check serviceability
- ✅ Get service areas
- ✅ Get public outlet details

---

## Important Notes

### Delivery Fees
- Delivery fee configuration has been removed from outlets
- Delivery fees are now handled by a separate delivery model
- Use the delivery API endpoints for fee calculations

### Coordinates
- Coordinates are optional but highly recommended
- Required for location-based features (nearby outlets, serviceability)
- Use decimal degrees format (e.g., 19.0760, 72.8777)

### Service Radius
- Measured in kilometers
- Defaults to 10 km if not specified
- Used to determine if outlet can service a location

### Operating Hours
- Format: "HH:MM-HH:MM" (24-hour format)
- Example: "10:00-22:00"
- Can be different for each day

### Deactivation vs Deletion
- Outlets are deactivated, not deleted
- Maintains data integrity for historical orders
- Deactivated outlets are hidden from public endpoints

---

## Quick Reference

```
Admin Endpoints (🔒 Auth Required)
POST   /outlets                    Create outlet (Super Admin)
GET    /outlets                    List outlets
GET    /outlets/:id                Get outlet details
PUT    /outlets/:id                Update outlet
DELETE /outlets/:id                Deactivate outlet (Super Admin)
GET    /outlets/:id/stats          Get outlet statistics
GET    /outlets/:id/staff          Get outlet staff

Public Endpoints (No Auth)
GET    /outlets/nearby             Find nearby outlets
POST   /outlets/check-serviceability  Check delivery availability
GET    /outlets/service-areas      Get all service areas
GET    /outlets/public/:id         Get public outlet details
```

---

**🔒 = Requires Authentication**

**Last Updated:** January 2024  
**API Version:** v1.0.0

**End of Documentation**
