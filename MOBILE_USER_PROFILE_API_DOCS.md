# Mobile User Profile API Documentation

## Base URL
```
http://localhost:5050/api/v1
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 1. Get User Profile

Get complete user profile including addresses and outlet assignments (for staff).

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "vfBdDXnQQWYUJtcIQyJ7",
      "email": "user@example.com",
      "phone": "+1234567890",
      "role": "customer",
      "is_active": true,
      "created_at": "2025-10-15T10:30:00Z",
      "profile": {
        "user_id": "vfBdDXnQQWYUJtcIQyJ7",
        "first_name": "John",
        "last_name": "Doe",
        "username": "spicy_biryani_42",
        "avatar_url": "https://example.com/avatar.jpg",
        "date_of_birth": "1990-01-15",
        "loyalty_points": 250,
        "addresses": [
          {
            "id": "T38sszduJYWrX4Ma",
            "type": "home",
            "label": "Home",
            "street": "123 Main Street",
            "city": "New York",
            "state": "NY",
            "zip_code": "10001",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "phone": "+1234567890",
            "is_default": true,
            "is_for_someone_else": false,
            "created_at": "2025-10-20T08:00:00Z"
          },
          {
            "id": "rlevpuyuZOExcz8Z",
            "type": "work",
            "label": "Office",
            "street": "456 Business Ave",
            "city": "New York",
            "state": "NY",
            "zip_code": "10002",
            "latitude": 40.7589,
            "longitude": -73.9851,
            "phone": "+1234567890",
            "is_default": false,
            "is_for_someone_else": false,
            "created_at": "2025-10-21T09:00:00Z"
          }
        ],
        "preferences": {
          "notifications_enabled": true,
          "favorite_cuisine": "Indian"
        }
      },
      "outlet_assignments": []
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
- `500 Internal Server Error`: Server error

---

## 2. Update User Profile

Update basic profile information (name, phone, avatar, preferences).

**Endpoint:** `PUT /users/profile`

**Note on Avatar:**
- The `avatar_url` field accepts any string value (URL, emoji, or text)
- For image URLs: Upload the image to your storage service first, then send the URL
- For emojis: Send the emoji directly (e.g., "🍣", "🍕", "🍜")
- Accepts any string, empty string, or null

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar_url": "🍣",
  "date_of_birth": "1990-01-15",
  "preferences": {
    "notifications_enabled": true,
    "favorite_cuisine": "Indian",
    "avatar_emoji": "🍣"
  }
}
```

**Field Validations:**
- `first_name`: Optional, 2-50 characters
- `last_name`: Optional, 2-50 characters
- `phone`: Optional, valid phone format
- `avatar_url`: Optional, any string (URL, emoji, text), empty string, or null
- `date_of_birth`: Optional, valid date
- `preferences`: Optional, object

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "user_id": "vfBdDXnQQWYUJtcIQyJ7",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "avatar_url": "🍣",
      "date_of_birth": "1990-01-15",
      "preferences": {
        "notifications_enabled": true,
        "favorite_cuisine": "Indian",
        "avatar_emoji": "🍣"
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid token
- `500 Internal Server Error`: Server error

---

## 3. Add Address

Add a new delivery address to user profile.

**Endpoint:** `POST /users/addresses`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "home",
  "label": "Home",
  "street": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "phone": "+1234567890",
  "is_default": false,
  "is_for_someone_else": false,
  "receiver_name": "Jane Doe",
  "receiver_phone": "+0987654321"
}
```

**Field Validations:**
- `type`: Required, one of: "home", "work", "other"
- `label`: Optional, custom label for the address
- `street`: Required, string
- `city`: Required, string
- `state`: Required, string
- `zip_code`: Required, string
- `latitude`: Required, number between -90 and 90
- `longitude`: Required, number between -180 and 180
- `phone`: Optional, valid phone format
- `is_default`: Optional, boolean (default: false)
- `is_for_someone_else`: Optional, boolean (default: false)
- `receiver_name`: Required if `is_for_someone_else` is true
- `receiver_phone`: Required if `is_for_someone_else` is true

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "address": {
      "id": "T38sszduJYWrX4Ma",
      "type": "home",
      "label": "Home",
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "phone": "+1234567890",
      "is_default": true,
      "is_for_someone_else": false,
      "created_at": "2025-10-29T15:30:00Z"
    }
  }
}
```

