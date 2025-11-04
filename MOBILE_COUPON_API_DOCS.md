# Mobile Coupon API Documentation

## Base URL
```
http://your-api-domain.com/api/v1/coupons
```

## Authentication
All coupon endpoints require authentication via Bearer token:
```
Authorization: Bearer <access_token>
```

---

## Overview

The coupon system allows customers to apply discount codes to their orders. Coupons can offer percentage or fixed amount discounts with various conditions and restrictions.

---

## Endpoints

### 1. Get Available Coupons

Get all active coupons available for the current user.

**Endpoint:** `GET /available`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": "coupon_abc123",
        "code": "WELCOME20",
        "description": "Get 20% off on your first order",
        "discount_type": "percentage",
        "discount_value": 20,
        "min_order_value": 299,
        "max_discount": 100,
        "valid_from": "2025-10-01T00:00:00Z",
        "valid_until": "2025-12-31T23:59:59Z",
        "usage_per_user": 1, 
        "first_order_only": true,
        "is_active": true,
        "applicable_outlets": [],
        "applicable_items": [],
        "applicable_categories": []
      },
      {
        "id": "coupon_def456",
        "code": "SAVE50",
        "description": "Flat ₹50 off on orders above ₹500",
        "discount_type": "fixed",
        "discount_value": 50,
        "min_order_value": 500,
        "max_discount": null,
        "valid_from": "2025-10-15T00:00:00Z",
        "valid_until": "2025-11-15T23:59:59Z",
        "usage_per_user": 3,
        "first_order_only": false,
        "is_active": true,
        "applicable_outlets": ["outlet_123"],
        "applicable_items": [],
        "applicable_categories": ["category_456"]
      }
    ],
    "total": 2
  }
}
```

**Response Fields:**
- `code`: Coupon code to apply
- `description`: User-friendly description
- `discount_type`: "percentage" or "fixed"
- `discount_value`: Discount amount (% or ₹)
- `min_order_value`: Minimum order amount required
- `max_discount`: Maximum discount cap (for percentage coupons)
- `valid_from`: Coupon start date
- `valid_until`: Coupon expiry date (null = no expiry)
- `usage_per_user`: How many times user can use this coupon
- `first_order_only`: Only for first-time orders
- `applicable_outlets`: Empty array = all outlets
- `applicable_items`: Empty array = all items
- `applicable_categories`: Empty array = all categories

---

### 2. Validate Coupon

Validate a coupon code and calculate the discount for a specific order.

**Endpoint:** `POST /validate`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "WELCOME20",
  "outlet_id": "outlet_abc123",
  "order_total": 500,
  "items": [
    {
      "menu_item_id": "item_123",
      "quantity": 2
    },
    {
      "menu_item_id": "item_456",
      "quantity": 1
    }
  ]
}
```

**Field Validations:**
- `code`: Required, string
- `outlet_id`: Required, string
- `order_total`: Required, positive number
- `items`: Required, array with at least 1 item
  - `menu_item_id`: Required, string
  - `quantity`: Required, integer >= 1

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "coupon": {
      "id": "coupon_abc123",
      "code": "WELCOME20",
      "description": "Get 20% off on your first order",
      "discount_type": "percentage",
      "discount_value": 20
    },
    "discount": {
      "amount": 100,
      "original_total": 500,
      "final_total": 400,
      "savings": 100
    },
    "message": "Coupon applied successfully"
  }
}
```

**Error Responses:**

**Invalid Coupon Code (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Invalid coupon code"
  }
}
```

**Coupon Not Active (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Coupon is not active"
  }
}
```

**Coupon Not Yet Valid (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Coupon is not yet valid"
  }
}
```

**Coupon Expired (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Coupon has expired"
  }
}
```

**Usage Limit Reached (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Coupon usage limit reached"
  }
}
```

**User Usage Limit Reached (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "You have already used this coupon maximum times"
  }
}
```

**Minimum Order Value Not Met (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Minimum order value of ₹299 required"
  }
}
```

**First Order Only (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "This coupon is only valid for first orders"
  }
}
```

**Not Applicable to Outlet (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Coupon not applicable to this outlet"
  }
}
```

---

