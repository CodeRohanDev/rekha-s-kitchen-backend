# Mobile Authentication API Documentation

## Overview

This document provides comprehensive API documentation for mobile app developers to implement user authentication in the food delivery application. The system supports two authentication methods:

1. **Email/Password Authentication** - Traditional registration and login
2. **OTP Authentication** - Phone number-based authentication (Recommended for mobile)

**Base URL:** `https://your-api-domain.com/api/auth`

**Rate Limiting:** 
- Authentication endpoints: 5 requests per 15 minutes
- General endpoints: 100 requests per 15 minutes

---

## Table of Contents

1. [Authentication Methods](#authentication-methods)
2. [Email/Password Authentication](#emailpassword-authentication)
3. [OTP Authentication](#otp-authentication-recommended)
4. [Token Management](#token-management)
5. [User Profile](#user-profile)
6. [Error Handling](#error-handling)
7. [Security Best Practices](#security-best-practices)

---

## Authentication Methods

### Supported Methods

| Method | Use Case | Recommended For |
|--------|----------|-----------------|
| Email/Password | Web, traditional apps | Desktop, web applications |
| OTP (Phone) | Quick mobile login | Mobile apps (iOS/Android) |

### Token System

All authenticated requests require an access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

**Token Characteristics:**
- Access tokens never expire (long-lived)
- Refresh tokens available for token rotation
- Tokens are JWT-based

---

## Email/Password Authentication

### 1. Register New User

Create a new customer account using email and password.

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Validation Rules:**
- `email`: Valid email format, required
- `password`: Minimum 8 characters, required
- `phone`: Valid phone format (10+ digits), required
- `first_name`: 2-50 characters, required
- `last_name`: 2-50 characters, required

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user_id": "user_abc123",
    "email": "user@example.com",
    "username": "spicy_taco_42",
    "role": "customer"
  }
}
```

**Features:**
- Automatically generates a unique food-themed username
- Creates user profile with loyalty points initialized to 0
- Password is securely hashed using bcrypt

**Error Responses:**

```json
// 409 Conflict - Email already exists
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "User with this email already exists"
  }
}

// 400 Bad Request - Validation error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "\"email\" must be a valid email"
      }
    ]
  }
}

// 429 Too Many Requests - Rate limit exceeded
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many authentication attempts, please try again later"
  }
}
```

---

### 2. Login with Email/Password

Authenticate existing user and receive access tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "role": "customer",
      "profile": {
        "first_name": "John",
        "last_name": "Doe",
        "username": "spicy_taco_42",
        "avatar_url": null,
        "loyalty_points": 150
      }
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": null
    }
  }
}
```

**Error Responses:**

```json
// 401 Unauthorized - Invalid credentials
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}

// 401 Unauthorized - Account deactivated
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Account is deactivated"
  }
}
```

---

## OTP Authentication (Recommended)

Phone number-based authentication using One-Time Password. This is the recommended method for mobile applications.

### 1. Send OTP

Request an OTP to be sent to the user's phone number.

**Endpoint:** `POST /api/auth/otp/send`

**Request Body:**

```json
{
  "phone": "+1234567890"
}
```

**Validation Rules:**
- `phone`: Valid phone format with 10+ digits, supports international format

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "+1234567890",
    "expires_in": 300,
    "otp": "123456"
  }
}
```

**Response Fields:**
- `phone`: The phone number OTP was sent to
- `expires_in`: OTP validity duration in seconds (5 minutes)
- `otp`: **Only included in development mode** - In production, OTP is sent via SMS

**OTP Characteristics:**
- 6-digit numeric code
- Valid for 5 minutes
- Maximum 3 verification attempts
- Previous unverified OTPs are automatically deleted

**Development Mode:**
- OTP is logged to server console
- OTP is included in API response for testing

**Production Mode:**
- OTP sent via SMS service (Twilio/AWS SNS)
- OTP not included in response

**Error Responses:**

```json
// 400 Bad Request - Invalid phone format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format"
  }
}
```

---

### 2. Verify OTP

Verify the OTP and complete authentication. This endpoint handles both login (existing users) and registration (new users).

**Endpoint:** `POST /api/auth/otp/verify`

**Request Body:**

```json
{
  "phone": "+1234567890",
  "otp": "123456",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Field Requirements:**
- `phone`: Required - Phone number that received the OTP
- `otp`: Required - 6-digit OTP code
- `first_name`: Optional - Used for new user registration (defaults to "User")
- `last_name`: Optional - Used for new user registration (defaults to "")

**Success Response - Existing User (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_abc123",
      "phone": "+1234567890",
      "email": null,
      "username": "crispy_samosa_89",
      "role": "customer",
      "profile": {
        "first_name": "John",
        "last_name": "Doe",
        "username": "crispy_samosa_89",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "is_new_user": false
  }
}
```

**Success Response - New User (200 OK):**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user_xyz789",
      "phone": "+1234567890",
      "email": null,
      "username": "tasty_biryani_23",
      "role": "customer",
      "profile": {
        "first_name": "John",
        "last_name": "Doe",
        "username": "tasty_biryani_23",
        "avatar_url": null
      }
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "is_new_user": true
  }
}
```

**Key Features:**
- Automatically detects if user exists or needs registration
- `is_new_user` flag indicates if this is a new registration
- New users get auto-generated food-themed usernames
- Phone number is automatically verified
- Loyalty points initialized to 0 for new users

**Error Responses:**

```json
// 400 Bad Request - No OTP found
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "No OTP found for this phone number. Please request a new OTP."
  }
}

// 400 Bad Request - OTP expired
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "OTP has expired. Please request a new OTP."
  }
}

// 400 Bad Request - Invalid OTP
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid OTP. Please try again.",
    "attempts_remaining": 2
  }
}

// 400 Bad Request - Too many attempts
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Too many failed attempts. Please request a new OTP."
  }
}
```

---

### 3. Resend OTP

Request a new OTP if the previous one expired or wasn't received.

**Endpoint:** `POST /api/auth/otp/resend`

**Request Body:**

```json
{
  "phone": "+1234567890"
}
```

**Success Response (200 OK):**

Same as Send OTP response. This endpoint:
- Deletes all previous OTPs for the phone number
- Generates and sends a new OTP
- Resets attempt counter

---

## Token Management

### Refresh Access Token

Generate new access and refresh tokens using a valid refresh token.

**Endpoint:** `POST /api/auth/refresh-token`

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": null
  }
}
```

**Error Responses:**

```json
// 400 Bad Request - Missing token
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Refresh token is required"
  }
}

