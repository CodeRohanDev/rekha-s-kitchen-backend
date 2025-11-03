# Banner API Documentation for Mobile App Developers

## Overview
This document provides comprehensive API documentation for the Banner feature in the mobile application. Banners are promotional images displayed in the app that can be global (shown to all users) or kitchen-specific (shown only for specific outlets/kitchens).

**Base URL:** `https://your-api-domain.com/api/banners`

---

## Table of Contents
1. [Banner Types](#banner-types)
2. [Public Endpoints (Customer App)](#public-endpoints-customer-app)
3. [Banner Data Structure](#banner-data-structure)
4. [Action Types](#action-types)
5. [Query Parameters](#query-parameters)
6. [Error Codes](#error-codes)
7. [Integration Examples](#integration-examples)

---

## Banner Types

### 1. Global Banners
- Created by Super Admin
- Visible to all users across all outlets
- `is_global: true`
- `applicable_outlets: []` (empty array)

### 2. Kitchen-Specific Banners (Outlet Banners)
- Created by Super Admin or Outlet Admin
- Visible only to users viewing specific outlets/kitchens
- `is_global: false`
- `applicable_outlets: ["outlet_id_1", "outlet_id_2"]`

### 3. Banner Categories
- `promotional` - General promotional content
- `offer` - Special offers and discounts
- `announcement` - Important announcements
- `seasonal` - Seasonal campaigns (holidays, events)

---

## Public Endpoints (Customer App)

### 1. Get All Banners
Retrieve banners based on outlet and filters.


**Endpoint:** `GET /api/banners`

**Authentication:** Not required (Public)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `outlet_id` | string | No | Filter banners for specific outlet/kitchen. If not provided, only global banners are returned |
| `banner_type` | string | No | Filter by type: `promotional`, `offer`, `announcement`, `seasonal` |
| `active_only` | boolean | No | `true` = only active banners, `false` = only inactive, omit = all banners |

**Response:**
```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "id": "banner_123",
        "title": "Summer Sale",
        "subtitle": "Up to 50% off",
        "description": "Limited time offer on selected items",
        "image_url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/banners/banner-1234567890.jpg",
        "banner_type": "offer",
        "action_type": "category",
        "action_data": {
          "category_id": "cat_456"
        },
        "target_audience": "all",
        "applicable_outlets": ["outlet_1", "outlet_2"],
        "is_global": false,
        "display_order": 1,
        "start_date": "2025-10-01T00:00:00Z",
        "end_date": "2025-10-31T23:59:59Z",
        "is_active": true,
        "views_count": 1250,
        "clicks_count": 340,
        "created_at": "2025-09-25T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

**Usage Examples:**

```javascript
// Get all global banners
fetch('http://localhost:5050/api/v1/banners')

// Get banners for specific kitchen/outlet
fetch('http://localhost:5050/api/v1/banners?outlet_id=outlet_123')

// Get only active promotional banners for an outlet
fetch('http://localhost:5050/api/v1/banners?outlet_id=outlet_123&banner_type=promotional&active_only=true')
```

**Important Notes:**
- Banners are automatically filtered by date range (only active campaigns shown)
- **If `outlet_id` is provided:** returns both global banners AND outlet-specific banners for that kitchen
- **If `outlet_id` is NOT provided:** returns ONLY global banners
- Banners are sorted by `display_order` (ascending) then by `created_at` (descending)
- Images are stored on Cloudinary CDN for fast delivery and automatic optimization

**How to Fetch All Banners (Global + Kitchen-Specific):**

The API behavior depends on whether you provide an `outlet_id`:

| Scenario | API Call | Returns |
|----------|----------|---------|
| **Home screen (no kitchen selected)** | `GET /api/banners` | Only global banners |
| **Kitchen detail page** | `GET /api/banners?outlet_id=kitchen_123` | Global banners + Kitchen_123 specific banners |
| **Multiple kitchens** | Make separate calls for each kitchen | Each call returns global + that kitchen's banners |

**Example Use Cases:**

```javascript
// 1. Home Screen - Show only global promotional banners
const homeScreenBanners = await fetch(
  'https://api.example.com/api/banners?active_only=true'
);
// Returns: Only global banners

// 2. Kitchen Detail Screen - Show all relevant banners for this kitchen
const kitchenBanners = await fetch(
  'https://api.example.com/api/banners?outlet_id=kitchen_123&active_only=true'
);
// Returns: Global banners + Kitchen_123 specific banners

// 3. Menu Screen - Show banners for current kitchen
const menuBanners = await fetch(
  'https://api.example.com/api/banners?outlet_id=kitchen_456&banner_type=offer&active_only=true'
);
// Returns: Global offer banners + Kitchen_456 specific offer banners
```

**Important:** There is no single endpoint to fetch ALL banners (global + all kitchen-specific) in one call. This is by design for performance and relevance - users should only see banners relevant to their current context (either global or specific to the kitchen they're viewing).

---

### 2. Get Banner by ID
Retrieve a specific banner's details.

**Endpoint:** `GET /api/banners/:bannerId`

**Authentication:** Not required (Public)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bannerId` | string | Yes | Unique banner identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "banner": {
      "id": "banner_123",
      "title": "Weekend Special",
      "subtitle": "Free delivery on orders above $30",
      "description": "Valid only on Saturday and Sunday",
      "image_url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/banners/banner-1234567890.jpg",
      "banner_type": "offer",
      "action_type": "coupon",
      "action_data": {
        "coupon_code": "WEEKEND30"
      },
      "is_global": true,
      "display_order": 0,
      "is_active": true
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Banner not found"
  }
}
```

---

### 3. Track Banner View
Track when a banner is viewed by a user (for analytics).

**Endpoint:** `POST /api/banners/:bannerId/view`

**Authentication:** Not required (Public)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bannerId` | string | Yes | Banner ID to track |

**Request Body:** Empty (no body required)

**Response:**
```json
{
  "success": true,
  "message": "View tracked successfully"
}
```

**When to Call:**
- When banner appears in user's viewport
- Implement debouncing to avoid duplicate tracking
- Call once per banner per session

**Example:**
```javascript
// Track banner view when it appears on screen
const trackBannerView = async (bannerId) => {
  try {
    await fetch(`https://api.example.com/api/banners/${bannerId}/view`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Failed to track view:', error);
  }
};
```

---

### 4. Track Banner Click
Track when a user clicks/taps on a banner.

**Endpoint:** `POST /api/banners/:bannerId/click`

**Authentication:** Not required (Public)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bannerId` | string | Yes | Banner ID to track |

**Request Body:** Empty (no body required)

**Response:**
```json
{
  "success": true,
  "message": "Click tracked successfully",
  "data": {
    "action_type": "menu_item",
    "action_data": {
      "item_id": "item_789"
    }
  }
}
```

**When to Call:**
- When user taps/clicks on the banner
- Before navigating to the action destination
- Use the returned `action_type` and `action_data` to handle navigation

**Example:**
```javascript
// Track click and handle navigation
const handleBannerClick = async (bannerId) => {
  try {
    const response = await fetch(`https://api.example.com/api/banners/${bannerId}/click`, {
      method: 'POST'
    });
    const result = await response.json();
    
    // Handle navigation based on action_type
    handleBannerAction(result.data.action_type, result.data.action_data);
  } catch (error) {
    console.error('Failed to track click:', error);
  }
};
```

---

## Banner Data Structure

### Complete Banner Object
```typescript
interface Banner {
  id: string;                          // Unique banner identifier
  title: string;                       // Banner title (required)
  subtitle?: string;                   // Optional subtitle
  description?: string;                // Optional description
  image_url: string;                   // Banner image URL
  banner_type: BannerType;             // Type of banner
  action_type: ActionType;             // What happens on click
  action_data?: any;                   // Data for the action
  target_audience: TargetAudience;     // Who should see this
  applicable_outlets: string[];        // Outlet IDs (empty = global)
  is_global: boolean;                  // True if visible to all
  display_order: number;               // Sort order (lower = first)
  start_date: Date;                    // Campaign start date
  end_date?: Date;                     // Campaign end date (null = no end)
  is_active: boolean;                  // Active/inactive status
  views_count: number;                 // Total views
  clicks_count: number;                // Total clicks
  created_at: Date;                    // Creation timestamp
  updated_at: Date;                    // Last update timestamp
}
```

### Type Definitions
```typescript
type BannerType = 'promotional' | 'offer' | 'announcement' | 'seasonal';