## Common Error Responses

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "code",
        "message": "\"code\" is required"
      }
    ]
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**429 Rate Limit Exceeded:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to process request"
  }
}
```

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per user
- Applies to all coupon endpoints
- Authentication required for all endpoints

---

## Coupon Types

### Percentage Discount
```json
{
  "discount_type": "percentage",
  "discount_value": 20,
  "max_discount": 100
}
```
- Gives 20% off
- Maximum discount capped at ₹100
- Example: ₹500 order → ₹100 discount (20% = ₹100, within cap)
- Example: ₹1000 order → ₹100 discount (20% = ₹200, but capped at ₹100)

### Fixed Discount
```json
{
  "discount_type": "fixed",
  "discount_value": 50,
  "max_discount": null
}
```
- Gives flat ₹50 off
- No maximum discount cap needed
- Example: ₹500 order → ₹50 discount
- Example: ₹1000 order → ₹50 discount

---

## UI Implementation Guide

### 1. Coupons Screen Layout

**Recommended Structure:**
```
┌─────────────────────────────┐
│  Available Coupons          │
├─────────────────────────────┤
│  ┌─────────────────────┐    │
│  │ WELCOME20      20%  │    │
│  │ Get 20% off on      │    │
│  │ your first order    │    │
│  │                     │    │
│  │ Min: ₹299  Max: ₹100│    │
│  │ Valid till: Dec 31  │    │
│  │         [APPLY]     │    │
│  └─────────────────────┘    │
│                              │
│  ┌─────────────────────┐    │
│  │ SAVE50        ₹50   │    │
│  │ Flat ₹50 off on     │    │
│  │ orders above ₹500   │    │
│  │                     │    │
│  │ Min: ₹500           │    │
│  │ Valid till: Nov 15  │    │
│  │         [APPLY]     │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### 2. Implementation Example (Flutter/Dart)

**Fetch Available Coupons:**
```dart
class CouponService {
  final String baseUrl = 'http://your-api.com/api/v1/coupons';
  
  Future<List<Coupon>> getAvailableCoupons() async {
    final response = await http.get(
      Uri.parse('$baseUrl/available'),
      headers: {
        'Authorization': 'Bearer $accessToken',
      },
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data']['coupons'] as List)
        .map((coupon) => Coupon.fromJson(coupon))
        .toList();
    } else {
      throw Exception('Failed to load coupons');
    }
  }
  
  Future<CouponValidation> validateCoupon({
    required String code,
    required String outletId,
    required double orderTotal,
    required List<CartItem> items,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/validate'),
      headers: {
        'Authorization': 'Bearer $accessToken',
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'code': code,
        'outlet_id': outletId,
        'order_total': orderTotal,
        'items': items.map((item) => {
          'menu_item_id': item.id,
          'quantity': item.quantity,
        }).toList(),
      }),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return CouponValidation.fromJson(data['data']);
    } else {
      final error = json.decode(response.body);
      throw CouponException(error['error']['message']);
    }
  }
}
```

**Coupon Model:**
```dart
class Coupon {
  final String id;
  final String code;
  final String description;
  final String discountType;
  final double discountValue;
  final double minOrderValue;
  final double? maxDiscount;
  final DateTime validFrom;
  final DateTime? validUntil;
  final int usagePerUser;
  final bool firstOrderOnly;
  final bool isActive;
  
  Coupon({
    required this.id,
    required this.code,
    required this.description,
    required this.discountType,
    required this.discountValue,
    required this.minOrderValue,
    this.maxDiscount,
    required this.validFrom,
    this.validUntil,
    required this.usagePerUser,
    required this.firstOrderOnly,
    required this.isActive,
  });
  
  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      id: json['id'],
      code: json['code'],
      description: json['description'],
      discountType: json['discount_type'],
      discountValue: json['discount_value'].toDouble(),
      minOrderValue: json['min_order_value'].toDouble(),
      maxDiscount: json['max_discount']?.toDouble(),
      validFrom: DateTime.parse(json['valid_from']),
      validUntil: json['valid_until'] != null 
        ? DateTime.parse(json['valid_until']) 
        : null,
      usagePerUser: json['usage_per_user'],
      firstOrderOnly: json['first_order_only'],
      isActive: json['is_active'],
    );
  }
  
  String get discountText {
    if (discountType == 'percentage') {
      return '${discountValue.toInt()}% OFF';
    } else {
      return '₹${discountValue.toInt()} OFF';
    }
  }
  
  String get validityText {
    if (validUntil == null) {
      return 'No expiry';
    }
    final formatter = DateFormat('MMM dd, yyyy');
    return 'Valid till ${formatter.format(validUntil!)}';
  }
  
  bool get isExpired {
    if (validUntil == null) return false;
    return DateTime.now().isAfter(validUntil!);
  }
  
  bool get isNotYetValid {
    return DateTime.now().isBefore(validFrom);
  }
}

class CouponValidation {
  final bool valid;
  final Coupon coupon;
  final double discountAmount;
  final double originalTotal;
  final double finalTotal;
  final double savings;
  final String message;
  
  CouponValidation({
    required this.valid,
    required this.coupon,
    required this.discountAmount,
    required this.originalTotal,
    required this.finalTotal,
    required this.savings,
    required this.message,
  });
  
  factory CouponValidation.fromJson(Map<String, dynamic> json) {
    return CouponValidation(
      valid: json['valid'],
      coupon: Coupon.fromJson(json['coupon']),
      discountAmount: json['discount']['amount'].toDouble(),
      originalTotal: json['discount']['original_total'].toDouble(),
      finalTotal: json['discount']['final_total'].toDouble(),
      savings: json['discount']['savings'].toDouble(),
      message: json['message'],
    );
  }
}

class CouponException implements Exception {
  final String message;
  CouponException(this.message);
  
  @override
  String toString() => message;
}
```