// 401 Unauthorized - Invalid or expired token
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid refresh token"
  }
}
```

**When to Refresh:**
- Although tokens don't expire, implement token rotation for security
- Refresh tokens periodically (e.g., every 7 days)
- Refresh on app launch if token is older than threshold

---

### Logout

Logout the current user (mainly for logging purposes).

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Implementation Notes:**
- This endpoint is primarily for server-side logging
- Client should clear stored tokens regardless of response
- No server-side token invalidation (tokens remain valid)

---

## User Profile

### Get Current User Profile

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "role": "customer",
      "phone": "+1234567890",
      "is_active": true,
      "profile": {
        "first_name": "John",
        "last_name": "Doe",
        "username": "spicy_taco_42",
        "avatar_url": "https://example.com/avatar.jpg",
        "addresses": [
          {
            "type": "home",
            "street": "123 Main St",
            "city": "New York",
            "state": "NY",
            "zip_code": "10001",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "is_default": true
          }
        ],
        "preferences": {
          "dietary": "vegetarian",
          "spice_level": "medium"
        },
        "loyalty_points": 150
      },
      "outlet_assignments": [],
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Profile Fields:**
- `id`: Unique user identifier
- `email`: User's email (null for OTP-only users)
- `role`: User role (customer, outlet_admin, kitchen_staff, delivery_boy, super_admin)
- `phone`: Phone number
- `is_active`: Account status
- `profile`: Detailed profile information
- `outlet_assignments`: Empty for customers, populated for staff
- `created_at`: Account creation timestamp

---

### Get User Outlet Assignments

Get outlet assignments for staff users (outlet_admin, kitchen_staff, delivery_boy).

**Endpoint:** `GET /api/auth/me/outlets`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response - Customer (200 OK):**

```json
{
  "success": true,
  "data": {
    "outlet_assignments": [],
    "message": "User role does not have outlet assignments"
  }
}
```

**Success Response - Staff (200 OK):**

```json
{
  "success": true,
  "data": {
    "outlet_assignments": [
      {
        "id": "assignment_123",
        "outlet_id": "outlet_abc",
        "role": "kitchen_staff",
        "is_active": true,
        "assigned_by": "admin_xyz",
        "outlet_details": {
          "name": "Downtown Kitchen",
          "address": {
            "street": "456 Food St",
            "city": "New York",
            "state": "NY",
            "zip_code": "10002"
          },
          "phone": "+1234567891",
          "is_active": true
        }
      }
    ]
  }
}
```

---

## Error Handling

### Standard Error Response Format

All errors follow this consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": []
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data or parameters |
| 401 | UNAUTHORIZED | Invalid credentials or token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

### Validation Error Details

Validation errors include detailed field-level information:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "\"email\" must be a valid email"
      },
      {
        "field": "password",
        "message": "\"password\" length must be at least 8 characters long"
      }
    ]
  }
}
```

---

## Security Best Practices

### Token Storage

**iOS (Swift):**
```swift
// Store in Keychain
let keychain = KeychainSwift()
keychain.set(accessToken, forKey: "access_token")
keychain.set(refreshToken, forKey: "refresh_token")
```

