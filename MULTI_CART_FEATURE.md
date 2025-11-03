# Multi-Cart Feature Documentation

## Overview

The multi-cart feature allows customers to create and manage multiple shopping carts simultaneously. This is useful for:
- Planning different meals/occasions
- Comparing different order combinations
- Saving carts for later
- Ordering for different delivery addresses
- Creating wish lists

## Features

✅ Create multiple carts  
✅ Name and organize carts  
✅ Add/update/remove items  
✅ Duplicate carts  
✅ Clear cart  
✅ Checkout any cart  
✅ Soft delete (archive) carts  
✅ Automatic price calculation  
✅ Minimum order quantity validation  
✅ Outlet-specific items support

## API Endpoints

Base URL: `/api/v1/carts`

### 1. Create Cart
`POST /api/v1/carts`

**Request:**
```json
{
  "name": "Weekend Party",
  "outlet_id": "outlet123",
  "notes": "For Saturday dinner"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart created successfully",
  "data": {
    "cart": {
      "id": "cart123",
      "user_id": "user123",
      "name": "Weekend Party",
      "outlet_id": "outlet123",
      "items": [],
      "subtotal": 0,
      "item_count": 0,
      "notes": "For Saturday dinner",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

### 2. Get All User Carts
`GET /api/v1/carts?is_active=true`

**Response:**
```json
{
  "success": true,
  "data": {
    "carts": [
      {
        "id": "cart123",
        "name": "Weekend Party",
        "outlet_id": "outlet123",
        "items": [...],
        "subtotal": 1250,
        "item_count": 8,
        "is_active": true
      },
      {
        "id": "cart456",
        "name": "Office Lunch",
        "outlet_id": "outlet123",
        "items": [...],
        "subtotal": 850,
        "item_count": 5,
        "is_active": true
      }
    ],
    "total": 2
  }
}
```

### 3. Get Single Cart
`GET /api/v1/carts/:cartId`

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "cart123",
      "name": "Weekend Party",
      "items": [
        {
          "menu_item_id": "item123",
          "name": "Butter Chicken",
          "price": 420,
          "quantity": 2,
          "subtotal": 840,
          "special_instructions": "Extra spicy",
          "image_url": "https://...",
          "min_order_quantity": 1
        }
      ],
      "subtotal": 840,
      "item_count": 2
    }
  }
}
```

### 4. Add Item to Cart
`POST /api/v1/carts/:cartId/items`

**Request:**
```json
{
  "menu_item_id": "item123",
  "quantity": 2,
  "special_instructions": "Extra spicy"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cart": {
      "id": "cart123",
      "items": [...],
      "subtotal": 1260,
      "item_count": 10
    }
  }
}
```

### 5. Update Item Quantity
`PUT /api/v1/carts/:cartId/items/:itemId`

**Request:**
```json
{
  "quantity": 3,
  "special_instructions": "Medium spicy"
}
```

### 6. Remove Item from Cart
`DELETE /api/v1/carts/:cartId/items/:itemId`

### 7. Clear Cart
`POST /api/v1/carts/:cartId/clear`

### 8. Update Cart Details
`PUT /api/v1/carts/:cartId`

**Request:**
```json
{
  "name": "Family Dinner",
  "notes": "For Sunday evening",
  "outlet_id": "outlet456"
}
```

### 9. Duplicate Cart
`POST /api/v1/carts/:cartId/duplicate`

**Request:**
```json
{
  "name": "Weekend Party (Copy)"
}
```

### 10. Delete Cart
`DELETE /api/v1/carts/:cartId`

### 11. Checkout Cart
`POST /api/v1/carts/:cartId/checkout`

**Request:**
```json
{
  "order_type": "delivery",
  "delivery_address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zip_code": "400001",
    "phone": "+919876543210"
  },
  "payment_method": "card",
  "coupon_code": "SAVE20",
  "special_instructions": "Ring doorbell"
}
```

## Database Schema

### Carts Collection
```javascript
{
  id: "cart123",
  user_id: "user123",
  name: "Weekend Party",
  outlet_id: "outlet123",
  items: [
    {
      menu_item_id: "item123",
      name: "Butter Chicken",
      price: 420,
      quantity: 2,
      special_instructions: "Extra spicy",
      subtotal: 840,
      image_url: "https://...",
      min_order_quantity: 1
    }
  ],
  subtotal: 840,
  item_count: 2,
  notes: "For Saturday dinner",
  is_active: true,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:30:00Z"
}
```

## Frontend Implementation

### 1. Cart List View

```jsx
function CartList() {
  const [carts, setCarts] = useState([]);

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    const response = await api.get('/carts');
    setCarts(response.data.data.carts);
  };

  return (
    <div className="cart-list">
      {carts.map(cart => (
        <CartCard key={cart.id} cart={cart} />
      ))}
      <button onClick={createNewCart}>+ New Cart</button>
    </div>
  );
}
```

### 2. Cart Card Component

```jsx
function CartCard({ cart }) {
  return (
    <div className="cart-card">
      <h3>{cart.name}</h3>
      <p>{cart.item_count} items • ₹{cart.subtotal}</p>
      <div className="actions">
        <button onClick={() => viewCart(cart.id)}>View</button>
        <button onClick={() => duplicateCart(cart.id)}>Duplicate</button>
        <button onClick={() => checkoutCart(cart.id)}>Checkout</button>
      </div>
    </div>
  );
}
```