**Notes:**
- If this is the first address or `is_default` is true, it will automatically become the default address
- All other addresses will have `is_default` set to false

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid token
- `404 Not Found`: User profile not found
- `500 Internal Server Error`: Server error

---

## 4. Update Address

Update an existing address. **IMPORTANT:** You must send ALL address fields, not just the ones you want to change.

**Endpoint:** `PUT /users/addresses/:addressId`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (ALL FIELDS REQUIRED):**
```json
{
  "type": "work",
  "label": "Office",
  "street": "456 Business Ave",
  "city": "New York",
  "state": "NY",
  "zip_code": "10002",
  "latitude": 40.7589,
  "longitude": -73.9851,
  "phone": "+1234567890",
  "is_default": false,
  "is_for_someone_else": false
}
```

**⚠️ CRITICAL: Frontend Implementation**

When updating an address (e.g., changing type, label, or default status):

1. **Fetch the existing address data first** from the profile endpoint
2. **Include ALL fields** in the PUT request, not just the field you're changing
3. **Example - Changing address type:**
   ```dart
   // ❌ WRONG - This will fail
   {
     "type": "work"
   }
   
   // ✅ CORRECT - Include all fields
   {
     "type": "work",  // Changed field
     "label": "Office",
     "street": "123 Main Street",  // Existing data
     "city": "New York",  // Existing data
     "state": "NY",  // Existing data
     "zip_code": "10001",  // Existing data
     "latitude": 40.7128,  // Existing data
     "longitude": -74.0060,  // Existing data
     "phone": "+1234567890",  // Existing data
     "is_default": false,  // Existing data
     "is_for_someone_else": false  // Existing data
   }
   ```

4. **Example - Changing default address:**
   ```dart
   // ✅ CORRECT - Include all fields with is_default updated
   {
     "type": "home",  // Existing data
     "label": "Home",  // Existing data
     "street": "123 Main Street",  // Existing data
     "city": "New York",  // Existing data
     "state": "NY",  // Existing data
     "zip_code": "10001",  // Existing data
     "latitude": 40.7128,  // Existing data
     "longitude": -74.0060,  // Existing data
     "phone": "+1234567890",  // Existing data
     "is_default": true,  // Changed to true
     "is_for_someone_else": false  // Existing data
   }
   ```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "address": {
      "id": "T38sszduJYWrX4Ma",
      "type": "work",
      "label": "Office",
      "street": "456 Business Ave",
      "city": "New York",
      "state": "NY",
      "zip_code": "10002",
      "latitude": 40.7589,
      "longitude": -73.9851,
      "phone": "+1234567890",
      "is_default": false,
      "is_for_someone_else": false,
      "updated_at": "2025-10-29T15:35:00Z"
    }
  }
}
```

**Notes:**
- If `is_default` is set to true, all other addresses will automatically have `is_default` set to false
- After successful update, **refresh your local state** or refetch the profile to see changes

**Error Responses:**
- `400 Bad Request`: Validation error (missing required fields)
- `401 Unauthorized`: Invalid token
- `404 Not Found`: Address or user profile not found
- `500 Internal Server Error`: Server error

---

## 5. Delete Address

Delete an address from user profile.

**Endpoint:** `DELETE /users/addresses/:addressId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

**Notes:**
- If the deleted address was the default and other addresses exist, the first remaining address will become the default
- You cannot delete an address if it's the only one (this is not enforced by backend, but recommended)

**Error Responses:**
- `401 Unauthorized`: Invalid token
- `404 Not Found`: Address or user profile not found
- `500 Internal Server Error`: Server error

---

## 6. Get User Outlet Assignments (Staff Only)

Get outlet assignments for staff members (outlet_admin, kitchen_staff, delivery_boy).

**Endpoint:** `GET /auth/me/outlets`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK) - For Staff:**
```json
{
  "success": true,
  "data": {
    "outlet_assignments": [
      {
        "id": "assignment_id_123",
        "outlet_id": "outlet_abc_123",
        "role": "delivery_boy",
        "is_active": true,
        "assigned_by": "admin_user_id",
        "created_at": "2025-10-15T10:00:00Z",
        "outlet_details": {
          "name": "Rekha's Kitchen - Downtown",
          "address": {
            "street": "789 Food Street",
            "city": "New York",
            "state": "NY",
            "zip_code": "10003"
          },
          "phone": "+1234567890",
          "is_active": true
        }
      }
    ]
  }
}
```