type ActionType = 
  | 'none'           // No action (display only)
  | 'deep_link'      // Navigate to app screen
  | 'menu_item'      // Open specific menu item
  | 'category'       // Open category page
  | 'outlet'         // Open outlet details
  | 'coupon'         // Apply coupon code
  | 'external_url';  // Open external URL

type TargetAudience = 
  | 'all'              // All users
  | 'new_users'        // New/first-time users
  | 'loyal_customers'  // Repeat customers
  | 'location_based';  // Based on user location
```

---

## Action Types

### 1. None (`action_type: "none"`)
Display-only banner with no click action.

```json
{
  "action_type": "none",
  "action_data": null
}
```

**Mobile Implementation:**
```javascript
// No action needed, just display the banner
```

---

### 2. Deep Link (`action_type: "deep_link"`)
Navigate to a specific screen in the app.

```json
{
  "action_type": "deep_link",
  "action_data": {
    "screen": "OrderHistory",
    "params": {
      "filter": "pending"
    }
  }
}
```

**Mobile Implementation:**
```javascript
if (action_type === 'deep_link') {
  const { screen, params } = action_data;
  navigation.navigate(screen, params);
}
```

---

### 3. Menu Item (`action_type: "menu_item"`)
Open a specific menu item detail page.

```json
{
  "action_type": "menu_item",
  "action_data": {
    "item_id": "item_123",
    "outlet_id": "outlet_456"
  }
}
```

**Mobile Implementation:**
```javascript
if (action_type === 'menu_item') {
  const { item_id, outlet_id } = action_data;
  navigation.navigate('MenuItemDetail', { itemId: item_id, outletId: outlet_id });
}
```

---

### 4. Category (`action_type: "category"`)
Open a menu category page.

```json
{
  "action_type": "category",
  "action_data": {
    "category_id": "cat_789",
    "outlet_id": "outlet_456"
  }
}
```

**Mobile Implementation:**
```javascript
if (action_type === 'category') {
  const { category_id, outlet_id } = action_data;
  navigation.navigate('CategoryMenu', { categoryId: category_id, outletId: outlet_id });
}
```

---

### 5. Outlet (`action_type: "outlet"`)
Open outlet/kitchen details page.

```json
{
  "action_type": "outlet",
  "action_data": {
    "outlet_id": "outlet_123"
  }
}
```

**Mobile Implementation:**
```javascript
if (action_type === 'outlet') {
  const { outlet_id } = action_data;
  navigation.navigate('OutletDetail', { outletId: outlet_id });
}
```

---

### 6. Coupon (`action_type: "coupon"`)
Auto-apply a coupon code.

```json
{
  "action_type": "coupon",
  "action_data": {
    "coupon_code": "SAVE20",
    "auto_apply": true
  }
}
```

**Mobile Implementation:**
```javascript
if (action_type === 'coupon') {
  const { coupon_code, auto_apply } = action_data;
  if (auto_apply) {
    applyCouponToCart(coupon_code);
  }
  navigation.navigate('Cart');
}
```

---

### 7. External URL (`action_type: "external_url"`)
Open an external website or URL.

```json
{
  "action_type": "external_url",
  "action_data": {
    "url": "https://example.com/promotion",
    "open_in_browser": true
  }
}
```

**Mobile Implementation:**
```javascript
if (action_type === 'external_url') {
  const { url, open_in_browser } = action_data;
  if (open_in_browser) {
    Linking.openURL(url);
  } else {
    // Open in WebView
    navigation.navigate('WebView', { url });
  }
}
```

---

## Query Parameters

### Filtering Banners

#### By Outlet/Kitchen
```javascript
// Show ONLY global banners (no outlet_id parameter)
GET /api/banners

