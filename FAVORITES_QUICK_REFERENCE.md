# Favorites API - Quick Reference

## Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/favorites` | Add item to favorites | ✅ |
| GET | `/api/v1/favorites` | Get all favorites | ✅ |
| GET | `/api/v1/favorites/count` | Get favorites count | ✅ |
| GET | `/api/v1/favorites/check/:item_id` | Check if item is favorite | ✅ |
| DELETE | `/api/v1/favorites/:item_id` | Remove from favorites | ✅ |
| DELETE | `/api/v1/favorites` | Clear all favorites | ✅ |

## Quick Examples

### Add to Favorites
```bash
curl -X POST http://localhost:3000/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"item_id": "menu_item_123"}'
```

### Get Favorites
```bash
curl -X GET "http://localhost:3000/api/v1/favorites?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Favorite Status
```bash
curl -X GET http://localhost:3000/api/v1/favorites/check/menu_item_123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Remove from Favorites
```bash
curl -X DELETE http://localhost:3000/api/v1/favorites/menu_item_123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Count
```bash
curl -X GET http://localhost:3000/api/v1/favorites/count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Clear All
```bash
curl -X DELETE http://localhost:3000/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Mobile UI Flow

1. **Menu Screen**: Show heart icon on each item
2. **Tap Heart**: Toggle favorite status (optimistic update)
3. **Favorites Tab**: Show all favorited items
4. **Item Details**: Show favorite status and allow toggle
5. **Badge**: Display count on favorites tab icon

## Key Features

✅ Add/remove items from favorites  
✅ View all favorites with full item details  
✅ Filter by outlet or category  
✅ Check favorite status for any item  
✅ Get total favorites count  
✅ Clear all favorites at once  
✅ Pagination support  
✅ Handles deleted items gracefully  

## Database Collection

**Collection Name:** `favorites`

**Document Structure:**
```javascript
{
  id: "fav_abc123",
  user_id: "user_123",
  item_id: "menu_item_456",
  item_name: "Paneer Butter Masala",
  outlet_id: "outlet_789",
  category_id: "cat_012",
  created_at: Timestamp,
  updated_at: Timestamp
}
```

## Implementation Status

✅ Controller created: `src/controllers/favoriteController.js`  
✅ Routes created: `src/routes/favorites.js`  
✅ Database collection added: `FAVORITES`  
✅ Routes registered in app.js  
✅ Complete API documentation created  
✅ Mobile implementation guide included  

## Next Steps for Mobile Team

1. Implement favorites screen UI
2. Add heart icon toggle on menu items
3. Implement favorites count badge
4. Add filter options (outlet, category)
5. Implement empty state
6. Add pull-to-refresh
7. Test all endpoints
8. Implement offline caching (optional)