**Coupons Screen Widget:**
```dart
class CouponsScreen extends StatefulWidget {
  @override
  _CouponsScreenState createState() => _CouponsScreenState();
}

class _CouponsScreenState extends State<CouponsScreen> {
  final CouponService _couponService = CouponService();
  List<Coupon> _coupons = [];
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadCoupons();
  }
  
  Future<void> _loadCoupons() async {
    setState(() => _isLoading = true);
    
    try {
      final coupons = await _couponService.getAvailableCoupons();
      setState(() {
        _coupons = coupons;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load coupons'))
      );
    }
  }
  
  void _applyCoupon(Coupon coupon) {
    // Return coupon to previous screen (cart/checkout)
    Navigator.pop(context, coupon);
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Available Coupons'),
      ),
      body: _isLoading
        ? Center(child: CircularProgressIndicator())
        : _coupons.isEmpty
          ? Center(child: Text('No coupons available'))
          : RefreshIndicator(
              onRefresh: _loadCoupons,
              child: ListView.builder(
                padding: EdgeInsets.all(16),
                itemCount: _coupons.length,
                itemBuilder: (context, index) {
                  return _buildCouponCard(_coupons[index]);
                },
              ),
            ),
    );
  }
  
  Widget _buildCouponCard(Coupon coupon) {
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.green,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    coupon.code,
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                Text(
                  coupon.discountText,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Text(
              coupon.description,
              style: TextStyle(fontSize: 14),
            ),
            SizedBox(height: 12),
            Row(
              children: [
                if (coupon.minOrderValue > 0) ...[
                  Icon(Icons.shopping_cart, size: 16, color: Colors.grey),
                  SizedBox(width: 4),
                  Text(
                    'Min: ₹${coupon.minOrderValue.toInt()}',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  SizedBox(width: 16),
                ],
                if (coupon.maxDiscount != null) ...[
                  Icon(Icons.discount, size: 16, color: Colors.grey),
                  SizedBox(width: 4),
                  Text(
                    'Max: ₹${coupon.maxDiscount!.toInt()}',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ],
            ),
            SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  coupon.validityText,
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                ElevatedButton(
                  onPressed: coupon.isExpired || coupon.isNotYetValid
                    ? null
                    : () => _applyCoupon(coupon),
                  child: Text('APPLY'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                  ),
                ),
              ],
            ),
            if (coupon.firstOrderOnly)
              Padding(
                padding: EdgeInsets.only(top: 8),
                child: Text(
                  '🎉 First order only',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.orange,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
```

