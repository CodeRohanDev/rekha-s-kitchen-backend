# 🎨 Banner Management API Documentation

## Overview
Hero banner system for promotional content, offers, and announcements in the customer app. Supports auto-rotating banners with analytics tracking.

---

## 📋 Table of Contents
1. [Customer Endpoints](#customer-endpoints)
2. [Admin Endpoints](#admin-endpoints)
3. [Banner Types & Actions](#banner-types--actions)
4. [Examples](#examples)

---

## 🔓 Customer Endpoints (Public)

### Get All Banners
`GET /api/v1/banners`

Retrieve active banners for display in the customer app.

**Query Parameters:**
- `outlet_id` (optional) - Filter by outlet (shows global + outlet-specific banners)
- `banner_type` (optional) - Filter by type: 'promotional', 'offer', 'announcement', 'seasonal'
- `active_only` (optional) - Default: 'true'

**Example Request:**
```bash
GET /api/v1/banners?outlet_id=outlet123&active_only=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "id": "banner123",
        "title": "50% Off First Order",
        "subtitle": "New customers only",
        "description": "Get 50% discount on your first order above ₹299",
        "image_url": "https://storage.example.com/banners/first-order.jpg",
        "banner_type": "promotional",
        "action_type": "coupon",
        "action_data": {
          "coupon_code": "FIRST50"
        },
        "target_audience": "new_users",
        "display_order": 0,
        "is_active": true,
        "is_global": true,
        "start_date": "2024-01-01T00:00:00Z",
        "end_date": "2024-12-31T23:59:59Z",
        "views_count": 15420,
        "clicks_count": 3240,
        "created_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": "banner456",
        "title": "Free Delivery",
        "subtitle": "On orders above ₹299",
        "image_url": "https://storage.example.com/banners/free-delivery.jpg",
        "banner_type": "offer",
        "action_type": "none",
        "display_order": 1,
        "is_active": true,
        "is_global": false,
        "applicable_outlets": ["outlet123"],
        "created_at": "2024-01-15T00:00:00Z"
      }
    ],
    "total": 2
  }
}
```

---

### Get Banner by ID
`GET /api/v1/banners/:bannerId`

Get details of a specific banner.

**Response:**
```json
{
  "success": true,
  "data": {
    "banner": {
      "id": "banner123",
      "title": "Today's Special: Butter Chicken",
      "subtitle": "Chef's recommendation",
      "description": "Authentic North Indian delicacy",
      "image_url": "https://storage.example.com/banners/butter-chicken.jpg",
      "banner_type": "seasonal",
      "action_type": "menu_item",
      "action_data": {
        "item_id": "item789"
      },
      "display_order": 0,
      "is_active": true
    }
  }
}
```

---

### Track Banner View
`POST /api/v1/banners/:bannerId/view`

Track when a banner is viewed (for analytics).

**Response:**
```json
{
  "success": true,
  "message": "View tracked successfully"
}
```

---

### Track Banner Click
`POST /api/v1/banners/:bannerId/click`

Track when a banner is clicked and get action details.

**Response:**
```json
{
  "success": true,
  "message": "Click tracked successfully",
  "data": {
    "action_type": "coupon",
    "action_data": {
      "coupon_code": "FIRST50"
    }
  }
}
```

---

## 🔒 Admin Endpoints

### Upload Banner Image
`POST /api/v1/banners/upload-image`

**Authorization:** Super Admin, Outlet Admin

Upload an image to Firebase Storage and get the URL to use in banner creation.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `image`
- Allowed formats: JPEG, PNG, WebP
- Max size: 5MB

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/banners/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/banner.jpg"
```

**Example using JavaScript:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/v1/banners/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "image_url": "https://storage.googleapis.com/your-project.appspot.com/banners/1698345678-banner.jpg",
    "file_name": "banner-1698345678.jpg",
    "file_size": 245678,
    "mime_type": "image/jpeg"
  }
}
```

**Error Responses:**
```json
// No file provided
{
  "success": false,
  "error": {
    "code": "NO_FILE",
    "message": "No image file provided"
  }
}

// File too large
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 5MB limit"
  }
}

// Invalid file type
{
  "success": false,
  "error": {
    "code": "INVALID_FILE",
    "message": "Invalid file type. Only JPEG, PNG, and WebP are allowed"
  }
}
```

---

### Delete Banner Image
`DELETE /api/v1/banners/delete-image`

**Authorization:** Super Admin, Outlet Admin

Delete an uploaded image from Firebase Storage (useful if you uploaded wrong image).

**Request Body:**
```json
{
  "image_url": "https://storage.googleapis.com/your-project.appspot.com/banners/1698345678-banner.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

### Create Banner
`POST /api/v1/banners`

**Authorization:** Super Admin, Outlet Admin

**Workflow:**
1. First upload image using `/upload-image` endpoint
2. Use the returned `image_url` in banner creation

**Request Body:**
```json
{
  "title": "Weekend Special Offer",
  "subtitle": "Save big this weekend",
  "description": "Get 30% off on all orders this Saturday and Sunday",
  "image_url": "https://storage.googleapis.com/your-project.appspot.com/banners/1698345678-banner.jpg",
  "banner_type": "promotional",
  "action_type": "coupon",
  "action_data": {
    "coupon_code": "WEEKEND30"
  },
  "target_audience": "all",
  "applicable_outlets": ["outlet123", "outlet456"],
  "display_order": 0,
  "start_date": "2024-10-26T00:00:00Z",
  "end_date": "2024-10-27T23:59:59Z",
  "is_active": true
}
```

**Required Fields:**
- `title` (string, 3-100 chars) - Banner headline
- `image_url` (string, valid URL) - Banner image
- `banner_type` (string) - Type of banner
- `action_type` (string) - What happens on click

**Optional Fields:**
- `subtitle` (string, max 200 chars)
- `description` (string, max 500 chars)
- `action_data` (object) - Data for the action
- `target_audience` (string) - Default: 'all'
- `applicable_outlets` (array) - Empty = global (super admin only)
- `display_order` (number) - Default: 0
- `start_date` (ISO date) - Default: now
- `end_date` (ISO date) - Optional
- `is_active` (boolean) - Default: true

**Response:**
```json
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "banner_id": "banner789",
    "banner": {
      "id": "banner789",
      "title": "Weekend Special Offer",
      "is_active": true,
      "created_at": "2024-10-26T10:00:00Z"
    }
  }
}
```

**Permissions:**
- **Super Admin:** Can create global banners or outlet-specific banners
- **Outlet Admin:** Can only create banners for their assigned outlets

---

### Update Banner
`PUT /api/v1/banners/:bannerId`

**Authorization:** Super Admin, Outlet Admin (own banners only)

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "subtitle": "Updated subtitle",
  "image_url": "https://storage.example.com/banners/new-image.jpg",
  "display_order": 5,
  "is_active": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Banner updated successfully"
}
```

---

### Delete Banner
`DELETE /api/v1/banners/:bannerId`

**Authorization:** Super Admin, Outlet Admin (own banners only)

**Response:**
```json
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

---

### Toggle Banner Status
`PATCH /api/v1/banners/:bannerId/toggle`

**Authorization:** Super Admin, Outlet Admin (own banners only)

**Request Body:**
```json
{
  "is_active": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Banner deactivated successfully"
}
```

---

### Get Banner Analytics
`GET /api/v1/banners/:bannerId/analytics`

**Authorization:** Super Admin, Outlet Admin (own banners only)

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "banner_id": "banner123",
      "title": "50% Off First Order",
      "views_count": 15420,
      "clicks_count": 3240,
      "click_through_rate": "21.01%",
      "is_active": true,
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-12-31T23:59:59Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

## 🎯 Banner Types & Actions

### Banner Types
- `promotional` - General promotions and marketing
- `offer` - Discount and deal announcements
- `announcement` - Important updates and news
- `seasonal` - Holiday and seasonal specials

### Action Types
When a user taps on a banner, the app can perform different actions:

| Action Type | Description | Action Data Example |
|------------|-------------|---------------------|
| `none` | No action, just display | `null` |
| `deep_link` | Navigate to app screen | `{ "screen": "menu", "params": {} }` |
| `menu_item` | Show specific menu item | `{ "item_id": "item123" }` |
| `category` | Show menu category | `{ "category_id": "cat456" }` |
| `outlet` | Show outlet details | `{ "outlet_id": "outlet789" }` |
| `coupon` | Apply coupon code | `{ "coupon_code": "SAVE20" }` |
| `external_url` | Open external link | `{ "url": "https://example.com" }` |

### Target Audience
- `all` - Show to all users
- `new_users` - Only users with 0 orders
- `loyal_customers` - Users with 5+ orders
- `location_based` - Based on user location (future)

---

## 📱 Frontend Implementation Guide

### Admin: Upload and Create Banner

```javascript
// Step 1: Upload image
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/v1/banners/upload-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const { data } = await response.json();
  return data.image_url;
};

// Step 2: Create banner with uploaded image URL
const createBanner = async (imageUrl, bannerData) => {
  const response = await fetch('/api/v1/banners', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...bannerData,
      image_url: imageUrl
    })
  });
  
  return await response.json();
};

