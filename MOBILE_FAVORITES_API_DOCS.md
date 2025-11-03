# Favorite Items API Documentation for Mobile App

## Overview
The Favorites API allows users to save their favorite menu items for quick access. Users can add items to favorites, view their favorite items, check if an item is favorited, and remove items from favorites.

**Base URL:** `/api/v1/favorites`

**Authentication:** All endpoints require Bearer token authentication.

---

## Table of Contents
1. [Add Item to Favorites](#1-add-item-to-favorites)
2. [Get All Favorite Items](#2-get-all-favorite-items)
3. [Get Favorites Count](#3-get-favorites-count)
4. [Check if Item is Favorite](#4-check-if-item-is-favorite)
5. [Remove Item from Favorites](#5-remove-item-from-favorites)
6. [Clear All Favorites](#6-clear-all-favorites)
7. [Error Codes](#error-codes)
8. [Mobile Implementation Guide](#mobile-implementation-guide)

---

## 1. Add Item to Favorites

Add a menu item to the user's favorites list.

**Endpoint:** `POST /api/v1/favorites`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "item_id": "menu_item_123"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Item added to favorites",
  "data": {
    "favorite_id": "fav_abc123",
    "item_id": "menu_item_123",
    "added_at": "2025-10-29T10:30:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found** - Item doesn't exist:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Menu item not found"
  }
}
```

**409 Conflict** - Item already in favorites:
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_EXISTS",
    "message": "Item already in favorites"
  }
}
```

---

## 2. Get All Favorite Items

Retrieve all favorite items for the authenticated user with full item details.

**Endpoint:** `GET /api/v1/favorites`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 100) |
| outlet_id | string | No | Filter by specific outlet |
| category_id | string | No | Filter by specific category |

**Example Request:**
```
GET /api/v1/favorites?page=1&limit=20
GET /api/v1/favorites?outlet_id=outlet_123
GET /api/v1/favorites?category_id=cat_456
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "favorite_id": "fav_abc123",
        "added_at": "2025-10-29T10:30:00.000Z",
        "item": {
          "id": "menu_item_123",
          "name": "Paneer Butter Masala",
          "description": "Rich and creamy paneer curry",
          "price": 250,
          "image_url": "https://storage.example.com/items/paneer.jpg",
          "is_available": true,
          "is_active": true,
          "category": {
            "id": "cat_456",
            "name": "Main Course"
          },
          "outlet": {
            "id": "outlet_123",
            "name": "Rekha's Kitchen - Downtown",
            "address": "123 Main Street, City"
          },
          "dietary_info": {
            "is_vegetarian": true,
            "is_vegan": false,
            "is_gluten_free": false,
            "spice_level": "medium"
          },
          "customization_options": [
            {
              "name": "Spice Level",
              "options": ["Mild", "Medium", "Hot"],
              "is_required": false
            }
          ]
        }
      },
      {
        "favorite_id": "fav_def456",
        "added_at": "2025-10-28T15:20:00.000Z",
        "item": {
          "id": "menu_item_456",
          "name": "Chicken Biryani",
          "description": "Aromatic basmati rice with tender chicken",
          "price": 300,
          "image_url": "https://storage.example.com/items/biryani.jpg",
          "is_available": true,
          "is_active": true,
          "category": {
            "id": "cat_789",
            "name": "Rice & Biryani"
          },
          "outlet": {
            "id": "outlet_123",
            "name": "Rekha's Kitchen - Downtown",
            "address": "123 Main Street, City"
          },
          "dietary_info": {
            "is_vegetarian": false,
            "is_vegan": false,
            "is_gluten_free": true,
            "spice_level": "medium"
          },
          "customization_options": []
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 45,
      "items_per_page": 20,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

---

## 3. Get Favorites Count

Get the total count of favorite items for the user.

**Endpoint:** `GET /api/v1/favorites/count`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 45
  }
}
```

**Use Case:** Display a badge on the favorites icon showing the number of saved items.

---

## 4. Check if Item is Favorite

Check if a specific item is in the user's favorites.

**Endpoint:** `GET /api/v1/favorites/check/:item_id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| item_id | string | Yes | Menu item ID to check |

**Example Request:**
```
GET /api/v1/favorites/check/menu_item_123
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "is_favorite": true,
    "favorite_id": "fav_abc123"
  }
}
```

**When Not in Favorites:**
```json
{
  "success": true,
  "data": {
    "is_favorite": false,
    "favorite_id": null
  }
}
```

**Use Case:** Show filled/unfilled heart icon on menu item cards.

---

## 5. Remove Item from Favorites

Remove a specific item from the user's favorites.

**Endpoint:** `DELETE /api/v1/favorites/:item_id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| item_id | string | Yes | Menu item ID to remove |

**Example Request:**
```
DELETE /api/v1/favorites/menu_item_123
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from favorites"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Item not found in favorites"
  }
}
```

---

## 6. Clear All Favorites

Remove all items from the user's favorites list.

**Endpoint:** `DELETE /api/v1/favorites`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "45 favorite(s) cleared successfully"
}
```

**When No Favorites:**
```json
{
  "success": true,
  "message": "No favorites to clear"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| NOT_FOUND | 404 | Menu item or favorite not found |
| ALREADY_EXISTS | 409 | Item already in favorites |
| UNAUTHORIZED | 401 | Invalid or missing authentication token |
| VALIDATION_ERROR | 400 | Invalid request parameters |
| INTERNAL_ERROR | 500 | Server error |

---

## Mobile Implementation Guide

### 1. Favorites Screen UI Components

**Screen Structure:**
- Header with title "My Favorites" and clear all button
- Empty state when no favorites
- Grid/List view of favorite items
- Pull-to-refresh functionality
- Pagination/infinite scroll

**Item Card Components:**
- Item image
- Item name and description
- Price
- Outlet name
- Availability status
- Remove from favorites button (heart icon)
- Add to cart button

### 2. Toggle Favorite Functionality

```javascript
// Example: Toggle favorite on item card
async function toggleFavorite(itemId, isFavorite) {
  try {
    if (isFavorite) {
      // Remove from favorites
      const response = await fetch(`/api/v1/favorites/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        // Update UI - change heart icon to unfilled
        updateFavoriteIcon(itemId, false);
        showToast('Removed from favorites');
      }
    } else {
      // Add to favorites
      const response = await fetch('/api/v1/favorites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ item_id: itemId })
      });
      
      if (response.ok) {
        // Update UI - change heart icon to filled
        updateFavoriteIcon(itemId, true);
        showToast('Added to favorites');
      }
    }
  } catch (error) {
    showToast('Failed to update favorites');
  }
}
```

### 3. Load Favorites Screen

```javascript
// Example: Load favorites with pagination
async function loadFavorites(page = 1) {
  try {
    showLoading();
    
    const response = await fetch(
      `/api/v1/favorites?page=${page}&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      if (data.data.favorites.length === 0 && page === 1) {
        showEmptyState();
      } else {
        renderFavorites(data.data.favorites);
        updatePagination(data.data.pagination);
      }
    }
  } catch (error) {
    showError('Failed to load favorites');
  } finally {
    hideLoading();
  }
}
```

### 4. Check Favorite Status on Menu Items

```javascript
// Example: Check if items are favorited when loading menu
async function loadMenuWithFavoriteStatus(items) {
  try {
    // Check favorite status for each item
    const favoriteChecks = await Promise.all(
      items.map(item => 
        fetch(`/api/v1/favorites/check/${item.id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }).then(res => res.json())
      )
    );
    
    // Merge favorite status with items
    const itemsWithFavorites = items.map((item, index) => ({
      ...item,
      is_favorite: favoriteChecks[index].data.is_favorite
    }));
    
    renderMenuItems(itemsWithFavorites);
  } catch (error) {
    // Fallback: render items without favorite status
    renderMenuItems(items);
  }
}
```

### 5. Display Favorites Count Badge

```javascript
// Example: Update favorites count badge
async function updateFavoritesCount() {
  try {
    const response = await fetch('/api/v1/favorites/count', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const count = data.data.count;
      
      // Update badge on favorites tab/icon
      if (count > 0) {
        showBadge(count);
      } else {
        hideBadge();
      }
    }
  } catch (error) {
    console.error('Failed to update favorites count');
  }
}

