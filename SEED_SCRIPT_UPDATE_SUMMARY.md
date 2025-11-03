# Seed Script Update Summary

## Changes Made

The `seed-demo-products.js` script has been updated to support outlet-specific menus.

## What Changed

### Before
- Created global categories and items
- All outlets shared the same menu
- Used `outlet_specific` and `outlet_ids` fields

### After
- Creates separate menus for each outlet
- Each outlet gets its own categories and items
- Categories and items are linked to specific outlets via `outlet_id`

## How It Works

### 1. Fetch Active Outlets
```javascript
const outlets = await dbHelpers.getDocs(collections.OUTLETS, [
  { type: 'where', field: 'is_active', operator: '==', value: true }
]);
```

### 2. Create Menu for Each Outlet
For each outlet:
- Creates 8 categories (Appetizers, Main Course, etc.)
- Creates ~50 menu items across all categories
- Links everything to the outlet via `outlet_id`

### 3. Data Structure

**Category:**
```javascript
{
  name: "Appetizers",
  description: "Start your meal...",
  outlet_id: "outlet123",  // NEW
  display_order: 1,
  is_active: true,
  item_count: 6
}
```

**Menu Item:**
```javascript
{
  category_id: "cat123",
  outlet_id: "outlet123",  // NEW (from category)
  name: "Samosa",
  price: 40,
  is_vegetarian: true,
  // outlet_specific: REMOVED
  // outlet_ids: REMOVED
  ...
}
```

## Usage

### Prerequisites
You must have at least one active outlet before running the seed script.

### Run the Script
```bash
npm run seed-products
```

### Expected Output
```
🌱 Starting demo product seeding...
🏪 Fetching active outlets...
✅ Found 2 active outlet(s)

🏪 Creating menu for: Rekha's Kitchen - Andheri (outlet123)
📁 Creating categories...
  ✓ Appetizers
  ✓ Main Course
  ✓ Biryanis & Rice
  ✓ Breads
  ✓ Desserts
  ✓ Beverages
  ✓ Tandoori Specials
  ✓ South Indian
🍽️  Creating products...
✅ Menu created for Rekha's Kitchen - Andheri

🏪 Creating menu for: Rekha's Kitchen - Bandra (outlet456)
📁 Creating categories...
  ✓ Appetizers
  ...
✅ Menu created for Rekha's Kitchen - Bandra

✨ Seeding completed successfully!
📊 Summary:
   - Outlets processed: 2
   - Categories created: 16 (8 per outlet)
   - Products created: 100
   
🎉 All outlet menus are ready!
```

## Error Handling

### No Outlets Found
If no active outlets exist:
```
❌ No active outlets found. Please create at least one outlet first.
💡 Tip: Create an outlet using the admin panel or API
```

**Solution:** Create an outlet first using the admin API or panel.

## Benefits

✅ **Independent Menus** - Each outlet has its own menu  
✅ **Flexible Pricing** - Can modify prices per outlet  
✅ **Outlet-Specific Availability** - Control availability per outlet  
✅ **Scalable** - Works with any number of outlets  
✅ **Clean Data** - No shared categories or items  

## Testing

### Test with Multiple Outlets

1. Create 2 outlets:
```bash
# Outlet 1: Mumbai
POST /api/v1/outlets
{
  "name": "Rekha's Kitchen - Mumbai",
  "address": {...},
  "coordinates": {...}
}

# Outlet 2: Bangalore
POST /api/v1/outlets
{
  "name": "Rekha's Kitchen - Bangalore",
  "address": {...},
  "coordinates": {...}
}
```

2. Run seed script:
```bash
npm run seed-products
```

3. Verify menus are separate:
```bash
# Get Mumbai menu
GET /api/v1/menu/full?outlet_id=mumbai_outlet_id

# Get Bangalore menu
GET /api/v1/menu/full?outlet_id=bangalore_outlet_id
```

### Verify Data Isolation

```javascript
// Mumbai categories should have outlet_id = mumbai_outlet_id
// Bangalore categories should have outlet_id = bangalore_outlet_id
// No categories should be shared between outlets
```

## Clear Menu Data

The `clear-menu-data.js` script remains unchanged and will delete all categories and items from all outlets:

```bash
npm run clear-menu
```

This is useful when you want to:
- Reset all menus
- Re-seed with fresh data
- Clean up test data

## Migration from Old Data

If you have existing menu data without `outlet_id`, you need to:

1. Clear old data:
```bash
npm run clear-menu
```

2. Ensure outlets exist:
```bash
# Check outlets via API
GET /api/v1/outlets
```

3. Re-seed with new structure:
```bash
npm run seed-products
```

## Important Notes

⚠️ **Breaking Change:** Old menu data without `outlet_id` will not work with the new system.

⚠️ **Data Loss:** Clearing menu data is permanent. Backup important data before clearing.

✅ **Recommended:** Always create outlets before seeding menu data.

✅ **Best Practice:** Use different prices/items for different outlets to test the isolation.

## Summary

The seed script now creates outlet-specific menus, ensuring each outlet has its own independent menu system. This provides maximum flexibility for managing different menus across multiple locations.
