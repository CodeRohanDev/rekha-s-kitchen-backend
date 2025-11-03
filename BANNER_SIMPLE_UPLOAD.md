# 🚀 Simple Banner Upload - One Step!

## ✨ New Simplified Endpoint

Upload image AND create banner in **ONE REQUEST**!

---

## 📤 Single Endpoint

### Upload & Create Banner
`POST /api/v1/banners/upload-and-create`

**Authorization:** Super Admin, Outlet Admin  
**Content-Type:** `multipart/form-data`

---

## 📋 Form Fields

### Required:
- `image` (file) - The banner image
- `title` (text) - Banner title (min 3 chars)

### Optional:
- `subtitle` (text) - Banner subtitle
- `description` (text) - Banner description
- `banner_type` (text) - 'promotional', 'offer', 'announcement', 'seasonal' (default: 'promotional')
- `action_type` (text) - 'none', 'coupon', 'menu_item', etc. (default: 'none')
- `action_data` (JSON string) - Action data like `{"coupon_code": "SAVE20"}`
- `target_audience` (text) - 'all', 'new_users', 'loyal_customers' (default: 'all')
- `applicable_outlets` (JSON array string) - `["outlet1", "outlet2"]` (super admin only)
- `display_order` (number) - Display order (default: 0)
- `start_date` (ISO date) - Start date (default: now)
- `end_date` (ISO date) - End date (optional)
- `is_active` (boolean) - Active status (default: true)

---

## 💻 Frontend Example

### Using JavaScript Fetch

```javascript
const createBanner = async (imageFile, bannerData) => {
  const formData = new FormData();
  
  // Add image file
  formData.append('image', imageFile);
  
  // Add banner data
  formData.append('title', bannerData.title);
  formData.append('subtitle', bannerData.subtitle || '');
  formData.append('description', bannerData.description || '');
  formData.append('banner_type', bannerData.banner_type || 'promotional');
  formData.append('action_type', bannerData.action_type || 'none');
  formData.append('target_audience', bannerData.target_audience || 'all');
  formData.append('display_order', bannerData.display_order || 0);
  formData.append('is_active', bannerData.is_active !== false);
  
  // Optional: action data
  if (bannerData.action_data) {
    formData.append('action_data', JSON.stringify(bannerData.action_data));
  }
  
  // Optional: applicable outlets (super admin only)
  if (bannerData.applicable_outlets) {
    formData.append('applicable_outlets', JSON.stringify(bannerData.applicable_outlets));
  }
  
  // Optional: dates
  if (bannerData.start_date) {
    formData.append('start_date', bannerData.start_date);
  }
  if (bannerData.end_date) {
    formData.append('end_date', bannerData.end_date);
  }
  
  const response = await fetch('/api/v1/banners/upload-and-create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
};

// Usage
const fileInput = document.getElementById('bannerImage');
const result = await createBanner(fileInput.files[0], {
  title: "50% Off First Order",
  subtitle: "New customers only",
  banner_type: "promotional",
  action_type: "coupon",
  action_data: { coupon_code: "FIRST50" }
});

console.log('Banner created:', result);
```

### Using React

```jsx
const BannerUploadForm = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('banner_type', 'promotional');
    formData.append('action_type', 'none');

    try {
      const response = await fetch('/api/v1/banners/upload-and-create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Banner created successfully!');
        // Reset form or redirect
      } else {
        alert('Error: ' + result.error.message);
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <input
        type="text"
        placeholder="Banner Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Subtitle (optional)"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Banner'}
      </button>
    </form>
  );
};
```

---

## 📤 cURL Example

```bash
curl -X POST http://localhost:5050/api/v1/banners/upload-and-create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@banner.jpg" \
  -F "title=50% Off First Order" \
  -F "subtitle=New customers only" \
  -F "banner_type=promotional" \
  -F "action_type=coupon" \
  -F 'action_data={"coupon_code":"FIRST50"}' \
  -F "is_active=true"
```

---

## ✅ Response

### Success (201)
```json
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "banner_id": "banner123",
    "banner": {
      "id": "banner123",
      "title": "50% Off First Order",
      "subtitle": "New customers only",
      "image_url": "https://res.cloudinary.com/your-cloud/image/upload/v123/rekhas-kitchen/banners/banner-123.jpg",
      "banner_type": "promotional",
      "action_type": "coupon",
      "action_data": {
        "coupon_code": "FIRST50"
      },
      "is_active": true,
      "created_at": "2025-10-26T12:00:00Z"
    }
  }
}
```

### Error (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must be at least 3 characters"
  }
}
```

---

## 🎯 What Happens Behind the Scenes

1. ✅ Validates image file (type, size)
2. ✅ Uploads image to Cloudinary
3. ✅ Gets secure image URL
4. ✅ Creates banner in Firestore
5. ✅ Returns complete banner data

**All in ONE request!** 🚀

---

## 🆚 Comparison

### Old Way (2 steps)
```javascript
// Step 1: Upload image
const uploadRes = await fetch('/api/v1/banners/upload-image', ...);
const { image_url } = uploadRes.data;

// Step 2: Create banner
const createRes = await fetch('/api/v1/banners', {
  body: JSON.stringify({ title, image_url, ... })
});
```

### New Way (1 step) ⭐
```javascript
// One step: Upload & Create
const result = await fetch('/api/v1/banners/upload-and-create', {
  body: formData // includes image + all banner data
});
```

---

## 💡 Tips

1. **Image file must be first** in FormData
2. **JSON fields** (action_data, applicable_outlets) must be stringified
3. **Booleans** can be sent as 'true'/'false' strings
4. **Dates** should be ISO format: '2025-10-26T00:00:00Z'
5. **Empty strings** are allowed for subtitle/description

---

## 🔄 Still Want Separate Steps?

The old endpoints still work:

1. `POST /api/v1/banners/upload-image` - Upload image only
2. `POST /api/v1/banners` - Create banner with URL

Use these if you need more control or want to preview the image before creating the banner.

---

## ✨ Benefits of New Endpoint

- ✅ **Simpler** - One request instead of two
- ✅ **Faster** - No waiting between steps
- ✅ **Atomic** - Either everything succeeds or nothing
- ✅ **Less code** - Easier frontend implementation
- ✅ **Better UX** - Single loading state

---

Made with ❤️ for Rekha's Kitchen
