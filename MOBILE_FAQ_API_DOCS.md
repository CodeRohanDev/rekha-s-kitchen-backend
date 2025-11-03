# Mobile FAQ API Documentation

## Base URL
```
http://your-api-domain.com/api/v1/faqs
```

## Authentication
FAQ endpoints are **public** and do not require authentication.

---

## Overview

The FAQ system provides answers to frequently asked questions organized by categories. All endpoints return only active FAQs that have been published by administrators.

---

## FAQ Categories

FAQs are organized into the following categories:
- `general` - General questions about the service
- `orders` - Order-related questions
- `payments` - Payment and billing questions
- `delivery` - Delivery and shipping questions
- `account` - Account management questions
- `menu` - Menu and food-related questions
- `loyalty` - Loyalty program questions
- `technical` - Technical support questions

---

## Endpoints

### 1. Get All FAQs

Get all active FAQs grouped by category.

**Endpoint:** `GET /`

**Query Parameters:**
- `category` (optional): Filter by specific category
- `search` (optional): Search in questions and answers

**Example Requests:**
```
GET /                           # Get all FAQs
GET /?category=orders           # Get only order-related FAQs
GET /?search=delivery           # Search for "delivery"
GET /?category=payments&search=card  # Filter and search
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "faqs": {
      "orders": [
        {
          "id": "faq_abc123",
          "question": "How do I track my order?",
          "answer": "You can track your order in real-time from the Orders section of the app. You'll receive notifications at each stage of your order preparation and delivery.",
          "display_order": 0
        },
        {
          "id": "faq_def456",
          "question": "Can I cancel my order?",
          "answer": "Yes, you can cancel your order within 5 minutes of placing it from the Orders section. After that, please contact customer support.",
          "display_order": 1
        }
      ],
      "payments": [
        {
          "id": "faq_ghi789",
          "question": "What payment methods do you accept?",
          "answer": "We accept credit/debit cards, UPI, digital wallets, and cash on delivery.",
          "display_order": 0
        }
      ],
      "delivery": [
        {
          "id": "faq_jkl012",
          "question": "What are your delivery hours?",
          "answer": "We deliver from 10 AM to 10 PM daily. Orders placed outside these hours will be delivered the next day.",
          "display_order": 0
        }
      ]
    },
    "total": 4
  }
}
```

**Response Structure:**
- FAQs are grouped by category
- Each category contains an array of FAQ objects
- FAQs are sorted by `display_order` (ascending)
- Only active FAQs are returned

---

### 2. Search FAQs

Search for FAQs by keyword in questions and answers.

**Endpoint:** `GET /search`

**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)

**Example Request:**
```
GET /search?q=delivery
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "faq_jkl012",
        "question": "What are your delivery hours?",
        "answer": "We deliver from 10 AM to 10 PM daily...",
        "category": "delivery"
      },
      {
        "id": "faq_mno345",
        "question": "How much is the delivery fee?",
        "answer": "Delivery fees vary based on distance from the outlet...",
        "category": "delivery"
      },
      {
        "id": "faq_pqr678",
        "question": "Can I schedule a delivery for later?",
        "answer": "Yes, you can schedule delivery up to 7 days in advance...",
        "category": "orders"
      }
    ],
    "total": 3,
    "query": "delivery"
  }
}
```

**Search Behavior:**
- Searches in both question and answer text
- Case-insensitive search
- Returns FAQs from all categories that match
- Results are not grouped by category

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Search query must be at least 2 characters"
  }
}
```

---

### 3. Get FAQ Categories

Get a list of all available categories with FAQ counts.

**Endpoint:** `GET /categories`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "name": "orders",
        "count": 8
      },
      {
        "name": "payments",
        "count": 5
      },
      {
        "name": "delivery",
        "count": 6
      },
      {
        "name": "account",
        "count": 4
      },
      {
        "name": "menu",
        "count": 3
      },
      {
        "name": "loyalty",
        "count": 5
      },
      {
        "name": "general",
        "count": 7
      }
    ]
  }
}
```

**Use Case:**
Use this endpoint to:
- Display category tabs in your FAQ screen
- Show FAQ counts per category
- Build category filters

---

## Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters"
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
    "message": "Failed to get FAQs"
  }
}
```

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- Applies to all FAQ endpoints
- No authentication required

---

## UI Implementation Guide

### 1. FAQ Screen Layout

**Recommended Structure:**
```
┌─────────────────────────────┐
│  FAQ                    🔍  │
├─────────────────────────────┤
│  [All] [Orders] [Payments]  │  ← Category tabs
│  [Delivery] [Account] ...   │
├─────────────────────────────┤
│  📦 Orders                   │  ← Category section
│  ▼ How do I track my order? │  ← Expandable FAQ
│  ▼ Can I cancel my order?   │
│                              │
│  💳 Payments                 │
│  ▼ What payment methods...  │
│  ▼ Is my payment secure?    │
└─────────────────────────────┘
```

### 2. Implementation Example (Flutter/Dart)

**Fetch FAQs:**
```dart
class FAQService {
  final String baseUrl = 'http://your-api.com/api/v1/faqs';
  
