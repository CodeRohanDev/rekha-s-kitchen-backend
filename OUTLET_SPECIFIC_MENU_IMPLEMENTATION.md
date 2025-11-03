# Outlet-Specific Menu Implementation

## Overview

Menus and categories are now outlet-specific. Each outlet has its own independent menu with categories and items. This allows different outlets to have different menus, prices, and availability.

## Key Changes

### 1. Categories are Outlet-Specific

**Before:** Categories were global across all outlets  
**After:** Each category belongs to a specific outlet

**Database Schema:**
```javascript
{
  id: "cat123",
  name: "Appetizers",
  description: "Start your meal...",
  outlet_id: "outlet123",  // NEW: Required field
  display_order: 1,
  is_active: true,
  item_count: 5,
  created_by: "user123",
  created_at: "2024-01-01T00:00:00Z"
}
```

### 2. Menu Items are Outlet-Specific

**Before:** Items had `outlet_specific` flag and `outlet_ids` array  
**After:** Each item belongs to a specific outlet (inherited from category)

**Database Schema:**
```javascript
{
  id: "item123",
  category_id: "cat123",
  outlet_id: "outlet123",  // NEW: Required field (from category)
  name: "Samosa",
  price: 40,
  is_vegetarian: true,
  is_available: true,
  // outlet_specific: removed
  // outlet_ids: removed
  ...
}
```

### 3. Removed Fields

- `outlet_specific` (boolean) - No longer needed
- `outlet_ids` (array) - No longer needed

---

## API Changes

### Create Category

**Endpoint:** `POST /menu/categories`

**Before:**
```json
{
  "name": "Appetizers",
  "description": "Start your meal..."
}
```

**After (outlet_id required):**
```json
{
  "name": "Appetizers",
  "description": "Start your meal...",
  "outlet_id": "outlet123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu category created successfully",
  "data": {
    "category_id": "cat123",
    "name": "Appetizers",
    "outlet_id": "outlet123",
    "display_order": 0,
    "is_active": true
  }
}
```

---

### Create Menu Item

**Endpoint:** `POST /menu/items`

**Before:**
```json
{
  "category_id": "cat123",
  "name": "Samosa",
  "price": 40,
  "outlet_specific": false,
  "outlet_ids": []
}
```

**After (outlet_id auto-assigned from category):**
```json
{
  "category_id": "cat123",
  "name": "Samosa",
  "price": 40
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "item_id": "item123",
    "name": "Samosa",
    "category_id": "cat123",
    "outlet_id": "outlet123",
    "price": 40,
    "is_available": true
  }
}
```

---

### Get Categories

**Endpoint:** `GET /menu/categories`

**Query Parameters:**
- `outlet_id` (required) - Filter by outlet
- `is_active` (optional) - Filter by active status
- `include_items` (optional) - Include menu items

**Example:**
```bash
GET /menu/categories?outlet_id=outlet123&is_active=true&include_items=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat123",
        "name": "Appetizers",
        "outlet_id": "outlet123",
        "display_order": 1,
        "items": [...]
      }
    ],
    "outlet_id": "outlet123"
  }
}
```

---

### Get Menu Items

**Endpoint:** `GET /menu/items`

**Query Parameters:**
- `outlet_id` (required) - Filter by outlet
- `category_id` (optional) - Filter by category
- `is_available` (optional) - Filter by availability
- `is_vegetarian` (optional) - Filter vegetarian items
- `spice_level` (optional) - Filter by spice level

**Example:**
```bash
GET /menu/items?outlet_id=outlet123&category_id=cat123&is_available=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item123",
        "name": "Samosa",
        "category_id": "cat123",
        "outlet_id": "outlet123",
        "price": 40,
        "is_available": true
      }
    ],
    "outlet_id": "outlet123",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15
    }
  }
}
```

---

### Get Full Menu

**Endpoint:** `GET /menu/full`

**Query Parameters:**
- `outlet_id` (required) - Outlet ID
- `include_unavailable` (optional) - Include unavailable items

**Example:**
```bash
GET /menu/full?outlet_id=outlet123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "menu": [
      {
        "id": "cat123",
        "name": "Appetizers",
        "outlet_id": "outlet123",
        "display_order": 1,
        "items": [
          {
            "id": "item123",
            "name": "Samosa",
            "price": 40,
            "is_available": true
          }
        ]
      }
    ],
    "outlet_id": "outlet123"
  }
}
```

---

## Migration Guide

### For Existing Data

If you have existing categories and items without `outlet_id`, you need to migrate them:

