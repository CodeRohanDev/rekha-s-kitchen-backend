# 🎨 Banner API - Quick Reference

## 🚀 Quick Start

### 1. Upload Image
```bash
curl -X POST http://localhost:3000/api/v1/banners/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@banner.jpg"
```

### 2. Create Banner
```bash
curl -X POST http://localhost:3000/api/v1/banners \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "50% Off First Order",
    "image_url": "https://storage.googleapis.com/.../banner.jpg",
    "banner_type": "promotional",
    "action_type": "coupon",
    "action_data": {"coupon_code": "FIRST50"}
  }'
```

### 3. Get Banners (Public)
```bash
curl http://localhost:3000/api/v1/banners?outlet_id=outlet123
```

---

## 📋 Endpoints Cheat Sheet

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/banners/upload-image` | ✅ | Upload image to Firebase Storage |
| DELETE | `/banners/delete-image` | ✅ | Delete image from storage |
| POST | `/banners` | ✅ | Create banner |
| GET | `/banners` | ❌ | Get all banners |
| GET | `/banners/:id` | ❌ | Get banner by ID |
| PUT | `/banners/:id` | ✅ | Update banner |
| DELETE | `/banners/:id` | ✅ | Delete banner |
| PATCH | `/banners/:id/toggle` | ✅ | Toggle active status |
| POST | `/banners/:id/view` | ❌ | Track view |
| POST | `/banners/:id/click` | ❌ | Track click |
| GET | `/banners/:id/analytics` | ✅ | Get analytics |

---

## 🎯 Banner Types

- `promotional` - General promotions
- `offer` - Discount deals
- `announcement` - Important updates
- `seasonal` - Holiday specials

---

## 🔗 Action Types

| Type | Description | Action Data Example |
|------|-------------|---------------------|
| `none` | No action | `null` |
| `coupon` | Apply coupon | `{"coupon_code": "SAVE20"}` |
| `menu_item` | Show item | `{"item_id": "item123"}` |
| `category` | Show category | `{"category_id": "cat456"}` |
| `outlet` | Show outlet | `{"outlet_id": "outlet789"}` |
| `deep_link` | Navigate | `{"screen": "menu"}` |
| `external_url` | Open link | `{"url": "https://..."}` |

---

## 📸 Image Requirements

- **Formats:** JPEG, PNG, WebP
- **Max Size:** 5MB
- **Recommended:** 1920x1080px, < 500KB
- **Aspect Ratio:** 16:9 or 2:1

---

## 🔐 Permissions

| Role | Upload | Create | Update | Delete | Analytics |
|------|--------|--------|--------|--------|-----------|
| Super Admin | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| Outlet Admin | ✅ Own | ✅ Own outlets | ✅ Own | ✅ Own | ✅ Own |
| Customer | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 💻 JavaScript Examples

### Upload & Create
```javascript
// 1. Upload
const formData = new FormData();
formData.append('image', file);
const upload = await fetch('/api/v1/banners/upload-image', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
const { data } = await upload.json();

// 2. Create
await fetch('/api/v1/banners', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Weekend Special",
    image_url: data.image_url,
    banner_type: "promotional",
    action_type: "none"
  })
});
```

### Fetch & Display
```javascript
const response = await fetch('/api/v1/banners?outlet_id=outlet123');
const { data } = await response.json();

data.banners.forEach(banner => {
  console.log(banner.title, banner.image_url);
});
```

### Track Interaction
```javascript
// Track view
await fetch(`/api/v1/banners/${bannerId}/view`, { method: 'POST' });

// Track click
const click = await fetch(`/api/v1/banners/${bannerId}/click`, { 
  method: 'POST' 
});
const { data } = await click.json();

// Handle action
if (data.action_type === 'coupon') {
  applyCoupon(data.action_data.coupon_code);
}
```

---

## 🐛 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `NO_FILE` | No image uploaded | Include file in form-data |
| `FILE_TOO_LARGE` | File > 5MB | Compress image |
| `INVALID_FILE` | Wrong format | Use JPEG/PNG/WebP |
| `FORBIDDEN` | No permission | Check user role |
| `NOT_FOUND` | Invalid ID | Verify banner exists |

---

## 📦 Required Packages

```json
{
  "multer": "^1.4.5-lts.1",
  "firebase-admin": "^11.11.1",
  "form-data": "^4.0.0"
}
```

---

## 🔧 Environment Variables

```env
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

---

## 📚 Documentation Files

- `BANNER_API_DOCUMENTATION.md` - Complete API docs
- `FIREBASE_STORAGE_SETUP.md` - Storage setup guide
- `BANNER_FEATURE_SUMMARY.md` - Feature overview
- `test-banner-endpoints.js` - API test script
- `test-banner-upload.js` - Upload test script

---

## ✅ Testing Checklist

- [ ] Firebase Storage enabled
- [ ] Storage rules configured
- [ ] Environment variables set
- [ ] Server running
- [ ] Admin token obtained
- [ ] Image uploaded successfully
- [ ] Banner created with image
- [ ] Banner visible in GET request
- [ ] View/click tracking works
- [ ] Analytics showing data

---

## 🎨 UI Implementation Tips

### Carousel Component
```javascript
const BannerCarousel = ({ banners }) => {
  const [current, setCurrent] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
      trackView(banners[current].id);
    }, 3500);
    
    return () => clearInterval(timer);
  }, [banners, current]);
  
  return (
    <div className="carousel">
      <img src={banners[current].image_url} />
      <div className="overlay">
        <h2>{banners[current].title}</h2>
        <p>{banners[current].subtitle}</p>
      </div>
      <div className="dots">
        {banners.map((_, i) => (
          <span className={i === current ? 'active' : ''} />
        ))}
      </div>
    </div>
  );
};
```

---

## 🚀 Production Checklist

- [ ] Optimize images before upload
- [ ] Set up CDN (Firebase has built-in)
- [ ] Configure CORS if needed
- [ ] Monitor storage usage
- [ ] Set up billing alerts
- [ ] Implement image cleanup
- [ ] Add error tracking
- [ ] Test on mobile devices
- [ ] Verify loading performance
- [ ] Review security rules

---

## 📞 Quick Help

**Can't upload?**
- Check Firebase Storage is enabled
- Verify token is valid
- Ensure file is < 5MB
- Check file format (JPEG/PNG/WebP)

**Banner not showing?**
- Check `is_active` is true
- Verify date range
- Confirm outlet_id matches
- Check applicable_outlets

**Permission denied?**
- Verify user role (Super Admin or Outlet Admin)
- Check token expiration
- Confirm outlet assignment

---

Made with ❤️ for Rekha's Kitchen