**Android (Kotlin):**
```kotlin
// Store in EncryptedSharedPreferences
val sharedPreferences = EncryptedSharedPreferences.create(
    "auth_prefs",
    masterKey,
    context,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
sharedPreferences.edit()
    .putString("access_token", accessToken)
    .putString("refresh_token", refreshToken)
    .apply()
```

**React Native:**
```javascript
// Use react-native-keychain
import * as Keychain from 'react-native-keychain';

await Keychain.setGenericPassword('auth', JSON.stringify({
  accessToken,
  refreshToken
}));
```

### Request Headers

Always include the access token in authenticated requests:

```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};
```

### Rate Limiting

Implement exponential backoff for rate limit errors:

```javascript
async function makeAuthRequest(url, data, retries = 3) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.status === 429 && retries > 0) {
      const waitTime = Math.pow(2, 4 - retries) * 1000; // 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return makeAuthRequest(url, data, retries - 1);
    }
    
    return response.json();
  } catch (error) {
    throw error;
  }
}
```

### OTP Security

1. **Never log OTP values in production**
2. **Implement UI for OTP input:**
   - Auto-detect SMS on Android
   - Use SMS autofill on iOS
   - Provide manual entry option
3. **Clear OTP input after failed attempts**
4. **Show remaining attempts to user**
5. **Implement resend cooldown (30-60 seconds)**

### Password Requirements

For email/password authentication:
- Minimum 8 characters
- Recommend: Mix of uppercase, lowercase, numbers, special characters
- Implement password strength indicator in UI
- Never store passwords in plain text

### Token Refresh Strategy

```javascript
// Refresh token before it expires
async function ensureValidToken() {
  const tokenAge = Date.now() - lastTokenRefresh;
  const REFRESH_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  if (tokenAge > REFRESH_THRESHOLD) {
    const { access_token, refresh_token } = await refreshToken();
    await storeTokens(access_token, refresh_token);
    lastTokenRefresh = Date.now();
  }
}
```

---

## Complete Integration Example

### React Native Example

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

class AuthService {
  constructor() {
    this.baseURL = 'https://your-api-domain.com/api/auth';
  }

  // OTP Authentication Flow
  async sendOTP(phone) {
    const response = await fetch(`${this.baseURL}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data;
  }

  async verifyOTP(phone, otp, firstName, lastName) {
    const response = await fetch(`${this.baseURL}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        otp,
        first_name: firstName,
        last_name: lastName
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    // Store tokens securely
    await this.storeTokens(
      data.data.tokens.access_token,
      data.data.tokens.refresh_token
    );
    
    // Store user data
    await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
    
    return data.data;
  }

  async storeTokens(accessToken, refreshToken) {
    await Keychain.setGenericPassword('auth', JSON.stringify({
      accessToken,
      refreshToken,
      timestamp: Date.now()
    }));
  }

  async getAccessToken() {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      const { accessToken } = JSON.parse(credentials.password);
      return accessToken;
    }
    return null;
  }

  async getProfile() {
    const accessToken = await this.getAccessToken();
    
    const response = await fetch(`${this.baseURL}/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data.user;
  }

  async logout() {
    const accessToken = await this.getAccessToken();
    
    // Call logout endpoint
    await fetch(`${this.baseURL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Clear local storage
    await Keychain.resetGenericPassword();
    await AsyncStorage.removeItem('user');
  }
}

export default new AuthService();
```

### Usage in Components

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AuthService from './services/AuthService';

function OTPLoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOTP] = useState('');
  const [otpSent, setOTPSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      await AuthService.sendOTP(phone);
      setOTPSent(true);
      Alert.alert('Success', 'OTP sent to your phone');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const result = await AuthService.verifyOTP(phone, otp);
      
      if (result.is_new_user) {
        // Navigate to profile completion
        navigation.navigate('CompleteProfile');
      } else {
        // Navigate to home
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      
      {!otpSent ? (
        <Button
          title="Send OTP"
          onPress={handleSendOTP}
          disabled={loading}
        />
      ) : (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOTP}
            keyboardType="number-pad"
            maxLength={6}
          />
          <Button
            title="Verify OTP"
            onPress={handleVerifyOTP}
            disabled={loading}
          />
        </>
      )}
    </View>
  );
}
```

---

## Testing

### Development Mode

In development, OTP is included in the response for easy testing:

```json
{
  "success": true,
  "data": {
    "phone": "+1234567890",
    "expires_in": 300,
    "otp": "123456"
  }
}
```

### Test Credentials

For email/password testing, create test accounts using the register endpoint.

### Postman Collection

Example requests for testing:

```bash
# Send OTP
curl -X POST https://your-api-domain.com/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'

# Verify OTP
curl -X POST https://your-api-domain.com/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "otp": "123456",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Get Profile
curl -X GET https://your-api-domain.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Support

For API issues or questions:
- Check error codes and messages in responses
- Review rate limiting headers
- Ensure proper token storage and handling
- Verify request payload matches schemas

---

**Last Updated:** November 2024  
**API Version:** 1.0  
**Document Version:** 1.0