  Future<Map<String, List<FAQ>>> getAllFAQs({String? category}) async {
    final url = category != null 
      ? '$baseUrl?category=$category'
      : baseUrl;
    
    final response = await http.get(Uri.parse(url));
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return parseFAQs(data['data']['faqs']);
    } else {
      throw Exception('Failed to load FAQs');
    }
  }
  
  Future<List<FAQ>> searchFAQs(String query) async {
    final response = await http.get(
      Uri.parse('$baseUrl/search?q=${Uri.encodeComponent(query)}')
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data']['results'] as List)
        .map((faq) => FAQ.fromJson(faq))
        .toList();
    } else {
      throw Exception('Failed to search FAQs');
    }
  }
  
  Future<List<Category>> getCategories() async {
    final response = await http.get(Uri.parse('$baseUrl/categories'));
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data']['categories'] as List)
        .map((cat) => Category.fromJson(cat))
        .toList();
    } else {
      throw Exception('Failed to load categories');
    }
  }
}
```

**FAQ Model:**
```dart
class FAQ {
  final String id;
  final String question;
  final String answer;
  final String? category;
  final int displayOrder;
  
  FAQ({
    required this.id,
    required this.question,
    required this.answer,
    this.category,
    required this.displayOrder,
  });
  
  factory FAQ.fromJson(Map<String, dynamic> json) {
    return FAQ(
      id: json['id'],
      question: json['question'],
      answer: json['answer'],
      category: json['category'],
      displayOrder: json['display_order'] ?? 0,
    );
  }
}

class Category {
  final String name;
  final int count;
  
  Category({required this.name, required this.count});
  
  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      name: json['name'],
      count: json['count'],
    );
  }
  
  String get displayName {
    // Capitalize first letter
    return name[0].toUpperCase() + name.substring(1);
  }
}
```

**FAQ Screen Widget:**
```dart
class FAQScreen extends StatefulWidget {
  @override
  _FAQScreenState createState() => _FAQScreenState();
}

class _FAQScreenState extends State<FAQScreen> {
  final FAQService _faqService = FAQService();
  Map<String, List<FAQ>> _faqs = {};
  List<Category> _categories = [];
  String? _selectedCategory;
  bool _isLoading = true;
  String _searchQuery = '';
  
  @override
  void initState() {
    super.initState();
    _loadData();
  }
  
  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    try {
      final categories = await _faqService.getCategories();
      final faqs = await _faqService.getAllFAQs(
        category: _selectedCategory
      );
      
      setState(() {
        _categories = categories;
        _faqs = faqs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      // Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load FAQs'))
      );
    }
  }
  
  Future<void> _search(String query) async {
    if (query.length < 2) {
      _loadData();
      return;
    }
    
    setState(() => _isLoading = true);
    
    try {
      final results = await _faqService.searchFAQs(query);
      
      // Group results by category for display
      final grouped = <String, List<FAQ>>{};
      for (var faq in results) {
        grouped.putIfAbsent(faq.category ?? 'general', () => []).add(faq);
      }
      
      setState(() {
        _faqs = grouped;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('FAQ'),
        actions: [
          IconButton(
            icon: Icon(Icons.search),
            onPressed: () {
              showSearch(
                context: context,
                delegate: FAQSearchDelegate(_faqService),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Category tabs
          _buildCategoryTabs(),
          
          // FAQ list
          Expanded(
            child: _isLoading
              ? Center(child: CircularProgressIndicator())
              : _buildFAQList(),
          ),
        ],
      ),
    );
  }
  
  Widget _buildCategoryTabs() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: EdgeInsets.all(8),
      child: Row(
        children: [
          _buildCategoryChip('All', null),
          ..._categories.map((cat) => 
            _buildCategoryChip(cat.displayName, cat.name)
          ),
        ],
      ),
    );
  }
  
  Widget _buildCategoryChip(String label, String? category) {
    final isSelected = _selectedCategory == category;
    
    return Padding(
      padding: EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _selectedCategory = selected ? category : null;
          });
          _loadData();
        },
      ),
    );
  }
  
  Widget _buildFAQList() {
    if (_faqs.isEmpty) {
      return Center(
        child: Text('No FAQs found'),
      );
    }
    
    return ListView(
      children: _faqs.entries.map((entry) {
        return _buildCategorySection(entry.key, entry.value);
      }).toList(),
    );
  }
  
  Widget _buildCategorySection(String category, List<FAQ> faqs) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            _getCategoryIcon(category) + ' ' + 
            category[0].toUpperCase() + category.substring(1),
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        ...faqs.map((faq) => _buildFAQItem(faq)),
        SizedBox(height: 16),
      ],
    );
  }
  
  Widget _buildFAQItem(FAQ faq) {
    return ExpansionTile(
      title: Text(faq.question),
      children: [
        Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            faq.answer,
            style: TextStyle(color: Colors.grey[700]),
          ),
        ),
      ],
    );
  }
  
  String _getCategoryIcon(String category) {
    switch (category) {
      case 'orders': return '📦';
      case 'payments': return '💳';
      case 'delivery': return '🚚';
      case 'account': return '👤';
      case 'menu': return '🍽️';
      case 'loyalty': return '⭐';
      case 'technical': return '🔧';
      default: return '❓';
    }
  }
}
```

### 3. Search Implementation

**Search Delegate:**
```dart
class FAQSearchDelegate extends SearchDelegate<FAQ?> {
  final FAQService faqService;
  