**Apply Coupon in Cart:**
```dart
class CartScreen extends StatefulWidget {
  @override
  _CartScreenState createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  Coupon? _appliedCoupon;
  CouponValidation? _couponValidation;
  bool _validatingCoupon = false;
  
  Future<void> _selectCoupon() async {
    final coupon = await Navigator.push<Coupon>(
      context,
      MaterialPageRoute(builder: (context) => CouponsScreen()),
    );
    
    if (coupon != null) {
      await _validateAndApplyCoupon(coupon.code);
    }
  }
  
  Future<void> _validateAndApplyCoupon(String code) async {
    setState(() => _validatingCoupon = true);
    
    try {
      final validation = await _couponService.validateCoupon(
        code: code,
        outletId: selectedOutlet.id,
        orderTotal: cartTotal,
        items: cartItems,
      );
      
      setState(() {
        _appliedCoupon = validation.coupon;
        _couponValidation = validation;
        _validatingCoupon = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Coupon applied! You saved ₹${validation.savings}'),
          backgroundColor: Colors.green,
        )
      );
    } on CouponException catch (e) {
      setState(() {
        _appliedCoupon = null;
        _couponValidation = null;
        _validatingCoupon = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message),
          backgroundColor: Colors.red,
        )
      );
    }
  }
  
  void _removeCoupon() {
    setState(() {
      _appliedCoupon = null;
      _couponValidation = null;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Cart')),
      body: Column(
        children: [
          // Cart items...
          
          // Coupon section
          _buildCouponSection(),
          
          // Price breakdown
          _buildPriceBreakdown(),
          
          // Checkout button
          _buildCheckoutButton(),
        ],
      ),
    );
  }
  
  Widget _buildCouponSection() {
    return Container(
      padding: EdgeInsets.all(16),
      child: _appliedCoupon == null
        ? OutlinedButton.icon(
            onPressed: _selectCoupon,
            icon: Icon(Icons.local_offer),
            label: Text('Apply Coupon'),
          )
        : Card(
            color: Colors.green.shade50,
            child: Padding(
              padding: EdgeInsets.all(12),
              child: Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.green),
                  SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _appliedCoupon!.code,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                        Text(
                          'You saved ₹${_couponValidation!.savings}',
                          style: TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.close),
                    onPressed: _removeCoupon,
                  ),
                ],
              ),
            ),
          ),
    );
  }
  
  Widget _buildPriceBreakdown() {
    return Container(
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          _buildPriceRow('Subtotal', cartTotal),
          if (_couponValidation != null) ...[
            _buildPriceRow(
              'Discount (${_appliedCoupon!.code})',
              -_couponValidation!.discountAmount,
              color: Colors.green,
            ),
          ],
          _buildPriceRow('Delivery Fee', deliveryFee),
          Divider(),
          _buildPriceRow(
            'Total',
            _couponValidation?.finalTotal ?? cartTotal + deliveryFee,
            isBold: true,
          ),
        ],
      ),
    );
  }
  
  Widget _buildPriceRow(String label, double amount, {
    bool isBold = false,
    Color? color,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: color,
            ),
          ),
          Text(
            '₹${amount.abs().toStringAsFixed(2)}',
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## Best Practices

### 1. Error Handling

```dart
try {
  final validation = await couponService.validateCoupon(...);
  // Apply coupon
} on CouponException catch (e) {
  // Show user-friendly error message
  showSnackbar(e.message);
} catch (e) {
  // Generic error
  showSnackbar('Failed to apply coupon. Please try again.');
}
```

### 2. Caching

```dart
// Cache available coupons for 5 minutes
final cachedCoupons = await SharedPreferences.getInstance();
final cacheKey = 'available_coupons';
final cacheTimeKey = 'coupons_cache_time';

// Check cache first
final cacheTime = cachedCoupons.getInt(cacheTimeKey) ?? 0;
final now = DateTime.now().millisecondsSinceEpoch;

if (now - cacheTime < 5 * 60 * 1000) {
  // Use cached data
  final cached = cachedCoupons.getString(cacheKey);
  if (cached != null) {
    return json.decode(cached);
  }
}

// Fetch fresh data and cache it
final coupons = await fetchCoupons();
await cachedCoupons.setString(cacheKey, json.encode(coupons));
await cachedCoupons.setInt(cacheTimeKey, now);
```

### 3. Validation Before Checkout

Always validate coupon again before placing order:

```dart
// User applies coupon in cart
await validateCoupon(code);

// User proceeds to checkout
// Validate again before placing order
try {
  await validateCoupon(code);
  await placeOrder();
} catch (e) {
  // Coupon may have expired or reached limit
  showError('Coupon is no longer valid');
  removeCoupon();
}
```

### 4. Display Savings

Show users how much they're saving:

```dart
Text('You saved ₹${validation.savings}!')
```

---

## Testing with cURL

**Get Available Coupons:**
```bash
curl -X GET http://localhost:3000/api/v1/coupons/available \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Validate Coupon:**
```bash
curl -X POST http://localhost:3000/api/v1/coupons/validate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME20",
    "outlet_id": "outlet_123",
    "order_total": 500,
    "items": [
      {"menu_item_id": "item_123", "quantity": 2}
    ]
  }'
```

---

## Support

For issues or questions about the coupon system, contact the backend team or refer to the admin coupon documentation.