```javascript
// Migration script example
const migrateMenuToOutlets = async () => {
  // Get all outlets
  const outlets = await dbHelpers.getDocs(collections.OUTLETS);
  
  // Get all categories without outlet_id
  const categories = await dbHelpers.getDocs(collections.MENU_CATEGORIES);
  
  // Get all items without outlet_id
  const items = await dbHelpers.getDocs(collections.MENU_ITEMS);
  
  // For each outlet, duplicate categories and items
  for (const outlet of outlets) {
    for (const category of categories) {
      // Create outlet-specific category
      const newCategory = await dbHelpers.createDoc(collections.MENU_CATEGORIES, {
        ...category,
        outlet_id: outlet.id,
        id: undefined // Let Firestore generate new ID
      });
      
      // Get items for this category
      const categoryItems = items.filter(item => item.category_id === category.id);
      
      // Create outlet-specific items
      for (const item of categoryItems) {
        await dbHelpers.createDoc(collections.MENU_ITEMS, {
          ...item,
          category_id: newCategory.id,
          outlet_id: outlet.id,
          outlet_specific: undefined,
          outlet_ids: undefined,
          id: undefined
        });
      }
    }
  }
  
  // Delete old global categories and items
  // (or mark them as inactive)
};
```

---

## Use Cases

### 1. Different Menus per Outlet

**Scenario:** Mumbai outlet serves North Indian, Bangalore outlet serves South Indian

```javascript
// Mumbai Outlet
POST /menu/categories
{
  "name": "North Indian",
  "outlet_id": "mumbai_outlet"
}

// Bangalore Outlet
POST /menu/categories
{
  "name": "South Indian",
  "outlet_id": "bangalore_outlet"
}
```

### 2. Different Prices per Outlet

**Scenario:** Same item, different prices

```javascript
// Mumbai - Samosa ₹40
POST /menu/items
{
  "category_id": "mumbai_cat",
  "name": "Samosa",
  "price": 40
}

// Bangalore - Samosa ₹35
POST /menu/items
{
  "category_id": "bangalore_cat",
  "name": "Samosa",
  "price": 35
}
```

### 3. Outlet-Specific Availability

**Scenario:** Item available in one outlet but not another

```javascript
// Mumbai - Butter Chicken available
PUT /menu/items/mumbai_item123
{
  "is_available": true
}

// Bangalore - Butter Chicken not available
PUT /menu/items/bangalore_item456
{
  "is_available": false
}
```

---

## Frontend Implementation

### 1. Fetch Menu for Specific Outlet

```javascript
async function fetchOutletMenu(outletId) {
  const response = await fetch(
    `/api/v1/menu/full?outlet_id=${outletId}`
  );
  const data = await response.json();
  return data.data.menu;
}
```

### 2. Create Category for Outlet

```javascript
async function createCategory(outletId, categoryData) {
  const response = await fetch('/api/v1/menu/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...categoryData,
      outlet_id: outletId
    })
  });
  return response.json();
}
```

### 3. Display Outlet-Specific Menu

```jsx
function OutletMenu({ outletId }) {
  const [menu, setMenu] = useState([]);
  
  useEffect(() => {
    fetchOutletMenu(outletId).then(setMenu);
  }, [outletId]);
  
  return (
    <div>
      <h2>Menu for Outlet: {outletId}</h2>
      {menu.map(category => (
        <div key={category.id}>
          <h3>{category.name}</h3>
          {category.items.map(item => (
            <div key={item.id}>
              <span>{item.name}</span>
              <span>₹{item.price}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## Benefits

✅ **Independent Menus** - Each outlet can have completely different menus  
✅ **Flexible Pricing** - Same item can have different prices per outlet  
✅ **Outlet-Specific Availability** - Control availability per outlet  
✅ **Simplified Data Model** - No more `outlet_specific` flags  
✅ **Better Performance** - Direct queries instead of filtering  
✅ **Easier Management** - Clear ownership of categories and items  

---

## Important Notes

### 1. outlet_id is Required

All category and menu item operations now require `outlet_id`:
- Creating categories requires `outlet_id` in request body
- Creating items inherits `outlet_id` from category
- Fetching menus requires `outlet_id` query parameter

### 2. No Cross-Outlet Sharing

Categories and items cannot be shared across outlets. If you want the same item in multiple outlets, create separate items for each outlet.

### 3. Category Belongs to One Outlet

Each category belongs to exactly one outlet. You cannot assign a category to multiple outlets.

### 4. Backward Compatibility

The old `outlet_specific` and `outlet_ids` fields are no longer used. Existing data with these fields will need migration.

---

## Testing

### Test Scenarios

1. **Create Category for Outlet**
   - Verify `outlet_id` is required
   - Verify category is created with correct `outlet_id`

2. **Create Item in Category**
   - Verify item inherits `outlet_id` from category
   - Verify item cannot be created without valid category

3. **Fetch Menu for Outlet**
   - Verify only categories for that outlet are returned
   - Verify only items for that outlet are returned

4. **Cross-Outlet Isolation**
   - Create items in outlet A
   - Verify they don't appear in outlet B's menu

---

## Summary

The menu system is now fully outlet-specific. Each outlet has its own independent menu with categories and items. This provides maximum flexibility for managing different menus, prices, and availability across multiple outlets.

**Key Requirement:** Always provide `outlet_id` when working with categories and menus!