// Show banners for a specific kitchen (global + kitchen-specific)
GET /api/banners?outlet_id=outlet_123
// Returns: Global banners + Kitchen-specific banners for outlet_123
```

**Understanding the outlet_id Parameter:**

The `outlet_id` parameter controls which banners are returned:

1. **Without outlet_id** (`GET /api/banners`)
   - Returns: Only banners where `is_global = true`
   - Use case: Home screen, general app areas

2. **With outlet_id** (`GET /api/banners?outlet_id=kitchen_123`)
   - Returns: Banners where:
     - `is_global = true` (global banners), OR
     - `applicable_outlets` contains `kitchen_123` (kitchen-specific banners)
   - Use case: Kitchen detail page, menu browsing for specific kitchen

**Visual Example:**

```
Database has these banners:
┌─────────────────────────────────────────────────────────┐
│ Banner A: is_global=true, applicable_outlets=[]         │ ← Global
│ Banner B: is_global=false, applicable_outlets=[K1, K2]  │ ← Kitchen K1 & K2
│ Banner C: is_global=false, applicable_outlets=[K2]      │ ← Kitchen K2 only
│ Banner D: is_global=true, applicable_outlets=[]         │ ← Global
└─────────────────────────────────────────────────────────┘

API Calls:
GET /api/banners
→ Returns: [Banner A, Banner D]  (only global)