### 3. Add to Cart with Cart Selection

```jsx
function AddToCartButton({ menuItem }) {
  const [selectedCart, setSelectedCart] = useState(null);
  const [carts, setCarts] = useState([]);

  const addToCart = async () => {
    if (!selectedCart) {
      // Show cart selection modal
      showCartSelector();
      return;
    }

    await api.post(`/carts/${selectedCart}/items`, {
      menu_item_id: menuItem.id,
      quantity: 1
    });

    toast.success('Added to cart!');
  };

  return (
    <button onClick={addToCart}>
      Add to Cart
    </button>
  );
}
```

### 4. Cart Switcher

```jsx
function CartSwitcher() {
  const [carts, setCarts] = useState([]);
  const [activeCart, setActiveCart] = useState(null);

  return (
    <div className="cart-switcher">
      <select 
        value={activeCart} 
        onChange={(e) => setActiveCart(e.target.value)}
      >
        {carts.map(cart => (
          <option key={cart.id} value={cart.id}>
            {cart.name} ({cart.item_count} items)
          </option>
        ))}
      </select>
      <button onClick={createNewCart}>+ New</button>
    </div>
  );
}
```

## Use Cases

### 1. Multiple Occasions
```
Cart 1: "Birthday Party" - 20 items, ₹5,000
Cart 2: "Office Lunch" - 5 items, ₹800
Cart 3: "Weekend Dinner" - 8 items, ₹1,500
```

### 2. Comparison Shopping
```
Cart 1: "Veg Menu" - All vegetarian items
Cart 2: "Non-Veg Menu" - Chicken and lamb dishes
Compare prices and decide
```

### 3. Saved for Later
```
Cart 1: "Current Order" - Ready to checkout
Cart 2: "Favorites" - Saved for next time
Cart 3: "Try Later" - Items to explore
```

### 4. Different Addresses
```
Cart 1: "Home Delivery" - outlet_id: outlet1
Cart 2: "Office Delivery" - outlet_id: outlet2
```

## Business Logic

### Cart Validation

1. **Minimum Order Quantity**
   - Checked when adding/updating items
   - Error if quantity < min_order_quantity

2. **Outlet Consistency**
   - All items must be from same outlet
   - Outlet-specific items validated

3. **Item Availability**
   - Items must be active and available
   - Checked at add time and checkout

### Price Calculation

```javascript
// Automatic calculation
subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
item_count = items.reduce((sum, item) => sum + item.quantity, 0);
```

### Checkout Process

1. Validate cart has items
2. Validate outlet is selected
3. Create order from cart items
4. Clear cart after successful order
5. Return order details

## Error Handling

### Common Errors

**Empty Cart:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cart is empty"
  }
}
```

**Item Not Available:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Menu item is not available"
  }
}
```

**Minimum Quantity:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Butter Naan requires a minimum order quantity of 2"
  }
}
```

## Best Practices

### 1. Cart Naming
- Use descriptive names
- Include occasion or purpose
- Examples: "Birthday Party", "Office Lunch", "Weekend Dinner"

### 2. Cart Management
- Limit to 10 active carts per user
- Auto-archive old carts after 30 days
- Suggest merging similar carts

### 3. Performance
- Cache cart data locally
- Update cart count in real-time
- Lazy load cart items

### 4. UX Considerations
- Show cart switcher prominently
- Allow quick cart creation
- Provide cart preview on hover
- Enable drag-and-drop between carts

## Testing

### Test Scenarios

1. **Create Multiple Carts**
   - Create 3 different carts
   - Verify each has unique ID
   - Check all are listed

2. **Add Items to Different Carts**
   - Add items to Cart 1
   - Add different items to Cart 2
   - Verify items are in correct carts

3. **Duplicate Cart**
   - Duplicate a cart with 5 items
   - Verify all items copied
   - Check totals match

4. **Checkout Cart**
   - Checkout Cart 1
   - Verify order created
   - Check cart is cleared

5. **Delete Cart**
   - Delete a cart
   - Verify soft delete (is_active = false)
   - Check not in active list

## Migration

### For Existing Single Cart Systems

```javascript
// Migration script
async function migrateSingleCartToMulti() {
  const users = await db.collection('users').get();
  
  for (const user of users.docs) {
    // Get user's old cart items
    const oldCart = user.data().cart || [];
    
    if (oldCart.length > 0) {
      // Create new cart
      await db.collection('carts').add({
        user_id: user.id,
        name: 'My Cart',
        items: oldCart,
        subtotal: calculateSubtotal(oldCart),
        item_count: oldCart.length,
        is_active: true,
        created_at: new Date()
      });
      
      // Remove old cart field
      await user.ref.update({
        cart: admin.firestore.FieldValue.delete()
      });
    }
  }
}
```

## Summary

✅ **Multi-cart system implemented**  
✅ **Full CRUD operations**  
✅ **Duplicate and checkout features**  
✅ **Automatic calculations**  
✅ **Validation and error handling**  
✅ **Ready for frontend integration**

The multi-cart feature provides flexibility and convenience for customers to manage multiple shopping scenarios simultaneously.