**Response (200 OK) - For Customers:**
```json
{
  "success": true,
  "data": {
    "outlet_assignments": [],
    "message": "User role does not have outlet assignments"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid token
- `500 Internal Server Error`: Server error

---

## Common Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication failed or token invalid
- `FORBIDDEN`: User doesn't have permission
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

All endpoints are rate-limited:
- **General endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes

When rate limit is exceeded:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

---

## Address Types and Labels

**Predefined Types:**
- `home`: Home address
- `work`: Work/Office address
- `other`: Other address type

**Custom Labels:**
You can provide a custom `label` field (e.g., "Mom's House", "Gym", "Friend's Place") for better UX. If not provided, the `type` will be used as the label.

---

## Best Practices for Frontend

### 1. Updating UI After Address Changes

After successfully updating an address, you have two options:

**Option A: Refetch Profile (Recommended)**
```dart
// After successful PUT request
final response = await updateAddress(addressId, addressData);
if (response.success) {
  // Refetch complete profile
  await fetchUserProfile();
}
```

**Option B: Update Local State**
```dart
// After successful PUT request
final response = await updateAddress(addressId, addressData);
if (response.success) {
  // Update local address list with response data
  setState(() {
    addresses[index] = response.data.address;
  });
}
```

### 2. Handling Default Address Toggle

```dart
Future<void> setDefaultAddress(String addressId) async {
  // 1. Get current address data
  final currentAddress = addresses.firstWhere((a) => a.id == addressId);
  
  // 2. Create update payload with ALL fields
  final updateData = {
    'type': currentAddress.type,
    'label': currentAddress.label,
    'street': currentAddress.street,
    'city': currentAddress.city,
    'state': currentAddress.state,
    'zip_code': currentAddress.zipCode,
    'latitude': currentAddress.latitude,
    'longitude': currentAddress.longitude,
    'phone': currentAddress.phone,
    'is_default': true,  // Only this changes
    'is_for_someone_else': currentAddress.isForSomeoneElse,
  };
  
  // 3. Send PUT request
  await updateAddress(addressId, updateData);
  
  // 4. Refresh UI
  await fetchUserProfile();
}
```

### 3. Handling Address Type/Label Changes

```dart
Future<void> changeAddressType(String addressId, String newType, String newLabel) async {
  // 1. Get current address data
  final currentAddress = addresses.firstWhere((a) => a.id == addressId);
  
  // 2. Create update payload with ALL fields
  final updateData = {
    'type': newType,  // Changed
    'label': newLabel,  // Changed
    'street': currentAddress.street,  // Keep existing
    'city': currentAddress.city,  // Keep existing
    'state': currentAddress.state,  // Keep existing
    'zip_code': currentAddress.zipCode,  // Keep existing
    'latitude': currentAddress.latitude,  // Keep existing
    'longitude': currentAddress.longitude,  // Keep existing
    'phone': currentAddress.phone,  // Keep existing
    'is_default': currentAddress.isDefault,  // Keep existing
    'is_for_someone_else': currentAddress.isForSomeoneElse,  // Keep existing
  };
  
  // 3. Send PUT request
  final response = await updateAddress(addressId, updateData);
  
  // 4. Update UI
  if (response.success) {
    await fetchUserProfile();
  }
}
```

### 4. Error Handling

```dart
try {
  final response = await updateAddress(addressId, addressData);
  if (response.success) {
    // Show success message
    showSnackbar('Address updated successfully');
    await fetchUserProfile();
  }
} catch (e) {
  if (e is ValidationError) {
    // Show validation errors to user
    showError('Please fill all required fields');
  } else if (e is UnauthorizedError) {
    // Redirect to login
    navigateToLogin();
  } else {
    // Show generic error
    showError('Failed to update address. Please try again.');
  }
}
```

---

## Testing Endpoints

### Using cURL

**Get Profile:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update Profile:**
```bash
curl -X PUT http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "avatar_url": "https://example.com/avatar.jpg"
  }'
```

**Add Address:**
```bash
curl -X POST http://localhost:3000/api/v1/users/addresses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "home",
    "label": "Home",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "is_default": true
  }'
```

**Update Address:**
```bash
curl -X PUT http://localhost:3000/api/v1/users/addresses/T38sszduJYWrX4Ma \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "work",
    "label": "Office",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "phone": "+1234567890",
    "is_default": false,
    "is_for_someone_else": false
  }'
```

**Delete Address:**
```bash
curl -X DELETE http://localhost:3000/api/v1/users/addresses/T38sszduJYWrX4Ma \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Support

For issues or questions, contact the backend team or refer to the main API documentation.