GET /api/banners?outlet_id=K1
→ Returns: [Banner A, Banner B, Banner D]  (global + K1 specific)

GET /api/banners?outlet_id=K2
→ Returns: [Banner A, Banner B, Banner C, Banner D]  (global + K2 specific)
```

#### By Banner Type
```javascript
// Show only offer banners
GET /api/banners?banner_type=offer

// Available types: promotional, offer, announcement, seasonal
```

#### By Active Status
```javascript
// Show only active banners
GET /api/banners?active_only=true

// Show only inactive banners
GET /api/banners?active_only=false

// Show all banners (default)
GET /api/banners
```

#### Combined Filters
```javascript
// Active promotional banners for specific outlet
GET /api/banners?outlet_id=outlet_123&banner_type=promotional&active_only=true
```

---

## Error Codes

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `NOT_FOUND` | 404 | Banner not found | Check banner ID is correct |
| `INTERNAL_ERROR` | 500 | Server error | Retry request, contact support if persists |

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Banner not found"
  }
}
```

---

## Integration Examples

### React Native Implementation

#### 1. Banner Carousel Component
```javascript
import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';

const BannerCarousel = ({ outletId }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchBanners();
  }, [outletId]);

  const fetchBanners = async () => {
    try {
      const url = outletId 
        ? `https://api.example.com/api/banners?outlet_id=${outletId}&active_only=true`
        : `https://api.example.com/api/banners?active_only=true`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setBanners(result.data.banners);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (bannerId) => {
    try {
      await fetch(`https://api.example.com/api/banners/${bannerId}/view`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const handleBannerClick = async (banner) => {
    try {
      // Track click
      const response = await fetch(
        `https://api.example.com/api/banners/${banner.id}/click`,
        { method: 'POST' }
      );
      const result = await response.json();
      
      // Handle action
      handleBannerAction(result.data.action_type, result.data.action_data);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  const handleBannerAction = (actionType, actionData) => {
    switch (actionType) {
      case 'menu_item':
        navigation.navigate('MenuItemDetail', {
          itemId: actionData.item_id,
          outletId: actionData.outlet_id
        });
        break;
      case 'category':
        navigation.navigate('CategoryMenu', {
          categoryId: actionData.category_id,
          outletId: actionData.outlet_id
        });
        break;
      case 'outlet':
        navigation.navigate('OutletDetail', {
          outletId: actionData.outlet_id
        });
        break;
      case 'coupon':
        if (actionData.auto_apply) {
          applyCouponToCart(actionData.coupon_code);
        }
        navigation.navigate('Cart');
        break;
      case 'external_url':
        Linking.openURL(actionData.url);
        break;
      case 'deep_link':
        navigation.navigate(actionData.screen, actionData.params);
        break;
      default:
        // No action
        break;
    }
  };

  const renderBanner = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => handleBannerClick(item)}
        onLayout={() => {
          // Track view when banner appears
          if (index === 0) trackView(item.id);
        }}
      >
        <Image
          source={{ uri: item.image_url }}
          style={{
            width: screenWidth - 32,
            height: 180,
            borderRadius: 12,
            marginHorizontal: 16
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  if (banners.length === 0) {
    return null; // Don't show anything if no banners
  }

  return (
    <View style={{ marginVertical: 16 }}>
      <FlatList
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth}
        decelerationRate="fast"
      />
    </View>
  );
};

export default BannerCarousel;
```

#### 2. Kitchen-Specific Banner Display
```javascript
// Home Screen - Show global banners
<BannerCarousel outletId={null} />

// Kitchen/Outlet Detail Screen - Show kitchen-specific + global banners
<BannerCarousel outletId={selectedOutlet.id} />

// Menu Screen - Show banners for current outlet
<BannerCarousel outletId={currentOutletId} />
```

#### 3. Banner with Auto-Scroll
```javascript
const AutoScrollBanner = ({ outletId }) => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % banners.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true
        });
        setCurrentIndex(nextIndex);
      }, 5000); // Auto-scroll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentIndex, banners]);

  // ... rest of implementation
};
```

---

### Flutter Implementation

```dart
class BannerCarousel extends StatefulWidget {
  final String? outletId;

