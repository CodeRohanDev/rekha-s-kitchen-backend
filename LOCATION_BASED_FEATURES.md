# Location-Based Service Area Features

## Overview

Complete geo-fencing and location-based service area functionality for Rekha's Kitchen. Customers can find nearby outlets, check delivery availability, and get accurate delivery fees based on their location.

## Features

✅ **Nearby Outlets Discovery** - Find outlets within radius  
✅ **Geo-fencing** - Service radius validation  
✅ **Serviceability Check** - Verify delivery availability  
✅ **Distance Calculation** - Haversine formula  
✅ **Dynamic Delivery Fees** - Based on distance  
✅ **Estimated Delivery Time** - Real-time calculation  
✅ **Pincode Support** - Alternative to coordinates  
✅ **Service Areas List** - All covered pincodes/cities  

---

## API Endpoints

### 1. Get Nearby Outlets

**Endpoint:** `GET /api/v1/outlets/nearby`  
**Auth:** Not required (Public)

**Query Parameters:**
- `latitude` (required) - User's latitude
- `longitude` (required) - User's longitude
- `radius` (optional) - Search radius in km (default: 10)

**Example Request:**
```bash
GET /api/v1/outlets/nearby?latitude=19.0760&longitude=72.8777&radius=10
```

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

---

### 2. Check Serviceability

**Endpoint:** `POST /api/v1/outlets/check-serviceability`  
**Auth:** Not required (Public)

**Request Body (with coordinates):**
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

**Request Body (with pincode):**
```json
{
  "pincode": "400053"
}
```

**Request Body (with address):**
```json
{
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "pincode": "400053"
  }
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
      "delivery_fee": 30,
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
        "delivery_fee": 30,
        "estimated_time": 35
      },
      {
        "outlet_id": "outlet456",
        "outlet_name": "Rekha's Kitchen - Bandra",
        "distance": 5.8,
        "delivery_fee": 50,
        "estimated_time": 45
      }
    ],
    "total_outlets": 2,
    "message": "Delivery available at your location"
  }
}
```

**Response (Not Serviceable):**
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

---

### 3. Get Service Areas

**Endpoint:** `GET /api/v1/outlets/service-areas`  
**Auth:** Not required (Public)

**Response:**
```json
{
  "success": true,
  "data": {
    "service_areas": {
      "pincodes": [
        "400001", "400053", "400058", "400061", "400070"
      ],
      "cities": [
        "Mumbai", "Navi Mumbai", "Thane"
      ],
      "states": [
        "Maharashtra"
      ],
      "outlets": [
        {
          "id": "outlet123",
          "name": "Rekha's Kitchen - Andheri",
          "city": "Mumbai",
          "state": "Maharashtra",
          "service_radius": 10,
          "serviceable_pincodes": ["400053", "400058", "400061"],
          "coordinates": {
            "latitude": 19.0760,
            "longitude": 72.8777
          }
        }
      ]
    },
    "total_pincodes": 15,
    "total_cities": 3,
    "total_outlets": 5
  }
}
```

---

### 4. Get Outlet Details

**Endpoint:** `GET /api/v1/outlets/public/:outletId`  
**Auth:** Not required (Public)

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
      "serviceable_pincodes": ["400053", "400058", "400061"],
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
      "delivery_fee_config": {
        "base_distance": 5,
        "base_fee": 0,
        "per_km_fee": 10,
        "max_fee": 100
      },
      "avg_preparation_time": 20,
      "is_accepting_orders": true
    }
  }
}
```

---

## Geo-Location Utilities

### Distance Calculation

Uses Haversine formula to calculate distance between two coordinates:

```javascript
const { calculateDistance } = require('./utils/geoLocation');

const distance = calculateDistance(
  19.0760, 72.8777,  // User location
  19.1136, 72.8697   // Outlet location
);
// Returns: 4.2 (km)
```

### Service Area Check

```javascript
const { isWithinServiceArea } = require('./utils/geoLocation');

const serviceable = isWithinServiceArea(
  19.0760, 72.8777,  // User location
  19.1136, 72.8697,  // Outlet location
  10                  // Service radius (km)
);
// Returns: true or false
```

### Delivery Fee Calculation

```javascript
const { calculateDeliveryFee } = require('./utils/geoLocation');

const fee = calculateDeliveryFee(7.5, {
  baseDistance: 5,    // Free delivery within 5km
  baseFee: 0,
  perKmFee: 10,       // ₹10 per km after base
  maxFee: 100
});
// Returns: 25 (₹25 for 7.5km distance)
```

### Delivery Time Estimation

```javascript
const { estimateDeliveryTime } = require('./utils/geoLocation');