// Call this after login and after any favorite changes
```

### 6. Filter Favorites by Outlet

```javascript
// Example: Filter favorites by selected outlet
async function filterFavoritesByOutlet(outletId) {
  try {
    const response = await fetch(
      `/api/v1/favorites?outlet_id=${outletId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      renderFavorites(data.data.favorites);
    }
  } catch (error) {
    showError('Failed to filter favorites');
  }
}
```

### 7. Clear All Favorites with Confirmation

```javascript
// Example: Clear all favorites with user confirmation
async function clearAllFavorites() {
  // Show confirmation dialog
  const confirmed = await showConfirmDialog(
    'Clear All Favorites',
    'Are you sure you want to remove all items from your favorites?'
  );
  
  if (!confirmed) return;
  
  try {
    const response = await fetch('/api/v1/favorites', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast(data.message);
      showEmptyState();
      updateFavoritesCount(); // Update badge
    }
  } catch (error) {
    showToast('Failed to clear favorites');
  }
}
```

### 8. Empty State UI

When user has no favorites, show:
- Icon (heart or empty plate)
- Message: "No favorites yet"
- Subtitle: "Start adding items you love to see them here"
- Button: "Browse Menu"

### 9. Offline Support (Optional)

```javascript
// Cache favorite status locally
class FavoritesCache {
  constructor() {
    this.cache = new Map();
  }
  
  async sync() {
    try {
      const response = await fetch('/api/v1/favorites', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local cache
        this.cache.clear();
        data.data.favorites.forEach(fav => {
          this.cache.set(fav.item.id, true);
        });
        
        // Save to local storage
        localStorage.setItem('favorites_cache', 
          JSON.stringify(Array.from(this.cache.keys()))
        );
      }
    } catch (error) {
      // Load from local storage if offline
      const cached = localStorage.getItem('favorites_cache');
      if (cached) {
        JSON.parse(cached).forEach(itemId => {
          this.cache.set(itemId, true);
        });
      }
    }
  }
  
  isFavorite(itemId) {
    return this.cache.has(itemId);
  }
}
```

### 10. Best Practices

1. **Optimistic UI Updates**: Update the UI immediately when user taps favorite, then sync with server
2. **Error Handling**: Show user-friendly messages for network errors
3. **Loading States**: Show skeleton screens while loading favorites
4. **Debouncing**: Prevent rapid favorite/unfavorite toggles
5. **Cache Management**: Cache favorite status to reduce API calls
6. **Sync on App Launch**: Refresh favorites when app opens
7. **Badge Updates**: Update favorites count badge after any change
8. **Deep Linking**: Support deep links to favorites screen
9. **Analytics**: Track favorite actions for insights
10. **Accessibility**: Ensure heart icons have proper labels for screen readers

---

## Testing Checklist

- [ ] Add item to favorites
- [ ] Remove item from favorites
- [ ] View all favorites
- [ ] Check favorite status on menu items
- [ ] Filter favorites by outlet
- [ ] Filter favorites by category
- [ ] Pagination works correctly
- [ ] Clear all favorites
- [ ] Get favorites count
- [ ] Handle deleted items gracefully
- [ ] Handle network errors
- [ ] Handle authentication errors
- [ ] Test with empty favorites
- [ ] Test with large number of favorites (100+)
- [ ] Test offline behavior (if implemented)

---

## Support

For issues or questions, contact the backend team or refer to the main API documentation.

**API Version:** 1.0  
**Last Updated:** October 29, 2025