  const BannerCarousel({Key? key, this.outletId}) : super(key: key);

  @override
  _BannerCarouselState createState() => _BannerCarouselState();
}

class _BannerCarouselState extends State<BannerCarousel> {
  List<Banner> banners = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchBanners();
  }

  Future<void> fetchBanners() async {
    try {
      final url = widget.outletId != null
          ? 'https://api.example.com/api/banners?outlet_id=${widget.outletId}&active_only=true'
          : 'https://api.example.com/api/banners?active_only=true';

      final response = await http.get(Uri.parse(url));
      final result = json.decode(response.body);

      if (result['success']) {
        setState(() {
          banners = (result['data']['banners'] as List)
              .map((b) => Banner.fromJson(b))
              .toList();
          isLoading = false;
        });
      }
    } catch (e) {
      print('Failed to fetch banners: $e');
      setState(() => isLoading = false);
    }
  }

  Future<void> trackBannerView(String bannerId) async {
    try {
      await http.post(
        Uri.parse('https://api.example.com/api/banners/$bannerId/view'),
      );
    } catch (e) {
      print('Failed to track view: $e');
    }
  }

  Future<void> handleBannerClick(Banner banner) async {
    try {
      final response = await http.post(
        Uri.parse('https://api.example.com/api/banners/${banner.id}/click'),
      );
      final result = json.decode(response.body);

      if (result['success']) {
        handleBannerAction(
          result['data']['action_type'],
          result['data']['action_data'],
        );
      }
    } catch (e) {
      print('Failed to track click: $e');
    }
  }

  void handleBannerAction(String actionType, Map<String, dynamic>? actionData) {
    switch (actionType) {
      case 'menu_item':
        Navigator.pushNamed(
          context,
          '/menu-item',
          arguments: {
            'itemId': actionData?['item_id'],
            'outletId': actionData?['outlet_id'],
          },
        );
        break;
      case 'category':
        Navigator.pushNamed(
          context,
          '/category',
          arguments: {
            'categoryId': actionData?['category_id'],
            'outletId': actionData?['outlet_id'],
          },
        );
        break;
      // ... handle other action types
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return CircularProgressIndicator();
    }

    if (banners.isEmpty) {
      return SizedBox.shrink();
    }

    return Container(
      height: 180,
      child: PageView.builder(
        itemCount: banners.length,
        itemBuilder: (context, index) {
          final banner = banners[index];
          return GestureDetector(
            onTap: () => handleBannerClick(banner),
            child: Container(
              margin: EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                image: DecorationImage(
                  image: NetworkImage(banner.imageUrl),
                  fit: BoxFit.cover,
                ),
              ),
            ),
          );
        },
        onPageChanged: (index) {
          trackBannerView(banners[index].id);
        },
      ),
    );
  }
}
```

---

## Best Practices

### 1. Performance Optimization
- Cache banner images locally
- Implement lazy loading for banner images
- Use Cloudinary's automatic image optimization (images are served in optimal format and size)
- Leverage Cloudinary transformations for responsive images (add width/height parameters to URL)
- Debounce view tracking to avoid excessive API calls

**Cloudinary Image Optimization Examples:**
```javascript
// Original URL
const originalUrl = "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/banners/banner-1234567890.jpg";

