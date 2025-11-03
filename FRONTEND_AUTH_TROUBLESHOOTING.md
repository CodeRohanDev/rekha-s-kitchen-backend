# Frontend Authentication Troubleshooting Guide

## Issue: "jwt malformed" Error

### Problem
The backend is returning tokens correctly, but the frontend is sending them incorrectly, causing "jwt malformed" errors.

---

## Backend Response Format

When you login successfully, the backend returns:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "XpvUlLyNQPt3goeq4sDG",
      "email": "admin@rekhaskitchen.in",
      "role": "super_admin",
      "profile": {}
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": null
    }
  }
}
```

---

## ❌ Common Mistakes

### 1. Sending the Entire Tokens Object
```javascript
// WRONG ❌
const token = response.data.tokens;
headers: {
  'Authorization': `Bearer ${token}`  // This sends the entire object!
}
```

### 2. Not Extracting access_token
```javascript
// WRONG ❌
localStorage.setItem('token', JSON.stringify(response.data.tokens));
// Later...
const token = localStorage.getItem('token');  // This is a JSON string!
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 3. Missing "Bearer" Prefix
```javascript
// WRONG ❌
headers: {
  'Authorization': token  // Missing "Bearer " prefix
}
```

---

## ✅ Correct Implementation

### Step 1: Extract Token from Response

```javascript
// After successful login
const loginResponse = await axios.post('/api/v1/auth/login', {
  email: 'admin@rekhaskitchen.in',
  password: 'password123'
});

// Extract the access_token correctly
const accessToken = loginResponse.data.data.tokens.access_token;
const refreshToken = loginResponse.data.data.tokens.refresh_token;

// Store tokens
localStorage.setItem('access_token', accessToken);
localStorage.setItem('refresh_token', refreshToken);

// Store user data
localStorage.setItem('user', JSON.stringify(loginResponse.data.data.user));
```

### Step 2: Use Token in API Calls

```javascript
// Get token from storage
const token = localStorage.getItem('access_token');

// Make authenticated request
const response = await axios.get('/api/v1/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Step 3: Setup Axios Interceptor (Recommended)

```javascript
// axios-config.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5050/api/v1'
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          'http://localhost:5050/api/v1/auth/refresh-token',
          { refresh_token: refreshToken }
        );

        const newAccessToken = response.data.data.access_token;
        localStorage.setItem('access_token', newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Step 4: Use in Components

```javascript
// Login.jsx
import api from './axios-config';

const handleLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Store tokens
    const { access_token, refresh_token } = response.data.data.tokens;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    // Store user
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    setError('Invalid email or password');
  }
};
```

```javascript
// Dashboard.jsx
import api from './axios-config';

const fetchProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    setUser(response.data.data.user);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
};
```

---

## Debugging Steps

### 1. Check What You're Sending

```javascript
// Before making request
const token = localStorage.getItem('access_token');
console.log('Token type:', typeof token);
console.log('Token value:', token);
console.log('Token length:', token?.length);

// Should output:
// Token type: string
// Token value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// Token length: 200+ (long string)
```

### 2. Check Authorization Header

```javascript
// Log the actual header being sent
axios.interceptors.request.use(config => {
  console.log('Authorization Header:', config.headers.Authorization);
  return config;
});

// Should output:
// Authorization Header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Verify Token Format

```javascript
const token = localStorage.getItem('access_token');

// Check if it's a valid JWT format (3 parts separated by dots)
const parts = token?.split('.');
console.log('Token parts:', parts?.length);  // Should be 3

// Check if it starts with expected JWT header
try {
  const header = JSON.parse(atob(parts[0]));
  console.log('JWT Header:', header);  // Should show { alg: 'HS256', typ: 'JWT' }
} catch (e) {
  console.error('Invalid token format!');
}
```

---

## React Context Example

```javascript
// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from './axios-config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    const { access_token, refresh_token } = response.data.data.tokens;
    const userData = response.data.data.user;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## Quick Fix Checklist

1. ✅ Extract `access_token` from `response.data.data.tokens.access_token`
2. ✅ Store as plain string, not JSON
3. ✅ Use `Bearer ${token}` format in Authorization header
4. ✅ Don't send the entire tokens object
5. ✅ Check token is a string, not an object
6. ✅ Verify token has 3 parts separated by dots

---

## Test Your Implementation

```javascript
// Test script
const testAuth = async () => {
  // 1. Login
  const loginRes = await fetch('http://localhost:5050/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@rekhaskitchen.in',
      password: 'your-password'
    })
  });
  
  const loginData = await loginRes.json();
  console.log('Login response:', loginData);
  
  // 2. Extract token
  const token = loginData.data.tokens.access_token;
  console.log('Token:', token);
  console.log('Token type:', typeof token);
  
  // 3. Use token
  const profileRes = await fetch('http://localhost:5050/api/v1/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const profileData = await profileRes.json();
  console.log('Profile response:', profileData);
};

testAuth();
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `jwt malformed` | Token is not a valid JWT string | Extract `access_token` correctly |
| `jwt must be provided` | Token is undefined/null | Check localStorage has token |
| `invalid token` | Token is corrupted | Re-login to get new token |
| `jwt expired` | Token has expired | Use refresh token (but yours never expire) |

---

## Summary

**The issue is in the frontend, not the backend!**

The backend is working correctly. The frontend needs to:
1. Extract `response.data.data.tokens.access_token`
2. Store it as a plain string
3. Send it as `Bearer ${token}` in Authorization header

Fix these three things and authentication will work! 🎉