// Usage
const handleBannerCreation = async (imageFile, bannerData) => {
  try {
    // Upload image first
    const imageUrl = await uploadImage(imageFile);
    
    // Create banner with image URL
    const result = await createBanner(imageUrl, {
      title: "50% Off First Order",
      subtitle: "New customers only",
      banner_type: "promotional",
      action_type: "coupon",
      action_data: { coupon_code: "FIRST50" }
    });
    
    console.log('Banner created:', result);
  } catch (error) {
    console.error('Failed to create banner:', error);
  }
};
```

### Customer: Auto-Rotating Banner Carousel

```javascript
// Fetch banners
const response = await fetch('/api/v1/banners?outlet_id=outlet123');
const { data } = await response.json();
const banners = data.banners;

// Track view when banner is displayed
const trackView = async (bannerId) => {
  await fetch(`/api/v1/banners/${bannerId}/view`, { method: 'POST' });
};

// Track click and handle action
const handleBannerClick = async (banner) => {
  const response = await fetch(`/api/v1/banners/${banner.id}/click`, { 
    method: 'POST' 
  });
  const { data } = await response.json();
  
  // Handle action based on action_type
  switch (data.action_type) {
    case 'coupon':
      applyCoupon(data.action_data.coupon_code);
      break;
    case 'menu_item':
      navigateToMenuItem(data.action_data.item_id);
      break;
    case 'external_url':
      openExternalUrl(data.action_data.url);
      break;
    // ... handle other action types
  }
};