  FAQSearchDelegate(this.faqService);
  
  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      IconButton(
        icon: Icon(Icons.clear),
        onPressed: () => query = '',
      ),
    ];
  }
  
  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: Icon(Icons.arrow_back),
      onPressed: () => close(context, null),
    );
  }
  
  @override
  Widget buildResults(BuildContext context) {
    return _buildSearchResults();
  }
  
  @override
  Widget buildSuggestions(BuildContext context) {
    if (query.length < 2) {
      return Center(
        child: Text('Enter at least 2 characters to search'),
      );
    }
    return _buildSearchResults();
  }
  
  Widget _buildSearchResults() {
    return FutureBuilder<List<FAQ>>(
      future: faqService.searchFAQs(query),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        }
        
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }
        
        final results = snapshot.data ?? [];
        
        if (results.isEmpty) {
          return Center(child: Text('No results found'));
        }
        
        return ListView.builder(
          itemCount: results.length,
          itemBuilder: (context, index) {
            final faq = results[index];
            return ExpansionTile(
              title: Text(faq.question),
              subtitle: Text(
                faq.category ?? 'General',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              children: [
                Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(faq.answer),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
```

---

## Best Practices

### 1. Caching

**Cache FAQs locally:**
```dart
// Cache FAQs for 24 hours
final cachedFAQs = await SharedPreferences.getInstance();
final cacheKey = 'faqs_cache';
final cacheTimeKey = 'faqs_cache_time';

// Check cache first
final cacheTime = cachedFAQs.getInt(cacheTimeKey) ?? 0;
final now = DateTime.now().millisecondsSinceEpoch;

if (now - cacheTime < 24 * 60 * 60 * 1000) {
  // Use cached data
  final cached = cachedFAQs.getString(cacheKey);
  if (cached != null) {
    return json.decode(cached);
  }
}

// Fetch fresh data and cache it
final faqs = await fetchFAQs();
await cachedFAQs.setString(cacheKey, json.encode(faqs));
await cachedFAQs.setInt(cacheTimeKey, now);
```

### 2. Error Handling

```dart
try {
  final faqs = await faqService.getAllFAQs();
  // Update UI
} on SocketException {
  // No internet connection
  showError('No internet connection');
} on TimeoutException {
  // Request timeout
  showError('Request timeout. Please try again.');
} catch (e) {
  // Other errors
  showError('Failed to load FAQs');
}
```

### 3. Performance

- Load FAQs on app startup and cache them
- Use pagination if FAQ list is very long
- Implement pull-to-refresh
- Show loading indicators

### 4. User Experience

- Make questions expandable/collapsible
- Highlight search terms in results
- Show category icons for visual appeal
- Add "Was this helpful?" feedback buttons
- Provide "Contact Support" option if FAQ doesn't help

---

## Testing with cURL

**Get All FAQs:**
```bash
curl -X GET http://localhost:3000/api/v1/faqs
```

**Get FAQs by Category:**
```bash
curl -X GET "http://localhost:3000/api/v1/faqs?category=orders"
```

**Search FAQs:**
```bash
curl -X GET "http://localhost:3000/api/v1/faqs/search?q=delivery"
```

**Get Categories:**
```bash
curl -X GET http://localhost:3000/api/v1/faqs/categories
```

---

## Support

If you can't find an answer in the FAQs, users should be able to:
1. Contact customer support via the app
2. Submit an issue/ticket
3. Call support hotline
4. Email support

Make sure to provide these options prominently in your FAQ screen.
