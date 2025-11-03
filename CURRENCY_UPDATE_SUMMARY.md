# Currency Update: USD ($) to INR (₹)

## Overview

All prices throughout the project have been updated from US Dollars ($) to Indian Rupees (₹).

## Changes Made

### 1. Demo Product Prices (scripts/seed-demo-products.js)

All menu item prices converted to INR:

#### Appetizers
- Samosa (2 pcs): $4.99 → ₹40
- Paneer Tikka: $8.99 → ₹250
- Chicken 65: $9.99 → ₹280
- Vegetable Pakora: $5.99 → ₹120
- Fish Amritsari: $11.99 → ₹350
- Papdi Chaat: $6.99 → ₹150

#### Main Course
- Butter Chicken: $14.99 → ₹420
- Palak Paneer: $12.99 → ₹320
- Chicken Tikka Masala: $15.99 → ₹450
- Dal Makhani: $10.99 → ₹280
- Lamb Rogan Josh: $17.99 → ₹550
- Chana Masala: $9.99 → ₹220
- Kadai Paneer: $13.99 → ₹350

#### Biryanis & Rice
- Chicken Biryani: $13.99 → ₹380
- Vegetable Biryani: $11.99 → ₹280
- Lamb Biryani: $16.99 → ₹480
- Jeera Rice: $5.99 → ₹120
- Egg Biryani: $10.99 → ₹250
- Hyderabadi Biryani: $15.99 → ₹420

#### Breads
- Butter Naan: $2.99 → ₹50
- Garlic Naan: $3.49 → ₹60
- Tandoori Roti: $2.49 → ₹30
- Cheese Naan: $4.49 → ₹80
- Aloo Paratha: $3.99 → ₹70
- Laccha Paratha: $3.49 → ₹60

#### Desserts
- Gulab Jamun (2 pcs): $4.99 → ₹80
- Rasmalai (2 pcs): $5.99 → ₹100
- Kheer: $4.49 → ₹70
- Gajar Halwa: $5.49 → ₹90
- Kulfi: $3.99 → ₹60
- Jalebi: $4.99 → ₹80

#### Beverages
- Mango Lassi: $4.99 → ₹80
- Masala Chai: $2.99 → ₹30
- Sweet Lassi: $3.99 → ₹60
- Salt Lassi: $3.99 → ₹60
- Fresh Lime Soda: $3.49 → ₹50
- Rose Milk: $4.49 → ₹70

#### Tandoori Specials
- Tandoori Chicken (Half): $12.99 → ₹350
- Chicken Malai Tikka: $13.99 → ₹380
- Seekh Kebab: $14.99 → ₹400
- Tandoori Prawns: $17.99 → ₹500
- Paneer Shashlik: $11.99 → ₹300
- Fish Tikka: $15.99 → ₹420

#### South Indian
- Masala Dosa: $8.99 → ₹180
- Idli Sambar (3 pcs): $6.99 → ₹120
- Medu Vada (3 pcs): $5.99 → ₹100
- Uttapam: $7.99 → ₹150
- Rava Dosa: $8.49 → ₹160
- Filter Coffee: $2.99 → ₹40

### 2. Order Controller (src/controllers/orderController.js)

**Delivery Fee Logic:**
- Old: Free delivery over $50, otherwise $5.99
- New: Free delivery over ₹500, otherwise ₹50

### 3. API Documentation (CUSTOMER_API_DOCUMENTATION.md)

Updated all price examples:
- Order totals
- Subtotals
- Delivery fees
- Discounts
- Coupon values
- Loyalty rewards
- Referral rewards

**Examples:**
- Coupon: "Get 20% off on orders above ₹500"
- Referral: "Get ₹50 off!"
- Min order value: ₹500
- Max discount: ₹100

## Price Conversion Logic

Approximate conversion rate used: **1 USD ≈ ₹80**

Prices were rounded to convenient Indian denominations:
- ₹30, ₹40, ₹50, ₹60, ₹70, ₹80, ₹90, ₹100
- ₹120, ₹150, ₹180, ₹220, ₹250, ₹280, ₹300
- ₹320, ₹350, ₹380, ₹400, ₹420, ₹450, ₹480, ₹500, ₹550

## Frontend Updates Required

### 1. Currency Display

Update all price displays to show ₹ symbol:

```javascript
// Old
<span>${price}</span>

// New
<span>₹{price}</span>
```

### 2. Number Formatting

Use Indian number formatting (lakhs/crores):

```javascript
// Format for Indian locale
const formattedPrice = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0
}).format(price);

// Output: ₹420
```

### 3. Input Validation

Update price input validation:

```javascript
// Old: Allow decimals
price: /^\d+\.\d{2}$/

// New: Whole numbers only
price: /^\d+$/
```

### 4. Payment Gateway

Update payment gateway configuration:
- Currency: INR
- Minimum amount: ₹1 (100 paise)
- All amounts in paise (multiply by 100)

```javascript
// Razorpay example
const options = {
  amount: price * 100, // Amount in paise
  currency: 'INR',
  // ...
};
```

## Database Considerations

### Existing Data

If you have existing orders/products in database:

**Option 1: Migration Script**
```javascript
// Multiply all prices by 80
db.collection('menu_items').find().forEach(item => {
  db.collection('menu_items').updateOne(
    { _id: item._id },
    { $set: { price: Math.round(item.price * 80) } }
  );
});
```

**Option 2: Fresh Start**
```bash
# Clear existing data
npm run clear-menu

# Seed with new INR prices
npm run seed-products
```

### Price Field Type

Prices are stored as **numbers** (not decimals):
- Old: `14.99` (float)
- New: `420` (integer)

This simplifies calculations and avoids floating-point errors.

## Testing

### 1. Verify Seed Data

```bash
# Clear old data
npm run clear-menu

# Seed with new INR prices
npm run seed-products

# Check prices in database
```

### 2. Test Order Calculations

```javascript
// Example order
{
  items: [
    { name: "Butter Chicken", price: 420, quantity: 1 },
    { name: "Butter Naan", price: 50, quantity: 2 }
  ],
  subtotal: 520,
  delivery_fee: 0, // Free over ₹500
  discount: 0,
  total: 520
}
```

### 3. Test Coupons

- Min order value: ₹500
- Discount: 20% (max ₹100)
- Order ₹600 → Discount ₹100 → Final ₹500

## API Response Examples

### Menu Item
```json
{
  "id": "item123",
  "name": "Butter Chicken",
  "price": 420,
  "currency": "INR"
}
```

### Order
```json
{
  "order_id": "order123",
  "subtotal": 840,
  "delivery_fee": 50,
  "discount": 90,
  "total": 800,
  "currency": "INR"
}
```

### Coupon
```json
{
  "code": "SAVE20",
  "discount_value": 20,
  "min_order_value": 500,
  "max_discount": 100,
  "currency": "INR"
}
```

## Summary

✅ All product prices converted to INR  
✅ Delivery fee logic updated (₹500 threshold)  
✅ Documentation updated with INR examples  
✅ Prices rounded to convenient denominations  
✅ Integer pricing (no decimals)  

**Next Steps:**
1. Update frontend to display ₹ symbol
2. Configure payment gateway for INR
3. Test all order calculations
4. Update mobile app currency display
5. Clear old data and reseed with new prices

---

**Currency:** Indian Rupee (₹)  
**Symbol:** ₹  
**Code:** INR  
**Format:** Whole numbers (no decimals)  
**Example:** ₹420, ₹50, ₹1,250
