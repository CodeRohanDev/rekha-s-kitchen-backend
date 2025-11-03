# Cart API Documentation for Mobile Developers

Complete guide for integrating cart functionality into your mobile application.

## Base URL
```
https://localhost:5050/api/v1/carts
```

## Authentication
All cart endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting
- 200 requests per 15 minutes per user
- Exceeding limit returns `RATE_LIMIT_EXCEEDED` error

---

## Table of Contents
1. [Cart Management](#cart-management)
2. [Cart Items](#cart-items)
3. [Cart Actions](#cart-actions)
4. [Price Calculation & Delivery Charges](#price-calculation--delivery-charges)
5. [Error Handling](#error-handling)
6. [Data Models](#data-models)
7. [Code Examples](#code-examples)

---

## Cart Management

### 1. Create Cart
Create a new shopping cart for the user.

**Endpoint:** `POST /api/v1/carts`

**Request Body:**
```json
{
  "name": "My Lunch Order",
  "outlet_id": "outlet_123",
  "notes": "Please prepare quickly"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Cart name (default: "My Cart") |
| outlet_id | string | No | Specific outlet ID |
| notes | string | No | Additional notes |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Cart created successfully",
  "data": {
    "cart": {
      "id": "cart_abc123",
      "user_id": "user_xyz789",
      "name": "My Lunch Order",
      "outlet_id": "outlet_123",
      "items": [],
      "subtotal": 0,
      "item_count": 0,
      "notes": "Please prepare quickly",
      "is_active": true,
      "created_at": "2025-10-27T10:30:00Z",
      "updated_at": "2025-10-27T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `404 NOT_FOUND` - Outlet not found or inactive
- `500 INTERNAL_ERROR` - Server error

---

### 2. Get All User Carts
Retrieve all carts for the authenticated user.

**Endpoint:** `GET /api/v1/carts`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| is_active | string | "true" | Filter by active status ("true", "false", "all") |

**Example Request:**
```
GET /api/v1/carts?is_active=true
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "carts": [
      {
        "id": "cart_abc123",
        "user_id": "user_xyz789",
        "name": "My Lunch Order",
        "outlet_id": "outlet_123",
        "items": [
          {
            "menu_item_id": "item_001",
            "name": "Margherita Pizza",
            "price": 12.99,
            "quantity": 2,
            "special_instructions": "Extra cheese",
            "subtotal": 25.98,
            "image_url": "https://...",
            "min_order_quantity": 1
          }
        ],
        "subtotal": 25.98,
        "item_count": 2,
        "notes": null,
        "is_active": true,
        "created_at": "2025-10-27T10:30:00Z",
        "updated_at": "2025-10-27T10:35:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### 3. Get Single Cart
Retrieve details of a specific cart.

**Endpoint:** `GET /api/v1/carts/:cartId`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| cartId | string | Cart ID |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "cart_abc123",
      "user_id": "user_xyz789",
      "name": "My Lunch Order",
      "outlet_id": "outlet_123",
      "items": [...],
      "subtotal": 25.98,
      "item_count": 2,
      "notes": null,
      "is_active": true,
      "created_at": "2025-10-27T10:30:00Z",
      "updated_at": "2025-10-27T10:35:00Z"
    }
  }
}
```

**Error Responses:**
- `404 NOT_FOUND` - Cart not found
- `403 FORBIDDEN` - Not cart owner

---

### 4. Update Cart
Update cart details (name, notes, outlet).

**Endpoint:** `PUT /api/v1/carts/:cartId`

**Request Body:**
```json
{
  "name": "Updated Cart Name",
  "notes": "New notes",
  "outlet_id": "outlet_456"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | New cart name |
| notes | string | No | Updated notes |
| outlet_id | string | No | Change outlet |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart updated",
  "data": {
    "cart": {
      "id": "cart_abc123",
      "name": "Updated Cart Name",
      "notes": "New notes",
      "outlet_id": "outlet_456",
      ...
    }
  }
}
```

---

### 5. Delete Cart
Soft delete a cart (marks as inactive).

**Endpoint:** `DELETE /api/v1/carts/:cartId`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart deleted"
}
```

**Error Responses:**
- `404 NOT_FOUND` - Cart not found
- `403 FORBIDDEN` - Not cart owner

---

## Cart Items

### 6. Add Item to Cart
Add a menu item to the cart or increase quantity if already exists.

**Endpoint:** `POST /api/v1/carts/:cartId/items`

**Request Body:**
```json
{
  "menu_item_id": "item_001",
  "quantity": 2,
  "special_instructions": "Extra cheese, no onions"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| menu_item_id | string | Yes | Menu item ID |
| quantity | number | Yes | Quantity to add |
| special_instructions | string | No | Special requests |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cart": {
      "id": "cart_abc123",
      "items": [
        {
          "menu_item_id": "item_001",
          "name": "Margherita Pizza",
          "price": 12.99,
          "quantity": 2,
          "special_instructions": "Extra cheese, no onions",
          "subtotal": 25.98,
          "image_url": "https://...",
          "min_order_quantity": 1
        }
      ],
      "subtotal": 25.98,
      "item_count": 2,
      ...
    }
  }
}
```

**Error Responses:**
- `400 VALIDATION_ERROR` - Item not available, minimum quantity not met, or outlet mismatch
- `404 NOT_FOUND` - Cart not found
- `403 FORBIDDEN` - Not cart owner

**Important Notes:**
- If item already exists in cart, quantity is added to existing quantity
- Validates minimum order quantity requirements
- Checks outlet-specific item availability
- Automatically calculates subtotals

---

### 7. Update Cart Item
Update quantity or special instructions for an item.

**Endpoint:** `PUT /api/v1/carts/:cartId/items/:itemId`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| cartId | string | Cart ID |
| itemId | string | Menu item ID |

**Request Body:**
```json
{
  "quantity": 3,
  "special_instructions": "Well done"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| quantity | number | Yes | New quantity |
| special_instructions | string | No | Updated instructions |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "cart": {
      "id": "cart_abc123",
      "items": [...],
      "subtotal": 38.97,
      "item_count": 3,
      ...
    }
  }
}
```

**Error Responses:**
- `400 VALIDATION_ERROR` - Quantity below minimum
- `404 NOT_FOUND` - Cart or item not found
- `403 FORBIDDEN` - Not cart owner

---

### 8. Remove Item from Cart
Remove a specific item from the cart.

**Endpoint:** `DELETE /api/v1/carts/:cartId/items/:itemId`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| cartId | string | Cart ID |
| itemId | string | Menu item ID to remove |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "cart": {
      "id": "cart_abc123",
      "items": [],
      "subtotal": 0,
      "item_count": 0,
      ...
    }
  }
}
```--

### 9. Clear Cart
Remove all items from the cart.

**Endpoint:** `POST /api/v1/carts/:cartId/clear`

**Successsponse (200):**
```json
{
  "success": true,
  "message": "Cart cleared",
  "data": {
    "cart": {
      "id": "cart_abc123",
      "items": [],
      "subtotal": 0,
      "item_count": 
      ...
    }
  }
}
```

---

## Cart Actions

### 10. Duplicate Cart
Create a copy of an existing cart.

**Endpoint:** `POST /api/v1/carts/:cartId/duplicate`

**Request Body:**
```json
{
  "name": "My New Cart"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Name for duplicated cart (default: "Original Name (Copy)") |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Cart duplicated",
  "data": {
    "cart": {
      "id": "cart_new456",
      "name": "My New Cart",
      "items": [...],
      "subtotal": 25.98,
      ...
    }
  }
}
```

**Use Cases:**
- Reorder previous orders
- Create template carts
- Share cart configurations

---

### 11. Checkout Cart
Convert cart to an order.

**Endpoint:** `POST /api/v1/carts/:cartId/checkout`

**Request Body:**
```json
{
  "order_type": "delivery",
  "delivery_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "payment_method": "card",
  "coupon_code": "SAVE10",
  "special_instructions": "Ring doorbell twice"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| order_type | string | Yes | "delivery" or "pickup" |
| delivery_address | object | Conditional | Required if order_type is "delivery" |
| payment_method | string | Yes | Payment method |
| coupon_code | string | No | Discount coupon |
| special_instructions | string | No | Order instructions |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "order_789xyz",
      "order_number": "ORD-20251027-001",
      "stat "pending",
      "total": 25.98,
      ...
    }
  }
}
```

**Error Responses:**
- `400 VALIDATION_ERROR` - Empty cart or missing outlet
- `404 NOT_FOUND` - Cart not found
- `403 FORBID - Not cart owner

**Important Notes:**
- Cart is automatically cleared after successful checkout
- Creates order using OrderController
- Validates outlet selection
- Applies coupons if provided

---

## Price Calculation & Delivery Charges

### Understanding Order Pricing

When calculating the final price for a customer's order, several components are involved:

```
Final Total = Subtotal + Delivery Fee + Tax - Discount
```

### Price Breakdown Components

| Component | Description | Calculation |
|-----------|-------------|-------------|
| **Subtotal** | Sum of all item prices × quantities | Σ(item.price × item.quantity) |
| **Delivery Fee** | Charge for delivery service | Based on subtotal and order type |
| **Tax** | Government tax (GST/VAT) | 8% of subtotal |
| **Discount** | Coupon/promotion discount | Based on applied coupon |
| **Final Total** | Amount customer pays | Subtotal + Delivery Fee + Tax - Discount |

---

### 12. Calculate Order Price
Get complete price breakdown before checkout.

**Endpoint:** `POST /api/v1/carts/:cartId/calculate-price`

**Request Body:**
```json
{
  "order_type": "delivery",
  "coupon_code": "SAVE10"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| order_type | string | Yes | "delivery" or "pickup" |
| coupon_code | string | No | Discount coupon code |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "price_breakdown": {
      "subtotal": 450.00,
      "delivery_fee": 50.00,
      "tax": 36.00,
      "discount": 45.00,
      "total": 491.00
    },
    "delivery_info": {
      "is_free_delivery": false,
      "free_delivery_threshold": 500.00,
      "amount_for_free_delivery": 50.00
    },
    "coupon_applied": {
      "code": "SAVE10",
      "discount_type": "percentage",
      "discount_value": 10,
      "discount_amount": 45.00
    },
    "items_count": 5,
    "estimated_delivery_time": 45
  }
}
```

**Error Responses:**
- `400 VALIDATION_ERROR` - Invalid coupon or empty cart
- `404 NOT_FOUND` - Cart not found

---

### Delivery Fee Rules

The delivery fee is calculated based on the following rules:

#### Current Implementation:
```javascript
// Delivery fee logic
if (order_type === 'delivery') {
  deliveryFee = subtotal > 500 ? 0 : 50;
}
// Pickup orders have no delivery fee
```

#### Delivery Fee Structure:

| Subtotal Amount | Delivery Fee | Notes |
|-----------------|--------------|-------|
| ₹0 - ₹499 | ₹50 | Standard delivery charge |
| ₹500+ | ₹0 (FREE) | Free delivery on orders above ₹500 |
| Pickup orders | ₹0 | No delivery fee for pickup |

---

### Tax Calculation

**Tax Rate:** 8% (GST/VAT)

**Applied On:** Subtotal only (not on delivery fee)

**Example:**
```
Subtotal: ₹450
Tax: ₹450 × 0.08 = ₹36
```

---

### Discount/Coupon Application

Discounts are applied after calculating subtotal but before adding delivery fee and tax.

**Discount Types:**
1. **Percentage Discount** - e.g., 10% off
2. **Fixed Amount** - e.g., ₹50 off
3. **Free Delivery** - Waives delivery fee
4. **Buy X Get Y** - Item-specific offers

**Example Calculation:**
```
Subtotal: ₹450
Coupon (10% off): -₹45
After Discount: ₹405
Delivery Fee: ₹50
Tax (8% of ₹450): ₹36
Final Total: ₹491
```

---

### Complete Price Calculation Example

#### Scenario: Delivery Order with Coupon

**Cart Items:**
- Pizza × 2 @ ₹200 each = ₹400
- Garlic Bread × 1 @ ₹50 = ₹50

**Calculation Steps:**

```javascript
// Step 1: Calculate Subtotal
subtotal = (200 × 2) + (50 × 1) = ₹450

// Step 2: Check Delivery Fee
order_type = "delivery"
delivery_fee = subtotal > 500 ? 0 : 50
delivery_fee = ₹50

// Step 3: Apply Coupon (if valid)
coupon_code = "SAVE10" // 10% off
discount = subtotal × 0.10 = ₹45

// Step 4: Calculate Tax
tax = subtotal × 0.08 = ₹36

// Step 5: Calculate Final Total
total = subtotal + delivery_fee + tax - discount
total = 450 + 50 + 36 - 45 = ₹491
```

**Final Breakdown:**
```json
{
  "subtotal": 450.00,
  "delivery_fee": 50.00,
  "tax": 36.00,
  "discount": 45.00,
  "total": 491.00
}
```

---

### Display Recommendations for Mobile UI

#### 1. Cart Screen - Show Running Total
```
Items Subtotal:        ₹450.00
─────────────────────────────
Estimated Delivery:     ₹50.00
(FREE on orders ₹500+)
```

#### 2. Before Checkout - Show Complete Breakdown
```
Order Summary
─────────────────────────────
Items Subtotal:        ₹450.00
Delivery Fee:           ₹50.00
Tax (8%):               ₹36.00
Discount (SAVE10):     -₹45.00
─────────────────────────────
Total Amount:          ₹491.00
```

#### 3. Free Delivery Progress Indicator
```
🚚 Add ₹50 more for FREE delivery!
[████████░░] 90% to free delivery
```

#### 4. Coupon Section
```
💰 Have a coupon code?
[Enter code] [Apply]

✓ SAVE10 applied - You saved ₹45!
```

---

### Implementation Tips

#### 1. Real-time Price Updates
Update price breakdown whenever:
- Items are added/removed
- Quantities change
- Order type switches (delivery ↔ pickup)
- Coupon is applied/removed

#### 2. Show Savings Opportunities
```javascript
// Alert user about free delivery threshold
if (order_type === 'delivery' && subtotal < 500) {
  const amountNeeded = 500 - subtotal;
  showMessage(`Add ₹${amountNeeded} more for FREE delivery!`);
}
```

#### 3. Validate Before Checkout
```javascript
// Ensure cart meets minimum requirements
if (subtotal < minimumOrderValue) {
  showError(`Minimum order value is ₹${minimumOrderValue}`);
  return;
}
```

#### 4. Handle Coupon Validation
```javascript
async function applyCoupon(code) {
  try {
    const result = await CartService.calculatePrice(cartId, {
      order_type: selectedOrderType,
      coupon_code: code
    });
    
    if (result.success) {
      showSuccess(`Coupon applied! You saved ₹${result.data.coupon_applied.discount_amount}`);
      updatePriceDisplay(result.data.price_breakdown);
    }
  } catch (error) {
    showError('Invalid or expired coupon code');
  }
}
```

---

### API Integration Example

```javascript
// Calculate price before checkout
async function calculateOrderPrice(cartId, orderType, couponCode = null) {
  const token = await getAuthToken();
  
  const response = await fetch(
    `${baseURL}/carts/${cartId}/calculate-price`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_type: orderType,
        coupon_code: couponCode
      })
    }
  );

  const result = await response.json();
  
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error.message);
  }
}

// Usage in your app
const priceData = await calculateOrderPrice('cart_123', 'delivery', 'SAVE10');

console.log('Subtotal:', priceData.price_breakdown.subtotal);
console.log('Delivery:', priceData.price_breakdown.delivery_fee);
console.log('Tax:', priceData.price_breakdown.tax);
console.log('Discount:', priceData.price_breakdown.discount);
console.log('Total:', priceData.price_breakdown.total);

// Show free delivery progress
if (!priceData.delivery_info.is_free_delivery) {
  console.log(
    `Add ₹${priceData.delivery_info.amount_for_free_delivery} more for free delivery!`
  );
}
```

---

### Important Notes

1. **Tax Calculation**: Tax is always calculated on the subtotal, not on the discounted amount
2. **Delivery Fee**: Applied based on subtotal before discount
3. **Minimum Order**: Some outlets may have minimum order requirements
4. **Dynamic Pricing**: Delivery fees may vary by location or time (future enhancement)
5. **Rounding**: All amounts are rounded to 2 decimal places

---

## Error Handling

### Standard Error Response Format
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
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Handling Best Practices

```javascript
try {
  const response = await fetch('/api/v1/carts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cartData)
  });

  const result = await response.json();

  if (!result.success) {
    switch (result.error.code) {
      case 'VALIDATION_ERROR':
        showValidationError(result.error.message);
        break;
      case 'NOT_FOUND':
        showNotFoundError();
        break;
      case 'RATE_LIMIT_EXCEEDED':
        showRateLimitWarning();
        break;
      default:
        showGenericError();
    }
  }
} catch (error) {
  showNetworkError();
}
```

---

## Data Models

### Cart Object
```typescript
interface Cart {
  id: string;
  user_id: string;
  name: string;
  outlet_id: string | null;
  items: CartItem[];
  subtotal: number;
  item_count: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
```

### Cart Item Object
```typescript
interface CartItem {
  menu_item_id: str
  name: string;
  price: number;
  quantity: number;
  special_instructions: string | null;
  subtotal: number;
  image_url: string;
  min_order_quantity: number;
}
```

---

## Code Examples

### React Native Example

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

class CartService {
  constructor() {
    this.baseURL = 'https://your-api-domain.com/api/v1';
  }

  async getAuthToken() {
    return await AsyncStorage.getItem('auth_token');
  }

  async createCart(name, outletId) {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseURL}/carts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        outlet_id: outletId
      })
    });

    return await response.json();
  }

  async getUserCarts() {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseURL}/carts?is_active=true`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return await response.json();
  }

  async addItemToCart(cartId, menuItemId, quantity, instructions) {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseURL}/carts/${cartId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        menu_item_id: menuItemId,
        quantity,
        special_instructions: instructions
      })
    });

    return await response.json();
  }

  async updateCartItem(cartId, itemId, quantity, instructions) {
    const token = await this.getAuthToken();
    
    const response = await fetch(
      `${this.baseURL}/carts/${cartId}/items/${itemId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity,
          special_instructions: instructions
        })
      }
    );

    return await response.json();
  }

  async removeCartItem(cartId, itemId) {
    const token = await this.getAuthToken();
    
    const response = await fetch(
      `${this.baseURL}/carts/${cartId}/items/${itemId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return await response.json();
  }

  async calculatePrice(cartId, orderType, couponCode = null) {
    const token = await this.getAuthToken();
    
    const response = await fetch(
      `${this.baseURL}/carts/${cartId}/calculate-price`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_type: orderType,
          coupon_code: couponCode
        })
      }
    );

    return await response.json();
  }

  async checkoutCart(cartId, checkoutData) {
    const token = await this.getAuthToken();
    
    const response = await fetch(
      `${this.baseURL}/carts/${cartId}/checkout`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutData)
      }
    );

    return await response.json();
  }
}

export default new CartService();
```

### Flutter/Dart Example

```dart
impo'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class CartService {
  final String baseURL = 'https://your-api-domain.com/api/v1';

  Future<String?> getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<Map<String, String>> getHeaders() async {
    final token = await getAuthToken();
    return {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };
  }

  Future<Map<String, dynamic>> createCart(String name, String? outletId) async {
    final headers = await getHeaders();
    
    final response = await http.post(
      Uri.parse('$baseURL/carts'),
      headers: headers,
      body: jsonEncode({
        'name': name,
        'outlet_id': outletId,
      }),
    );

    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> getUserCarts() async {
    final headers = await getHeaders();
    
    final response = await http.get(
      Uri.parse('$baseURL/carts?is_active=true'),
      headers: headers,
    );

    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> addItemToCart(
    String cartId,
    String menuItemId,
    int quantity,
    String? instructions,
  ) async {
    final headers = await getHeaders();
    
    final response = await http.post(
      Uri.parse('$baseURL/carts/$cartId/items'),
      headers: headers,
      body: jsonEncode({
        'menu_item_id': menuItemId,
        'quantity': quantity,
        'special_instructions': instructions,
      }),
    );

    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> updateCartItem(
    String cartId,
    String itemId,
    int quantity,
    String? instructions,
  ) async {
    final headers = await getHeaders();
    
    final response = await http.put(
      Uri.parse('$baseURL/carts/$cartId/items/$itemId'),
      headers: headers,
      body: jsonEncode({
        'quantity': quantity,
        'special_instructions': instructions,
      }),
    );

    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> calculatePrice(
    String cartId,
    String orderType,
    String? couponCode,
  ) async {
    final headers = await getHeaders();
    
    final response = await http.post(
      Uri.parse('$baseURL/carts/$cartId/calculate-price'),
      headers: headers,
      body: jsonEncode({
        'order_type': orderType,
        'coupon_code': couponCode,
      }),
    );

    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> checkoutCart(
    String cartId,
    Map<String, dynamic> checkoutData,
  ) async {
    final headers = await getHeaders();
    
    final response = await http.post(
      Uri.parse('$baseURL/carts/$cartId/checkout'),
      headers: headers,
      body: jsonEncode(checkoutData),
    );

    return jsonDecode(response.body);
  }
}
```

### Swift/iOS Example

```swift
import Foundation

class CartService {
    let baseURL = "https://your-api-domain.com/api/v1"
    
    func getAuthToken() -> String? {
        return UserDefaults.standard.string(forKey: "auth_token")
    }
    
    func createCart(name: String, outletId: String?, completion: @escaping (Result<[String: Any], Error>) -> Void) {
        guard let token = getAuthToken() else { return }
        guard let url = URL(string: "\(baseURL)/carts") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "name": name,
            "outlet_id": outletId as Any
        ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else { return }
            
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                completion(.success(json))
            }
        }.resume()
    }
    
    func addItemToCart(cartId: String, menuItemId: String, quantity: Int, instructions: String?, completion: @escaping (Result<[String: Any], Error>) -> Void) {
        guard let token = getAuthToken() else { return }
        guard let url = URL(string: "\(baseURL)/carts/\(cartId)/items") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "menu_item_id": menuItemId,
            "quantity": quantity,
            "special_instructions": instructions as Any
        ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else { return }
            
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                completion(.success(json))
            }
        }.resume()
    }
    
    func calculatePrice(cartId: String, orderType: String, couponCode: String?, completion: @escaping (Result<[String: Any], Error>) -> Void) {
        guard let token = getAuthToken() else { return }
        guard let url = URL(string: "\(baseURL)/carts/\(cartId)/calculate-price") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "order_type": orderType,
            "coupon_code": couponCode as Any
        ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else { return }
            
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                completion(.success(json))
            }
        }.resume()
    }
}
```

---

## Implementation Tips

### 1. Multi-Cart Support
Users can have multiple active carts simultaneously. Consider:
- Showing cart selector in UI
- Default to most recently updated cart
- Allow naming carts for easy identification

### 2. Real-time Price Updates
Call the calculate-price endpoint whenever:
- User switches between delivery/pickup
- Items are added/removed from cart
- User applies/removes a coupon
- Show live price breakdown to user

```javascript
// Example: Update price when order type changes
async function onOrderTypeChange(newType) {
  const priceData = await CartService.calculatePrice(
    currentCartId, 
    newType, 
    appliedCoupon
  );
  updatePriceDisplay(priceData.price_breakdown);
  updateDeliveryInfo(priceData.delivery_info);
}
```

### 3. Offline Support
- Cache cart data locally
- Queue operations when offline
- Sync when connection restored
- Show cached price with "offline" indicator

### 4. Validation
- Check minimum order quantities before adding
- Validate outlet availability
- Show clear error messages
- Validate coupon before checkout

### 5. UX Best Practices
- Show item images in cart
- Display running subtotal prominently
- Show free delivery progress bar
- Allow quick quantity adjustments
- Provide clear checkout flow with price breakdown
- Highlight savings from coupons

---

## Practical Implementation Example

### React Native Cart Screen with Price Calculation

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import CartService from './services/CartService';

const CartScreen = ({ cartId }) => {
  const [cart, setCart] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [orderType, setOrderType] = useState('delivery');
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate price whenever cart or order type changes
  useEffect(() => {
    if (cart) {
      calculatePrice();
    }
  }, [cart, orderType]);

  const calculatePrice = async () => {
    try {
      setLoading(true);
      const result = await CartService.calculatePrice(
        cartId,
        orderType,
        couponCode || null
      );
      
      if (result.success) {
        setPriceData(result.data);
      }
    } catch (error) {
      console.error('Price calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    await calculatePrice();
  };

  const toggleOrderType = () => {
    setOrderType(prev => prev === 'delivery' ? 'pickup' : 'delivery');
  };

  if (!priceData) {
    return <ActivityIndicator />;
  }

  const { price_breakdown, delivery_info, coupon_applied } = priceData;

  return (
    <View style={{ padding: 16 }}>
      {/* Order Type Toggle */}
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TouchableOpacity 
          onPress={toggleOrderType}
          style={{ 
            flex: 1, 
            padding: 12, 
            backgroundColor: orderType === 'delivery' ? '#007AFF' : '#E0E0E0' 
          }}
        >
          <Text>Delivery</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={toggleOrderType}
          style={{ 
            flex: 1, 
            padding: 12, 
            backgroundColor: orderType === 'pickup' ? '#007AFF' : '#E0E0E0' 
          }}
        >
          <Text>Pickup</Text>
        </TouchableOpacity>
      </View>

      {/* Free Delivery Progress */}
      {orderType === 'delivery' && !delivery_info.is_free_delivery && (
        <View style={{ 
          backgroundColor: '#FFF3CD', 
          padding: 12, 
          borderRadius: 8,
          marginBottom: 16 
        }}>
          <Text style={{ color: '#856404' }}>
            🚚 Add ₹{delivery_info.amount_for_free_delivery.toFixed(2)} more for FREE delivery!
          </Text>
          <View style={{ 
            height: 4, 
            backgroundColor: '#E0E0E0', 
            borderRadius: 2,
            marginTop: 8 
          }}>
            <View style={{ 
              height: 4, 
              backgroundColor: '#28A745',
              width: `${(price_breakdown.subtotal / 500) * 100}%`,
              borderRadius: 2 
            }} />
          </View>
        </View>
      )}

      {/* Coupon Section */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Have a coupon?</Text>
        <View style={{ flexDirection: 'row' }}>
          <TextInput
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Enter coupon code"
            style={{ 
              flex: 1, 
              borderWidth: 1, 
              borderColor: '#CCC',
              padding: 10,
              borderRadius: 4 
            }}
          />
          <TouchableOpacity 
            onPress={applyCoupon}
            style={{ 
              backgroundColor: '#007AFF',
              padding: 10,
              marginLeft: 8,
              borderRadius: 4 
            }}
          >
            <Text style={{ color: 'white' }}>Apply</Text>
          </TouchableOpacity>
        </View>
        {coupon_applied && (
          <Text style={{ color: '#28A745', marginTop: 8 }}>
            ✓ {coupon_applied.code} applied - You saved ₹{coupon_applied.discount_amount.toFixed(2)}!
          </Text>
        )}
      </View>

      {/* Price Breakdown */}
      <View style={{ 
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 8 
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          Order Summary
        </Text>
        
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>Items Subtotal:</Text>
            <Text>₹{price_breakdown.subtotal.toFixed(2)}</Text>
          </View>
        </View>

        {orderType === 'delivery' && (
          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Delivery Fee:</Text>
              <Text style={{ color: delivery_info.is_free_delivery ? '#28A745' : '#000' }}>
                {delivery_info.is_free_delivery ? 'FREE' : `₹${price_breakdown.delivery_fee.toFixed(2)}`}
              </Text>
            </View>
          </View>
        )}

        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>Tax (8%):</Text>
            <Text>₹{price_breakdown.tax.toFixed(2)}</Text>
          </View>
        </View>

        {price_breakdown.discount > 0 && (
          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#28A745' }}>Discount:</Text>
              <Text style={{ color: '#28A745' }}>-₹{price_breakdown.discount.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={{ 
          borderTopWidth: 1, 
          borderTopColor: '#DEE2E6',
          paddingTop: 12,
          marginTop: 8 
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Total Amount:</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#007AFF' }}>
              ₹{price_breakdown.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        onPress={() => proceedToCheckout()}
        style={{
          backgroundColor: '#28A745',
          padding: 16,
          borderRadius: 8,
          marginTop: 20,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          Proceed to Checkout - ₹{price_breakdown.total.toFixed(2)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CartScreen;
```

---

## Testing

### Test Credentials
Contact your backend team for test credentials and sandbox environment.

### Test Scenarios
1. Create cart with and without outlet
2. Add items respecting minimum quantities
3. Update item quantities
4. Remove items and clear cart
5. Duplicate existing cart
6. Calculate price with delivery/pickup
7. Apply valid and invalid coupons
8. Test free delivery threshold
9. Complete checkout flow
10. Handle error cases (invalid items, outlet mismatch)

---

## Support

For questions or issues:
- Backend Team: backend@yourcompany.com
- API Documentation: https://docs.yourapi.com
- Slack Channel: #mobile-dev-support

---

**Last Updated:** October 27, 2025
**API Version:** v1
**Document Version:** 1.0.0