// Auto-rotate every 3-4 seconds
const autoRotate = () => {
  setInterval(() => {
    currentIndex = (currentIndex + 1) % banners.length;
    showBanner(banners[currentIndex]);
    trackView(banners[currentIndex].id);
  }, 3500);
};
```

### Recommended UI Features
- **Full-width cards** with rounded corners
- **Gradient overlays** for text readability
- **Dots indicator** showing current position
- **Swipe gestures** for manual navigation
- **Parallax scrolling** effect
- **3-4 second** auto-rotation interval
- **Pause on interaction** (user swipes/taps)

---

## 🎨 Image Specifications

### Recommended Banner Image Specs
- **Aspect Ratio:** 16:9 or 2:1
- **Resolution:** 1920x1080px or higher
- **File Format:** JPG, PNG, WebP
- **File Size:** < 500KB (optimized)
- **Text:** Minimal text on image (use title/subtitle fields)

### Design Tips
- Use high-contrast colors for text
- Keep important content in center (safe zone)
- Test on different screen sizes
- Ensure text is readable on mobile

---

## 📊 Analytics & Tracking

The system automatically tracks:
- **Views:** How many times banner was displayed
- **Clicks:** How many times banner was tapped
- **CTR:** Click-through rate percentage
- **Performance:** Compare different banners

Use analytics to:
- Identify most effective banners
- A/B test different designs
- Optimize placement and timing
- Measure campaign success

---

## 🔐 Permission Matrix

| Action | Super Admin | Outlet Admin | Customer |
|--------|-------------|--------------|----------|
| View banners | ✅ | ✅ | ✅ |
| Track view/click | ✅ | ✅ | ✅ |
| Create global banner | ✅ | ❌ | ❌ |
| Create outlet banner | ✅ | ✅ (own outlets) | ❌ |
| Update banner | ✅ | ✅ (own banners) | ❌ |
| Delete banner | ✅ | ✅ (own banners) | ❌ |
| View analytics | ✅ | ✅ (own banners) | ❌ |

---

## 💡 Best Practices

### For Admins
1. **Schedule banners** with start/end dates
2. **Test on mobile** before activating
3. **Use clear CTAs** in title/subtitle
4. **Monitor analytics** regularly
5. **Rotate content** to keep fresh
6. **Target appropriately** (new vs loyal users)

### For Developers
1. **Lazy load images** for performance
2. **Cache banner data** (5-10 min)
3. **Handle offline** gracefully
4. **Preload next image** in carousel
5. **Track errors** in analytics calls
6. **Implement retry logic** for failed requests

---

## 🚀 Example Use Cases

### 1. First Order Promotion
```json
{
  "title": "50% Off Your First Order!",
  "subtitle": "Welcome to Rekha's Kitchen",
  "banner_type": "promotional",
  "action_type": "coupon",
  "action_data": { "coupon_code": "FIRST50" },
  "target_audience": "new_users"
}
```

### 2. Today's Special
```json
{
  "title": "Today's Special: Butter Chicken",
  "subtitle": "Chef's Signature Dish",
  "banner_type": "seasonal",
  "action_type": "menu_item",
  "action_data": { "item_id": "item123" }
}
```

### 3. Free Delivery Announcement
```json
{
  "title": "Free Delivery Above ₹299",
  "subtitle": "Limited time offer",
  "banner_type": "offer",
  "action_type": "none"
}
```

### 4. Festival Special
```json
{
  "title": "Diwali Special Menu",
  "subtitle": "Celebrate with traditional sweets",
  "banner_type": "seasonal",
  "action_type": "category",
  "action_data": { "category_id": "sweets" },
  "start_date": "2024-10-20T00:00:00Z",
  "end_date": "2024-11-05T23:59:59Z"
}
```

---

## ❌ Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `NOT_FOUND` | Banner not found | Invalid banner ID |
| `FORBIDDEN` | Permission denied | Insufficient permissions |
| `VALIDATION_ERROR` | Invalid input data | Check required fields |
| `CONFLICT` | Banner already exists | Duplicate banner |
| `INTERNAL_ERROR` | Server error | Contact support |

---

## 📞 Support

For questions or issues:
- Check error messages for details
- Review permission requirements
- Verify date ranges and outlet IDs
- Test with sample data first
