# Outlet API Documentation for Mobile Developers

Complete guide for implementing outlet/location features in your mobile application.

## Base URL
```
https://localhost:5050/api/v1
```

## Authentication
Most outlet endpoints are **PUBLIC** (no authentication required). Only admin endpoints require authentication.

## Rate Limiting
- 100 requests per 15 minutes per IP
- Exceeding limit returns `RATE_LIMIT_EXCEEDED` error

---

## Table of Contents
1. [Public Outlet Endpoints](#public-outlet-endpoints)
2. [Location-Based Services](#location-based-services)
3. [Outlet Details](#outlet-details)
4. [Data Models](#data-models)
5. [Code Examples](#code-examples)
6. [Best Practices](#best-practices)

---

## Public Outlet Endpoints

### Overview
These endpoints are available without authentication and are designed for customer-facing mobile apps.

---

### 1. Get Nearby Outlets
Find outlets near a specific location.

**Endpoint:** `GET /api/v1/outlets/nearby`

**Access:** Public (No authentication required)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latitude | number | Yes | User's latitude (-90 to 90) |
| longitude | number | Yes | User's longitude (-180 to 180) |
| radius | number | No | Search radius in km (default: 10) |

**Example Request:**
```
GET /api/v1/outlets/nearby?latitude=28.6692&longitude=77.4538&radius=15
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "outlets": [
      {
        "id": "outlet_abc123",
        "name": "Rekha's Kitchen - Ghaziabad",
        "address": {
          "street": "123 Main Road",
          "city": "Ghaziabad",
          "state": "Uttar Pradesh",
          "zip_code": "201010"
        },
        "phone": "+919876543210",
        "distance": 2.5,
        "service_radius": 10,
        "is_serviceable": true,
        "coordinates": {
          "latitude": 28.6692,
          "longitude": 77.4538
        },
        "operating_hours": {
          "monday": {
            "open": "09:00",
            "close": "22:00",
            "is_closed": false
          },
          "tuesday": {
            "open": "09:00",
            "close": "22:00",
            "is_closed": false
          },
          "wednesday": {
            "open": "09:00",
            "close": "22:00",
            "is_closed": false
          },
          "thursday": {
            "open": "09:00",
            "close": "22:00",
            "is_closed": false
          },
          "friday": {
            "open": "09:00",
            "close": "22:00",
            "is_closed": false
          },
          "saturday": {
            "open": "09:00",
            "close": "23:00",
            "is_closed": false
          },
          "sunday": {
            "open": "10:00",
            "close": "23:00",
            "is_closed": false
          }
        },
        "rating": 4.5,
        "total_orders": 1250
      },
      {
        "id": "outlet_def456",
        "name": "Rekha's Kitchen - Noida",
        "address": {
          "street": "456 Sector 18",
          "city": "Noida",
          "state": "Uttar Pradesh",
          "zip_code": "201301"
        },
        "phone": "+919876543211",
        "distance": 8.3,
        "service_radius": 10,
        "is_serviceable": true,
        "coordinates": {
          "latitude": 28.5706,
          "longitude": 77.3272
        },
        "operating_hours": {
          "monday": {
            "open": "09:00",
            "close": "22:00",
            "is_closed": false
          }
        },
        "rating": 4.7,
        "total_orders": 2100
      }
    ],
    "search_location": {
      "latitude": 28.6692,
      "longitude": 77.4538
    },
    "search_radius": 15,
    "total": 2
  }
}
```

**Important Notes:**
- Outlets are sorted by distance (nearest first)
- `is_serviceable` indicates if the location is within the outlet's service radius
- `distance` is in kilometers
- Only active outlets are returned

**Error Responses:**
- `400 VALIDATION_ERROR` - Invalid coordinates
- `500 INTERNAL_ERROR` - Server error

---

### 2. Check Serviceability
Check if delivery is available at a specific location.

**Endpoint:** `POST /api/v1/outlets/check-serviceability`

**Access:** Public (No authentication required)

**Request Body:**
```json
{
  "latitude": 28.6692,
  "longitude": 77.4538
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| latitude | number | Yes | Location latitude (-90 to 90) |
| longitude | number | Yes | Location longitude (-180 to 180) |

**Success Response (200) - Serviceable:**
```json
{
  "success": true,
  "data": {
    "serviceable": true,
    "primary_outlet": {
      "outlet_id": "outlet_abc123",
      "outlet_name": "Rekha's Kitchen - Ghaziabad",
      "distance": 2.5,
      "estimated_time": 35,
      "address": {
        "street": "123 Main Road",
        "city": "Ghaziabad",
        "state": "Uttar Pradesh",
        "zip_code": "201010"
      }
    },
    "all_outlets": [
      {
        "outlet_id": "outlet_abc123",
        "outlet_name": "Rekha's Kitchen - Ghaziabad",
        "distance": 2.5,
        "estimated_time": 35,
        "address": {
          "street": "123 Main Road",
          "city": "Ghaziabad",
          "state": "Uttar Pradesh",
          "zip_code": "201010"
        }
      },
      {
        "outlet_id": "outlet_def456",
        "outlet_name": "Rekha's Kitchen - Noida",
        "distance": 8.3,
        "estimated_time": 50,
        "address": {
          "street": "456 Sector 18",
          "city": "Noida",
          "state": "Uttar Pradesh",
          "zip_code": "201301"
        }
      }
    ],
    "total_outlets": 2,
    "message": "Delivery available at your location"
  }
}
```

**Success Response (200) - Not Serviceable:**
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

**Important Notes:**
- `primary_outlet` is the nearest outlet that can service the location
- `estimated_time` is in minutes (includes preparation + delivery time)
- `all_outlets` are sorted by distance
- Use this before allowing users to place orders

**Error Responses:**
- `400 VALIDATION_ERROR` - Invalid or missing coordinates
- `500 INTERNAL_ERROR` - Server error

---

### 3. Get Service Areas
Get all cities and regions where service is available.

**Endpoint:** `GET /api/v1/outlets/service-areas`

**Access:** Public (No authentication required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "service_areas": {
      "cities": [
        "Delhi",
        "Ghaziabad",
        "Greater Noida",
        "Noida"
      ],
      "states": [
        "Delhi",
        "Uttar Pradesh"
      ],
      "outlets": [
        {
          "id": "outlet_abc123",
          "name": "Rekha's Kitchen - Ghaziabad",
          "city": "Ghaziabad",
          "state": "Uttar Pradesh",
          "service_radius": 10,
          "coordinates": {
            "latitude": 28.6692,
            "longitude": 77.4538
          }
        },
        {
          "id": "outlet_def456",
          "name": "Rekha's Kitchen - Noida",
          "city": "Noida",
          "state": "Uttar Pradesh",
          "service_radius": 10,
          "coordinates": {
            "latitude": 28.5706,
            "longitude": 77.3272
          }
        }
      ]
    },
    "total_cities": 4,
    "total_outlets": 2
  }
}
```

**Use Cases:**
- Display service areas on landing page
- Show "Coming Soon" for non-serviceable areas
- City/location selector in app
- Marketing and expansion planning

**Error Responses:**
- `500 INTERNAL_ERROR` - Server error

---

### 4. Get Public Outlet Details
Get detailed information about a specific outlet.

**Endpoint:** `GET /api/v1/outlets/public/:outletId`

**Access:** Public (No authentication required)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| outletId | string | Outlet ID |

**Example Request:**
```
GET /api/v1/outlets/public/outlet_abc123
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "outlet": {
      "id": "outlet_abc123",
      "name": "Rekha's Kitchen - Ghaziabad",
      "address": {
        "street": "123 Main Road",
        "city": "Ghaziabad",
        "state": "Uttar Pradesh",
        "zip_code": "201010"
      },
      "phone": "+919876543210",
      "email": "ghaziabad@rekhaskitchen.com",
      "coordinates": {
        "latitude": 28.6692,
        "longitude": 77.4538
      },
      "service_radius": 10,
      "operating_hours": {
        "monday": {
          "open": "09:00",
          "close": "22:00",
          "is_closed": false
        },
        "tuesday": {
          "open": "09:00",
          "close": "22:00",
          "is_closed": false
        },
        "wednesday": {
          "open": "09:00",
          "close": "22:00",
          "is_closed": false
        },
        "thursday": {
          "open": "09:00",
          "close": "22:00",
          "is_closed": false
        },
        "friday": {
          "open": "09:00",
          "close": "22:00",
          "is_closed": false
        },
        "saturday": {
          "open": "09:00",
          "close": "23:00",
          "is_closed": false
        },
        "sunday": {
          "open": "10:00",
          "close": "23:00",
          "is_closed": false
        }
      },
      "average_rating": 4.5,
      "total_orders": 1250,
      "avg_preparation_time": 20,
      "is_accepting_orders": true
    }
  }
}
```

**Important Notes:**
- Only returns active outlets
- `avg_preparation_time` is in minutes
- `is_accepting_orders` indicates if outlet is currently accepting new orders
- Use this to show outlet details page in app

**Error Responses:**
- `404 NOT_FOUND` - Outlet not found or inactive
- `500 INTERNAL_ERROR` - Server error

---

## Location-Based Services

### How Location Services Work

1. **Get User Location** → Use device GPS
2. **Check Serviceability** → Verify delivery availability
3. **Find Nearby Outlets** → Show available outlets
4. **Select Outlet** → User chooses preferred outlet
5. **Place Order** → Order is sent to selected outlet

---

## Data Models

### Outlet Object
```typescript
interface Outlet {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
  };
  phone: string;
  email: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  service_radius: number; // in kilometers
  operating_hours: OperatingHours;
  average_rating: number;
  total_orders: number;
  avg_preparation_time: number; // in minutes
  is_accepting_orders: boolean;
}
```

### Operating Hours Object
```typescript
interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface DaySchedule {
  open: string; // "HH:MM" format (24-hour)
  close: string; // "HH:MM" format (24-hour)
  is_closed: boolean;
}
```

### Nearby Outlet Object
```typescript
interface NearbyOutlet extends Outlet {
  distance: number; // in kilometers
  is_serviceable: boolean;
}
```

### Serviceability Response
```typescript
interface ServiceabilityCheck {
  serviceable: boolean;
  primary_outlet: {
    outlet_id: string;
    outlet_name: string;
    distance: number;
    estimated_time: number; // in minutes
    address: Address;
  } | null;
  all_outlets: Array<{
    outlet_id: string;
    outlet_name: string;
    distance: number;
    estimated_time: number;
    address: Address;
  }>;
  total_outlets: number;
  message: string;
}
```

---

## Code Examples

### React Native - Complete Outlet Integration

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';

const OutletSelection = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [serviceable, setServiceable] = useState(null);
  const [nearbyOutlets, setNearbyOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLocationAndServiceability();
  }, []);

  const checkLocationAndServiceability = async () => {
    try {
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const coords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude
      };

      setLocation(coords);

      // Check serviceability
      const serviceResponse = await fetch(
        'https://localhost:5050/api/v1/outlets/check-serviceability',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(coords)
        }
      );

      const serviceResult = await serviceResponse.json();

      if (serviceResult.success) {
        setServiceable(serviceResult.data.serviceable);

        if (serviceResult.data.serviceable) {
          // Get nearby outlets
          await fetchNearbyOutlets(coords);
        } else {
          Alert.alert(
            'Not Serviceable',
            serviceResult.data.message
          );
        }
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyOutlets = async (coords) => {
    try {
      const response = await fetch(
        `https://localhost:5050/api/v1/outlets/nearby?latitude=${coords.latitude}&longitude=${coords.longitude}&radius=15`
      );

      const result = await response.json();

      if (result.success) {
        setNearbyOutlets(result.data.outlets);
      }
    } catch (error) {
      console.error('Fetch outlets error:', error);
    }
  };

  const selectOutlet = async (outlet) => {
    // Save selected outlet to context/state
    navigation.navigate('Menu', { outletId: outlet.id });
  };

  const isOutletOpen = (operatingHours) => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    const todayHours = operatingHours[dayName];
    
    if (todayHours.is_closed) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const renderOutlet = ({ item }) => {
    const isOpen = isOutletOpen(item.operating_hours);

    return (
      <TouchableOpacity
        style={styles.outletCard}
        onPress={() => selectOutlet(item)}
        disabled={!item.is_serviceable || !isOpen}
      >
        <View style={styles.outletHeader}>
          <Text style={styles.outletName}>{item.name}</Text>
          <View style={[
            styles.statusBadge,
            isOpen ? styles.openBadge : styles.closedBadge
          ]}>
            <Text style={styles.statusText}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        <Text style={styles.outletAddress}>
          {item.address.street}, {item.address.city}
        </Text>

        <View style={styles.outletInfo}>
          <Text style={styles.infoText}>
            📍 {item.distance.toFixed(1)} km away
          </Text>
          <Text style={styles.infoText}>
            ⭐ {item.rating.toFixed(1)} ({item.total_orders} orders)
          </Text>
        </View>

        {!item.is_serviceable && (
          <Text style={styles.notServiceable}>
            Outside delivery area
          </Text>
        )}

        {item.is_serviceable && isOpen && (
          <View style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Select Outlet</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Finding nearby outlets...</Text>
      </View>
    );
  }

  if (!serviceable) {
    return (
      <View style={styles.notServiceableContainer}>
        <Text style={styles.notServiceableTitle}>
          Not Available Yet
        </Text>
        <Text style={styles.notServiceableText}>
          We don't deliver to your location yet. We're expanding soon!
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={checkLocationAndServiceability}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Outlet</Text>
        <Text style={styles.subtitle}>
          {nearbyOutlets.length} outlet(s) near you
        </Text>
      </View>

      <FlatList
        data={nearbyOutlets}
        renderItem={renderOutlet}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  notServiceableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  notServiceableTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  notServiceableText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  list: {
    padding: 16
  },
  outletCard: {
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
  outletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  outletName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  openBadge: {
    backgroundColor: '#28A745'
  },
  closedBadge: {
    backgroundColor: '#DC3545'
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  outletAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  outletInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  infoText: {
    fontSize: 14,
    color: '#666'
  },
  notServiceable: {
    color: '#DC3545',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8
  },
  selectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default OutletSelection;
```

---

### Flutter - Outlet Service

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';

class OutletService {
  final String baseURL = 'https://localhost:5050/api/v1';

  // Check serviceability
  Future<Map<String, dynamic>> checkServiceability(
    double latitude,
    double longitude
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseURL/outlets/check-serviceability'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'latitude': latitude,
          'longitude': longitude,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to check serviceability');
      }
    } catch (error) {
      print('Serviceability check error: $error');
      rethrow;
    }
  }

  // Get nearby outlets
  Future<List<dynamic>> getNearbyOutlets(
    double latitude,
    double longitude,
    {double radius = 15}
  ) async {
    try {
      final response = await http.get(
        Uri.parse(
          '$baseURL/outlets/nearby?latitude=$latitude&longitude=$longitude&radius=$radius'
        ),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data']['outlets'];
      } else {
        throw Exception('Failed to get nearby outlets');
      }
    } catch (error) {
      print('Get nearby outlets error: $error');
      rethrow;
    }
  }

  // Get outlet details
  Future<Map<String, dynamic>> getOutletDetails(String outletId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseURL/outlets/public/$outletId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data']['outlet'];
      } else {
        throw Exception('Failed to get outlet details');
      }
    } catch (error) {
      print('Get outlet details error: $error');
      rethrow;
    }
  }

  // Get service areas
  Future<Map<String, dynamic>> getServiceAreas() async {
    try {
      final response = await http.get(
        Uri.parse('$baseURL/outlets/service-areas'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data']['service_areas'];
      } else {
        throw Exception('Failed to get service areas');
      }
    } catch (error) {
      print('Get service areas error: $error');
      rethrow;
    }
  }

  // Get current location
  Future<Position> getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Location services are disabled');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Location permissions are denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception('Location permissions are permanently denied');
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high
    );
  }

  // Check if outlet is open
  bool isOutletOpen(Map<String, dynamic> operatingHours) {
    final now = DateTime.now();
    final dayName = _getDayName(now.weekday).toLowerCase();
    final currentTime = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';

    final todayHours = operatingHours[dayName];
    
    if (todayHours == null || todayHours['is_closed'] == true) {
      return false;
    }

    return currentTime.compareTo(todayHours['open']) >= 0 &&
           currentTime.compareTo(todayHours['close']) <= 0;
  }

  String _getDayName(int weekday) {
    const days = [
      'monday', 'tuesday', 'wednesday', 'thursday',
      'friday', 'saturday', 'sunday'
    ];
    return days[weekday - 1];
  }
}
```

---

## Best Practices

### 1. Location Permissions
- Request location permission before accessing outlet features
- Explain why location is needed
- Provide fallback for users who deny permission (manual location entry)

### 2. Caching
- Cache nearby outlets for 5-10 minutes
- Cache service areas for 24 hours
- Refresh when user changes location significantly

### 3. Error Handling
- Handle location permission denials gracefully
- Show user-friendly messages for network errors
- Provide retry options

### 4. User Experience
- Show loading states while fetching outlets
- Display distance and estimated delivery time
- Highlight nearest/recommended outlet
- Show outlet status (open/closed)
- Filter out non-serviceable outlets or mark them clearly

### 5. Performance
- Use debouncing for location updates
- Limit search radius to reasonable distance (10-15 km)
- Paginate outlet lists if many results

### 6. Offline Support
- Cache last known serviceable outlets
- Show cached data with "offline" indicator
- Queue serviceability checks for when online

---

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid coordinates or parameters |
| `NOT_FOUND` | 404 | Outlet not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Testing Checklist

- [ ] Location permission flow
- [ ] Serviceability check with valid location
- [ ] Serviceability check with non-serviceable location
- [ ] Nearby outlets with different radii
- [ ] Outlet details page
- [ ] Operating hours display
- [ ] Distance calculation accuracy
- [ ] Offline behavior
- [ ] Error handling
- [ ] Loading states

---

## Support

For issues or questions:
- Check error messages in response
- Verify coordinates are valid
- Ensure location permissions are granted
- Contact backend team for API issues