// Optimized for mobile (width 800px, auto quality, auto format)
const mobileUrl = "https://res.cloudinary.com/your-cloud-name/image/upload/w_800,q_auto,f_auto/v1234567890/banners/banner-1234567890.jpg";

// Optimized for thumbnail (width 400px)
const thumbnailUrl = "https://res.cloudinary.com/your-cloud-name/image/upload/w_400,q_auto,f_auto/v1234567890/banners/banner-1234567890.jpg";
```

### 2. User Experience
- Auto-scroll banners every 5-7 seconds
- Show page indicators for multiple banners
- Implement smooth transitions between banners
- Handle loading and error states gracefully
- Don't show banner section if no banners available

### 3. Analytics
- Track views when banner enters viewport (not on page load)
- Track clicks before navigation
- Implement session-based tracking to avoid duplicate counts
- Handle offline scenarios (queue tracking requests)

### 4. Error Handling
```javascript
const fetchBannersWithRetry = async (outletId, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`/api/banners?outlet_id=${outletId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 5. Caching Strategy
```javascript
// Cache banners for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let bannersCache = {
  data: null,
  timestamp: null,
  outletId: null
};

const fetchBannersWithCache = async (outletId) => {
  const now = Date.now();
  
  if (
    bannersCache.data &&
    bannersCache.outletId === outletId &&
    now - bannersCache.timestamp < CACHE_DURATION
  ) {
    return bannersCache.data;
  }

  const data = await fetchBanners(outletId);
  bannersCache = {
    data,
    timestamp: now,
    outletId
  };
  
  return data;
};
```

---

## Testing

### Test Scenarios

1. **Global Banners**
   ```bash
   GET /api/banners
   # Should return only global banners
   ```

2. **Kitchen-Specific Banners**
   ```bash
   GET /api/banners?outlet_id=outlet_123
   # Should return global + outlet_123 specific banners
   ```

3. **Filter by Type**
   ```bash
   GET /api/banners?outlet_id=outlet_123&banner_type=offer
   # Should return only offer-type banners
   ```

4. **Track View**
   ```bash
   POST /api/banners/banner_123/view
   # Should increment views_count
   ```

5. **Track Click**
   ```bash
   POST /api/banners/banner_123/click
   # Should increment clicks_count and return action data
   ```

---

## Support

For questions or issues:
- Check error codes and messages in API responses
- Verify outlet_id is correct and active
- Ensure banners have valid date ranges
- Contact backend team for banner creation/management

---

**Last Updated:** October 26, 2025
**API Version:** 1.0
