# Customer API Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Base URL
```
http://localhost:3000/api
```

### 2. Register & Login
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "Test123!",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "role": "customer"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "Test123!"
  }'
```

Save the `access_token` from response!

### 3. Browse Menu
```bash
# Get full menu
curl http://localhost:3000/api/menu/full

# Get menu items
curl http://localhost:3000/api/menu/items?is_vegetarian=true
```

### 4. Place Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outlet_id": "outlet123",
    "order_type": "delivery",
    "items": [
      {
        "menu_item_id": "item123",
        "quantity": 2
      }
    ],
    "payment_method": "card"
  }'
```

### 5. Check Order Status
```bash
curl http://localhost:3000/api/orders/my-orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📱 Common Workflows

### Customer Registration Flow
1. `POST /auth/register` - Register
2. `GET /auth/profile` - Get profile
3. `POST /users/addresses` - Add delivery address

### Order Placement Flow
1. `GET /menu/full` - Browse menu
2. `POST /coupons/validate` - Validate coupon (optional)
3. `POST /orders` - Place order
4. `GET /orders/:orderId` - Track order

### Review Flow
1. `GET /orders/my-orders` - Get completed orders
2. `POST /reviews` - Submit review
3. `GET /reviews/my/reviews` - View my reviews

### Loyalty Flow
1. `GET /loyalty/account` - Check account
2. `GET /loyalty/milestone/progress` - Check progress
3. `POST /loyalty/milestone/claim` - Claim reward

## 🔑 Authentication

All protected endpoints require Bearer token:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## 🎯 Key Features

- ✅ Email/Password & OTP Authentication
- ✅ Browse menu with filters (vegetarian, vegan, spice level)
- ✅ Minimum order quantity validation
- ✅ Real-time order tracking
- ✅ Reviews & ratings
- ✅ Coupon system
- ✅ Loyalty rewards (milestone-based)
- ✅ Referral program
- ✅ Push notifications
- ✅ Multiple delivery addresses

## 📚 Full Documentation

See `CUSTOMER_API_DOCUMENTATION.md` for complete API reference.

## 🧪 Testing

```bash
# Seed demo products
npm run seed-products

# Clear menu data
npm run clear-menu
```

## 💡 Pro Tips

1. **Minimum Order Quantity:** Check `min_order_quantity` field before ordering
2. **Coupons:** Validate before checkout to show discount
3. **Loyalty:** Display milestone progress to encourage orders
4. **Reviews:** Only allow reviews for delivered orders
5. **Notifications:** Enable push notifications for order updates

## 🆘 Common Issues

**401 Unauthorized:** Token expired, refresh or login again  
**400 Validation Error:** Check request body format  
**429 Rate Limit:** Wait before retrying  
**404 Not Found:** Verify IDs are correct

## 📞 Support

Full docs: `CUSTOMER_API_DOCUMENTATION.md`  
Minimum order qty: `MINIMUM_ORDER_QUANTITY_FEATURE.md`  
Menu scripts: `scripts/README_SEED_PRODUCTS.md`