const time = estimateDeliveryTime(
  5.0,  // Distance in km
  20    // Preparation time in minutes
);
// Returns: 40 (minutes)
```

---

## Database Schema

### Outlets Collection

```javascript
{
  id: "outlet123",
  name: "Rekha's Kitchen - Andheri",
  address: {
    street: "123 Main Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400053",
    country: "India"
  },
  phone: "+919876543210",
  email: "andheri@rekhaskitchen.com",
  
  // Geo-location fields
  coordinates: {
    latitude: 19.0760,
    longitude: 72.8777
  },
  service_radius: 10,  // in kilometers
  serviceable_pincodes: ["400053", "400058", "400061"],
  
  // Delivery configuration
  delivery_fee_config: {
    baseDistance: 5,   // Free delivery within 5km
    baseFee: 0,
    perKmFee: 10,      // ₹10 per km
    maxFee: 100
  },
  
  // Operating details
  operating_hours: {
    monday: "10:00-22:00",
    tuesday: "10:00-22:00",
    // ...
  },
  avg_preparation_time: 20,  // minutes
  is_accepting_orders: true,
  is_active: true,
  
  // Stats
  average_rating: 4.5,
  total_orders: 1250,
  total_revenue: 125000,
  
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-15T10:00:00Z"
}
```

---

## Frontend Implementation

### 1. Get User Location

```javascript
async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true }
    );
  });
}
```

### 2. Find Nearby Outlets

```javascript
async function findNearbyOutlets() {
  try {
    const location = await getUserLocation();
    
    const response = await fetch(
      `/api/v1/outlets/nearby?latitude=${location.latitude}&longitude=${location.longitude}&radius=10`
    );
    
    const data = await response.json();
    
    if (data.success) {
      displayOutlets(data.data.outlets);
    }
  } catch (error) {
    console.error('Error finding outlets:', error);
  }
}
```

### 3. Check Serviceability

```javascript
async function checkDeliveryAvailability(latitude, longitude) {
  try {
    const response = await fetch('/api/v1/outlets/check-serviceability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude })
    });
    
    const data = await response.json();
    
    if (data.data.serviceable) {
      const outlet = data.data.primary_outlet;
      showDeliveryInfo({
        outlet: outlet.outlet_name,
        fee: outlet.delivery_fee,
        time: outlet.estimated_time
      });
    } else {
      showNotServiceableMessage();
    }
  } catch (error) {
    console.error('Error checking serviceability:', error);
  }
}
```

### 4. Display Outlets on Map

```jsx
function OutletMap({ outlets, userLocation }) {
  return (
    <MapContainer center={[userLocation.lat, userLocation.lon]} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* User marker */}
      <Marker position={[userLocation.lat, userLocation.lon]}>
        <Popup>Your Location</Popup>
      </Marker>
      
      {/* Outlet markers */}
      {outlets.map(outlet => (
        <Marker 
          key={outlet.id}
          position={[outlet.coordinates.latitude, outlet.coordinates.longitude]}
        >
          <Popup>
            <h3>{outlet.name}</h3>
            <p>Distance: {outlet.distance} km</p>
            <p>Delivery Fee: ₹{outlet.delivery_fee}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### 5. Pincode Checker

```jsx
function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState(null);
  
  const checkPincode = async () => {
    const response = await fetch('/api/v1/outlets/check-serviceability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincode })
    });
    
    const data = await response.json();
    setResult(data.data);
  };
  
  return (
    <div>
      <input 
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
        placeholder="Enter pincode"
      />
      <button onClick={checkPincode}>Check</button>
      
      {result && (
        <div>
          {result.serviceable ? (
            <p>✅ We deliver to your area!</p>
          ) : (
            <p>❌ Not serviceable yet</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Use Cases

### 1. Location-Based Outlet Selection

When user opens app:
1. Get user's current location
2. Find nearby outlets
3. Show closest outlet as default
4. Display delivery fee and time

### 2. Address Validation

When user adds delivery address:
1. Get coordinates from address
2. Check serviceability
3. Show available outlets
4. Calculate delivery fee

### 3. Service Area Display

On landing page:
1. Show all service areas
2. List covered pincodes
3. Display outlet locations on map

### 4. Dynamic Delivery Fees

During checkout:
1. Calculate distance to outlet
2. Apply delivery fee formula
3. Show estimated delivery time
4. Update total amount

---

## Configuration

### Outlet Setup (Admin)

When creating/updating an outlet, set:

```json
{
  "coordinates": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "service_radius": 10,
  "serviceable_pincodes": ["400053", "400058"],
  "delivery_fee_config": {
    "baseDistance": 5,
    "baseFee": 0,
    "perKmFee": 10,
    "maxFee": 100
  }
}
```

---

## Testing

### Test Scenarios

1. **Nearby Outlets**
   - User in Mumbai → Should find 3 outlets
   - User in Delhi → Should find 0 outlets

2. **Serviceability**
   - Within 5km → Free delivery
   - 7km away → ₹20 delivery fee
   - 15km away → Not serviceable

3. **Pincode Check**
   - Valid pincode → Serviceable
   - Invalid pincode → Not serviceable

### Test Data

```javascript
// Mumbai locations
const testLocations = {
  andheri: { lat: 19.0760, lon: 72.8777 },
  bandra: { lat: 19.0596, lon: 72.8295 },
  powai: { lat: 19.1176, lon: 72.9060 }
};

// Test pincodes
const testPincodes = {
  serviceable: ["400053", "400058", "400061"],
  notServiceable: ["110001", "560001"]
};
```

---

## Summary

✅ **Complete geo-fencing system**  
✅ **4 public API endpoints**  
✅ **Distance-based delivery fees**  
✅ **Real-time serviceability check**  
✅ **Pincode support**  
✅ **Service area management**  
✅ **Ready for frontend integration**

The location-based features are fully implemented and ready to use!
