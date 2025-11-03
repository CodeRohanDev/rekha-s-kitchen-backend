# Customer Address API Documentation for Mobile Developers

Complete guide for implementing address management in your mobile application.

## Base URL
```
https://localhost:5050/api/v1
```

## Authentication
All address endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting
- 100 requests per 15 minutes per user
- Exceeding limit returns `RATE_LIMIT_EXCEEDED` error

---

## Table of Contents
1. [Address Management](#address-management)
2. [Address Validation](#address-validation)
3. [Location Services](#location-services)
4. [Error Handling](#error-handling)
5. [Data Models](#data-models)
6. [Code Examples](#code-examples)
7. [Best Practices](#best-practices)

---

## Address Management

### Overview
Customers can save multiple delivery addresses with the following features:
- Add, update, and delete addresses
- Set default address
- Store coordinates for accurate delivery
- Label addresses (Home, Work, Other)
- Add delivery instructions

---

### 1. Get User Profile (Including Addresses)
Retrieve user profile with all saved addresses.

**Endpoint:** `GET /api/v1/auth/profile`

**Access:** Authenticated customers only

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "customer",
      "is_active": true,
      "is_verified": true
    },
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-15",
      "profile_image": "https://...",
      "addresses": [
        {
          "id": "addr_abc123",
          "label": "Home",
          "street": "123 Main Street",
          "apartment": "Apt 4B",
          "city": "New York",
          "state": "NY",
          "zip_code": "10001",
          "country": "USA",
          "coordinates": {
            "latitude": 40.7128,
            "longitude": -74.0060
          },
          "delivery_instructions": "Ring doorbell twice",
          "is_default": true,
          "is_for_someone_else": false,
          "created_at": "2025-10-01T00:00:00Z"
        },
        {
          "id": "addr_def456",
          "label": "Work",
          "street": "456 Business Ave",
          "apartment": "Suite 200",
          "city": "New York",
          "state": "NY",
          "zip_code": "10002",
          "country": "USA",
          "coordinates": {
            "latitude": 40.7589,
            "longitude": -73.9851
          },
          "delivery_instructions": "Leave at reception",
          "is_default": false,
          "is_for_someone_else": true,
          "receiver_name": "Sarah Johnson",
          "receiver_phone": "+1234567890",
          "created_at": "2025-10-05T00:00:00Z"
        }
      ]
    }
  }
}
```

---

### 2. Add New Address
Add a new delivery address to user profile.

**Endpoint:** `POST /api/v1/users/addresses`

**Access:** Authenticated customers only

**Request Body:**
```json
{
  "label": "Home",
  "street": "123 Main Street",
  "apartment": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "country": "USA",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "delivery_instructions": "Ring doorbell twice",
  "is_default": true,
  "is_for_someone_else": false,
  "receiver_name": "Jane Doe",
  "receiver_phone": "+1234567891"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | Yes | Address label: "Home", "Work", "Other" |
| street | string | Yes | Street address |
| apartment | string | No | Apartment/Suite number |
| city | string | Yes | City name |
| state | string | Yes | State/Province |
| zip_code | string | Yes | Postal/ZIP code |
| country | string | Yes | Country name |
| coordinates | object | Yes | GPS coordinates |
| coordinates.latitude | number | Yes | Latitude (-90 to 90) |
| coordinates.longitude | number | Yes | Longitude (-180 to 180) |
| delivery_instructions | string | No | Special delivery notes |
| is_default | boolean | No | Set as default address |
| is_for_someone_else | boolean | No | Ordering for someone else? (default: false) |
| receiver_name | string | Conditional* | Receiver's name (required if is_for_someone_else is true) |
| receiver_phone | string | Conditional* | Receiver's phone (required if is_for_someone_else is true) |

**Note:** `receiver_name` and `receiver_phone` are required only when `is_for_someone_else` is set to `true`.

**Success Response (201):**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "address": {
      "id": "addr_abc123",
      "label": "Home",
      "street": "123 Main Street",
      "apartment": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "country": "USA",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "delivery_instructions": "Ring doorbell twice",
      "is_default": true,
      "is_for_someone_else": false,
      "receiver_name": "Jane Doe",
      "receiver_phone": "+1234567891",
      "created_at": "2025-10-27T10:30:00Z"
    }
  }
}
```

**Important Notes:**
- If this is the first address, it's automatically set as default
- Setting `is_default: true` removes default status from other addresses
- Coordinates are required for delivery fee calculation and tracking
- Maximum 10 addresses per user

**Error Responses:**
- `400 VALIDATION_ERROR` - Invalid input data
- `404 NOT_FOUND` - User profile not found
- `500 INTERNAL_ERROR` - Server error

---

### 3. Update Address
Update an existing address.

**Endpoint:** `PUT /api/v1/users/addresses/:addressId`

**Access:** Authenticated customers only

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| addressId | string | Address ID to update |

**Request Body:**
```json
{
  "label": "Home",
  "street": "123 Main Street",
  "apartment": "Apt 5C",
  "delivery_instructions": "Ring doorbell three times",
  "is_default": true,
  "is_for_someone_else": true,
  "receiver_name": "John Smith",
  "receiver_phone": "+1234567892"
}
```

**Note:** You can update any field(s). Only include fields you want to change. If you set `is_for_someone_else` to `true`, you must provide `receiver_name` and `receiver_phone`.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "address": {
      "id": "addr_abc123",
      "label": "Home",
      "street": "123 Main Street",
      "apartment": "Apt 5C",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "country": "USA",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "delivery_instructions": "Ring doorbell three times",
      "is_default": true,
      "created_at": "2025-10-01T00:00:00Z",
      "updated_at": "2025-10-27T10:45:00Z"
    }
  }
}
```

**Error Responses:**
- `404 NOT_FOUND` - Address not found
- `400 VALIDATION_ERROR` - Invalid input data
- `500 INTERNAL_ERROR` - Server error

---

### 4. Delete Address
Remove an address from user profile.

**Endpoint:** `DELETE /api/v1/users/addresses/:addressId`

**Access:** Authenticated customers only

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| addressId | string | Address ID to delete |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

**Important Notes:**
- If deleted address was default and other addresses exist, the first remaining address becomes default
- Cannot delete if it's the only address and there are pending orders
- Deleted addresses cannot be recovered

**Error Responses:**
- `404 NOT_FOUND` - Address not found
- `500 INTERNAL_ERROR` - Server error

---

## Address Validation

### 5. Validate Address Format
Client-side validation rules for address fields.

**Validation Rules:**

```javascript
const addressValidation = {
  label: {
    required: true,
    enum: ['Home', 'Work', 'Other'],
    message: 'Please select a valid address label'
  },
  street: {
    required: true,
    minLength: 5,
    maxLength: 200,
    message: 'Street address must be between 5 and 200 characters'
  },
  apartment: {
    required: false,
    maxLength: 50,
    message: 'Apartment/Suite must be less than 50 characters'
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Please enter a valid city name'
  },
  state: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Please enter a valid state/province'
  },
  zip_code: {
    required: true,
    pattern: /^[0-9]{5,10}$/,
    message: 'Please enter a valid ZIP/postal code'
  },
  coordinates: {
    required: true,
    latitude: {
      min: -90,
      max: 90,
      message: 'Invalid latitude'
    },
    longitude: {
      min: -180,
      max: 180,
      message: 'Invalid longitude'
    }
  },
  delivery_instructions: {
    required: false,
    maxLength: 500,
    message: 'Delivery instructions must be less than 500 characters'
  },
  is_for_someone_else: {
    required: false,
    type: 'boolean',
    default: false,
    message: 'Must be a boolean value'
  },
  receiver_name: {
    required: false,
    conditionalRequired: 'is_for_someone_else',
    minLength: 2,
    maxLength: 100,
    message: 'Receiver name is required when ordering for someone else'
  },
  receiver_phone: {
    required: false,
    conditionalRequired: 'is_for_someone_else',
    pattern: /^\+?[\d\s\-\(\)]{10,}$/,
    message: 'Valid receiver phone is required when ordering for someone else'
  }
};
```

---

## Location Services

### 6. Get Current Location
Use device GPS to get current coordinates.

**Implementation:**

```javascript
// React Native - Expo Location
import * as Location from 'expo-location';

async function getCurrentLocation() {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
}
```

```dart
// Flutter - Geolocator
import 'package:geolocator/geolocator.dart';

Future<Map<String, double>> getCurrentLocation() async {
  try {
    // Check permission
    LocationPermission permission = await Geolocator.checkPermission();
    
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Location permission denied');
      }
    }

    // Get current position
    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high
    );

    return {
      'latitude': position.latitude,
      'longitude': position.longitude
    };
  } catch (error) {
    print('Error getting location: $error');
    rethrow;
  }
}
```

---

### 7. Reverse Geocoding
Convert coordinates to human-readable address.

**Using Google Maps Geocoding API:**

```javascript
async function reverseGeocode(latitude, longitude) {
  const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const components = result.address_components;

      // Extract address components
      const address = {
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        formatted_address: result.formatted_address
      };

      components.forEach(component => {
        if (component.types.includes('street_number')) {
          address.street = component.long_name + ' ';
        }
        if (component.types.includes('route')) {
          address.street += component.long_name;
        }
        if (component.types.includes('locality')) {
          address.city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          address.state = component.short_name;
        }
        if (component.types.includes('postal_code')) {
          address.zip_code = component.long_name;
        }
        if (component.types.includes('country')) {
          address.country = component.long_name;
        }
      });

      return address;
    }

    throw new Error('No results found');
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
}
```

---

### 8. Address Autocomplete
Implement address search with autocomplete.

**Using Google Places Autocomplete:**

```javascript
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const AddressAutocomplete = ({ onSelectAddress }) => {
  return (
    <GooglePlacesAutocomplete
      placeholder='Search for address'
      onPress={(data, details = null) => {
        // Get place details
        const placeId = data.place_id;
        
        // Fetch full details including coordinates
        fetchPlaceDetails(placeId).then(address => {
          onSelectAddress(address);
        });
      }}
      query={{
        key: 'YOUR_GOOGLE_MAPS_API_KEY',
        language: 'en',
        components: 'country:us', // Restrict to specific country
      }}
      fetchDetails={true}
      styles={{
        textInput: {
          height: 44,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          paddingHorizontal: 12
        }
      }}
    />
  );
};

async function fetchPlaceDetails(placeId) {
  const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK') {
    const place = data.result;
    const components = place.address_components;

    return {
      street: extractComponent(components, 'route'),
      city: extractComponent(components, 'locality'),
      state: extractComponent(components, 'administrative_area_level_1'),
      zip_code: extractComponent(components, 'postal_code'),
      country: extractComponent(components, 'country'),
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      }
    };
  }

  throw new Error('Failed to fetch place details');
}

function extractComponent(components, type) {
  const component = components.find(c => c.types.includes(type));
  return component ? component.long_name : '';
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
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Address not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Handling Example

```javascript
async function addAddress(addressData) {
  try {
    const response = await fetch('https://localhost:5050/api/v1/users/addresses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    });

    const result = await response.json();

    if (!result.success) {
      switch (result.error.code) {
        case 'VALIDATION_ERROR':
          showError('Please check your address details');
          break;
        case 'NOT_FOUND':
          showError('User profile not found');
          break;
        case 'RATE_LIMIT_EXCEEDED':
          showError('Too many requests. Please try again later');
          break;
        default:
          showError('Failed to add address');
      }
      return null;
    }

    return result.data.address;
  } catch (error) {
    showError('Network error. Please check your connection');
    return null;
  }
}
```

---

## Data Models

### Address Object
```typescript
interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  delivery_instructions?: string;
  is_default: boolean;
  is_for_someone_else: boolean;
  receiver_name?: string;
  receiver_phone?: string;
  created_at: string;
  updated_at?: string;
}
```

### User Profile with Addresses
```typescript
interface UserProfile {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  profile_image?: string;
  addresses: Address[];
}
```

---

## Code Examples

### React Native - Complete Address Management

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddressManagement = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      const response = await fetch(
        'https://localhost:5050/api/v1/auth/profile',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setAddresses(result.data.profile.addresses || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('auth_token');
              
              const response = await fetch(
                `https://localhost:5050/api/v1/users/addresses/${addressId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );

              const result = await response.json();
              
              if (result.success) {
                Alert.alert('Success', 'Address deleted successfully');
                fetchAddresses();
              } else {
                Alert.alert('Error', result.error.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          }
        }
      ]
    );
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      const response = await fetch(
        `https://localhost:5050/api/v1/users/addresses/${addressId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ is_default: true })
        }
      );

      const result = await response.json();
      
      if (result.success) {
        fetchAddresses();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update address');
    }
  };

  const renderAddress = ({ item }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{item.label}</Text>
          {item.is_default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditAddress', { address: item })}
        >
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.addressText}>
        {item.street}
        {item.apartment && `, ${item.apartment}`}
      </Text>
      <Text style={styles.addressText}>
        {item.city}, {item.state} {item.zip_code}
      </Text>
      {item.delivery_instructions && (
        <Text style={styles.instructions}>
          📝 {item.delivery_instructions}
        </Text>
      )}

      <View style={styles.actions}>
        {!item.is_default && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setDefaultAddress(item.id)}
          >
            <Text style={styles.actionText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteAddress(item.id)}
        >
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAddress')}
        >
          <Text style={styles.addButtonText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No addresses saved</Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => navigation.navigate('AddAddress')}
          >
            <Text style={styles.addFirstButtonText}>Add Your First Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddress}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  list: {
    padding: 16
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8
  },
  defaultBadge: {
    backgroundColor: '#28A745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  defaultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  editButton: {
    color: '#007AFF',
    fontSize: 16
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  instructions: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center'
  },
  actionText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600'
  },
  deleteButton: {
    borderColor: '#DC3545'
  },
  deleteText: {
    color: '#DC3545'
  },
  loading: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#666'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default AddressManagement;
```

---

### Add/Edit Address Form Component

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddEditAddressScreen = ({ route, navigation }) => {
  const { address } = route.params || {};
  const isEdit = !!address;

  const [formData, setFormData] = useState({
    label: address?.label || 'Home',
    street: address?.street || '',
    apartment: address?.apartment || '',
    city: address?.city || '',
    state: address?.state || '',
    zip_code: address?.zip_code || '',
    country: address?.country || 'USA',
    coordinates: address?.coordinates || null,
    delivery_instructions: address?.delivery_instructions || '',
    is_default: address?.is_default || false
  });

  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      setFormData(prev => ({
        ...prev,
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      }));

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        setFormData(prev => ({
          ...prev,
          street: `${addr.street || ''} ${addr.streetNumber || ''}`.trim(),
          city: addr.city || '',
          state: addr.region || '',
          zip_code: addr.postalCode || '',
          country: addr.country || 'USA'
        }));
      }

      Alert.alert('Success', 'Location detected successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setGettingLocation(false);
    }
  };

  const validateForm = () => {
    if (!formData.street.trim()) {
      Alert.alert('Validation Error', 'Street address is required');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Validation Error', 'City is required');
      return false;
    }
    if (!formData.state.trim()) {
      Alert.alert('Validation Error', 'State is required');
      return false;
    }
    if (!formData.zip_code.trim()) {
      Alert.alert('Validation Error', 'ZIP code is required');
      return false;
    }
    if (!formData.coordinates) {
      Alert.alert('Validation Error', 'Please detect your location');
      return false;
    }
    return true;
  };

  const saveAddress = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const url = isEdit
        ? `https://localhost:5050/api/v1/users/addresses/${address.id}`
        : 'https://localhost:5050/api/v1/users/addresses';

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert(
          'Success',
          `Address ${isEdit ? 'updated' : 'added'} successfully`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Label Selection */}
        <Text style={styles.sectionTitle}>Address Type</Text>
        <View style={styles.labelButtons}>
          {['Home', 'Work', 'Other'].map(label => (
            <TouchableOpacity
              key={label}
              style={[
                styles.labelButton,
                formData.label === label && styles.labelButtonActive
              ]}
              onPress={() => setFormData({ ...formData, label })}
            >
              <Text
                style={[
                  styles.labelButtonText,
                  formData.label === label && styles.labelButtonTextActive
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location Detection */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={gettingLocation}
        >
          {gettingLocation ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
              {formData.coordinates && (
                <Text style={styles.locationDetected}>✓ Location detected</Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {/* Street Address */}
        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          value={formData.street}
          onChangeText={text => setFormData({ ...formData, street: text })}
          placeholder="123 Main Street"
        />

        {/* Apartment/Suite */}
        <Text style={styles.label}>Apartment/Suite (Optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.apartment}
          onChangeText={text => setFormData({ ...formData, apartment: text })}
          placeholder="Apt 4B, Suite 200"
        />

        {/* City */}
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          value={formData.city}
          onChangeText={text => setFormData({ ...formData, city: text })}
          placeholder="New York"
        />

        {/* State and ZIP */}
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={formData.state}
              onChangeText={text => setFormData({ ...formData, state: text })}
              placeholder="NY"
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={styles.input}
              value={formData.zip_code}
              onChangeText={text => setFormData({ ...formData, zip_code: text })}
              placeholder="10001"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Delivery Instructions */}
        <Text style={styles.label}>Delivery Instructions (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.delivery_instructions}
          onChangeText={text => setFormData({ ...formData, delivery_instructions: text })}
          placeholder="Ring doorbell twice, leave at door, etc."
          multiline
          numberOfLines={3}
        />

        {/* Set as Default */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData({ ...formData, is_default: !formData.is_default })}
        >
          <View style={[styles.checkbox, formData.is_default && styles.checkboxChecked]}>
            {formData.is_default && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Set as default address</Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveAddress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEdit ? 'Update Address' : 'Save Address'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  form: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  labelButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24
  },
  labelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    alignItems: 'center'
  },
  labelButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  labelButtonText: {
    fontSize: 14,
    color: '#666'
  },
  labelButtonTextActive: {
    color: 'white',
    fontWeight: '600'
  },
  locationButton: {
    backgroundColor: '#28A745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24
  },
  locationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  locationDetected: {
    color: 'white',
    fontSize: 12,
    marginTop: 4
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfWidth: {
    flex: 1
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333'
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default AddEditAddressScreen;
```

---

### Flutter Implementation

```dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:geolocator/geolocator.dart';

class AddressService {
  final String baseURL = 'https://localhost:5050/api/v1';

  Future<String?> getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<List<Address>> getAddresses() async {
    final token = await getAuthToken();
    
    final response = await http.get(
      Uri.parse('$baseURL/auth/profile'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        final addresses = data['data']['profile']['addresses'] as List;
        return addresses.map((addr) => Address.fromJson(addr)).toList();
      }
    }

    throw Exception('Failed to load addresses');
  }

  Future<Address> addAddress(Map<String, dynamic> addressData) async {
    final token = await getAuthToken();
    
    final response = await http.post(
      Uri.parse('$baseURL/users/addresses'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(addressData),
    );

    final data = jsonDecode(response.body);
    
    if (data['success']) {
      return Address.fromJson(data['data']['address']);
    }

    throw Exception(data['error']['message']);
  }

  Future<Address> updateAddress(String addressId, Map<String, dynamic> addressData) async {
    final token = await getAuthToken();
    
    final response = await http.put(
      Uri.parse('$baseURL/users/addresses/$addressId'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(addressData),
    );

    final data = jsonDecode(response.body);
    
    if (data['success']) {
      return Address.fromJson(data['data']['address']);
    }

    throw Exception(data['error']['message']);
  }

  Future<void> deleteAddress(String addressId) async {
    final token = await getAuthToken();
    
    final response = await http.delete(
      Uri.parse('$baseURL/users/addresses/$addressId'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    final data = jsonDecode(response.body);
    
    if (!data['success']) {
      throw Exception(data['error']['message']);
    }
  }
}

class Address {
  final String id;
  final String label;
  final String street;
  final String? apartment;
  final String city;
  final String state;
  final String zipCode;
  final String country;
  final Coordinates coordinates;
  final String? deliveryInstructions;
  final bool isDefault;

  Address({
    required this.id,
    required this.label,
    required this.street,
    this.apartment,
    required this.city,
    required this.state,
    required this.zipCode,
    required this.country,
    required this.coordinates,
    this.deliveryInstructions,
    required this.isDefault,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'],
      label: json['label'],
      street: json['street'],
      apartment: json['apartment'],
      city: json['city'],
      state: json['state'],
      zipCode: json['zip_code'],
      country: json['country'],
      coordinates: Coordinates.fromJson(json['coordinates']),
      deliveryInstructions: json['delivery_instructions'],
      isDefault: json['is_default'],
    );
  }
}

class Coordinates {
  final double latitude;
  final double longitude;

  Coordinates({required this.latitude, required this.longitude});

  factory Coordinates.fromJson(Map<String, dynamic> json) {
    return Coordinates(
      latitude: json['latitude'].toDouble(),
      longitude: json['longitude'].toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}
```

---

## Best Practices

### 1. Location Permissions
Always request location permissions before accessing GPS:

```javascript
// Check permission status first
const { status } = await Location.getForegroundPermissionsAsync();

if (status !== 'granted') {
  // Request permission
  const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
  
  if (newStatus !== 'granted') {
    // Show explanation and guide user to settings
    Alert.alert(
      'Location Permission Required',
      'Please enable location access in settings to use this feature',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ]
    );
    return;
  }
}
```

### 2. Coordinate Accuracy
Use high accuracy for address detection:

```javascript
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High,
  maximumAge: 10000, // Use cached location if less than 10 seconds old
  timeout: 15000 // Timeout after 15 seconds
});
```

### 3. Address Validation
Validate addresses before submission:

```javascript
function validateAddress(address) {
  const errors = [];

  if (!address.street || address.street.length < 5) {
    errors.push('Street address must be at least 5 characters');
  }

  if (!address.city || !/^[a-zA-Z\s]+$/.test(address.city)) {
    errors.push('Please enter a valid city name');
  }

  if (!address.zip_code || !/^\d{5,10}$/.test(address.zip_code)) {
    errors.push('Please enter a valid ZIP code');
  }

  if (!address.coordinates) {
    errors.push('Location coordinates are required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 4. Default Address Handling
Always ensure one default address:

```javascript
// When displaying addresses, sort by default first
const sortedAddresses = addresses.sort((a, b) => {
  if (a.is_default) return -1;
  if (b.is_default) return 1;
  return 0;
});
```

### 5. Offline Support
Cache addresses locally for offline access:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save to cache
await AsyncStorage.setItem('cached_addresses', JSON.stringify(addresses));

// Load from cache
const cached = await AsyncStorage.getItem('cached_addresses');
if (cached) {
  setAddresses(JSON.parse(cached));
}
```

### 6. Map Integration
Show address on map for verification:

```javascript
import MapView, { Marker } from 'react-native-maps';

<MapView
  style={{ height: 200 }}
  initialRegion={{
    latitude: address.coordinates.latitude,
    longitude: address.coordinates.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  }}
>
  <Marker
    coordinate={{
      latitude: address.coordinates.latitude,
      longitude: address.coordinates.longitude
    }}
    title={address.label}
    description={address.street}
  />
</MapView>
```

### 7. Error Recovery
Implement retry logic for failed requests:

```javascript
async function addAddressWithRetry(addressData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await addAddress(addressData);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## Testing Checklist

- [ ] Add new address with all fields
- [ ] Add address with minimal required fields
- [ ] Update existing address
- [ ] Delete address (not default)
- [ ] Delete default address (verify new default is set)
- [ ] Set address as default
- [ ] Test with GPS location detection
- [ ] Test with manual address entry
- [ ] Test address validation
- [ ] Test with no internet connection
- [ ] Test with 10+ addresses
- [ ] Test address autocomplete
- [ ] Test map integration
- [ ] Test delivery instructions field

---

## Support

For questions or issues:
- Backend Team: backend@yourcompany.com
- Mobile Support: mobile@yourcompany.com
- Documentation: https://docs.yourapi.com

---

**Last Updated:** October 27, 2025  
**API Version:** v1  
**Document Version:** 1.0.0
