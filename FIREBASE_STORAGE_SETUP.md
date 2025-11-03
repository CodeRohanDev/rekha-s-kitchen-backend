# 🔥 Firebase Storage Setup Guide

## Overview
This guide explains how to set up Firebase Storage for banner image uploads in Rekha's Kitchen API.

---

## ✅ What's Already Done

### 1. Code Implementation
- ✅ Storage utility (`src/utils/storage.js`)
- ✅ Upload middleware (`src/middleware/upload.js`)
- ✅ Upload endpoints in banner controller
- ✅ Firebase Admin SDK configured with Storage
- ✅ Multer installed for file handling

### 2. Environment Configuration
- ✅ `FIREBASE_STORAGE_BUCKET` already set in `.env`
- ✅ Value: `rekhas-kitchen.appspot.com`

---

## 🔧 Firebase Console Setup

### Step 1: Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **rekhas-kitchen**
3. Click on **Storage** in the left sidebar
4. Click **Get Started**
5. Choose **Start in production mode** (we'll set rules next)
6. Select your preferred location (e.g., `us-central1`)
7. Click **Done**

### Step 2: Configure Storage Rules

1. In Firebase Console → Storage → Rules tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read access for all files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Authenticated write access for banners folder
    match /banners/{fileName} {
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024  // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Authenticated write access for menu-items folder (future use)
    match /menu-items/{fileName} {
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Authenticated write access for other uploads
    match /uploads/{fileName} {
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

3. Click **Publish**

### Step 3: Verify Bucket Name

1. In Storage tab, check the bucket name at the top
2. It should be: `rekhas-kitchen.appspot.com`
3. If different, update `.env` file:
   ```
   FIREBASE_STORAGE_BUCKET=your-actual-bucket-name.appspot.com
   ```

---

## 🧪 Testing the Setup

### Method 1: Using Test Script

```bash
# 1. Get admin token
# Login via API and copy the token

# 2. Update token in test file
# Edit test-banner-upload.js and set ADMIN_TOKEN

# 3. Run test
node test-banner-upload.js
```

### Method 2: Using cURL

```bash
# Upload an image
curl -X POST http://localhost:3000/api/v1/banners/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

### Method 3: Using Postman

1. Create new POST request to: `http://localhost:3000/api/v1/banners/upload-image`
2. Add Header: `Authorization: Bearer YOUR_TOKEN`
3. Go to Body tab → select `form-data`
4. Add key: `image` (change type to File)
5. Select an image file
6. Send request

---

## 📁 Storage Structure

Files will be organized in Firebase Storage as:

```
rekhas-kitchen.appspot.com/
├── banners/
│   ├── 1698345678-banner.jpg
│   ├── 1698345890-banner.png
│   └── ...
├── menu-items/          (future use)
│   └── ...
└── uploads/             (other files)
    └── ...
```

---

## 🔐 Security Features

### File Validation
- ✅ File type: Only JPEG, PNG, WebP allowed
- ✅ File size: Maximum 5MB
- ✅ Authentication: Only authenticated admins can upload
- ✅ Authorization: Super Admin & Outlet Admin only

### Storage Rules
- ✅ Public read access (for customer app)
- ✅ Authenticated write access
- ✅ Size limits enforced
- ✅ Content type validation

---

## 📊 API Endpoints

### Upload Image
```
POST /api/v1/banners/upload-image
Authorization: Bearer TOKEN
Content-Type: multipart/form-data

Field: image (file)
```

### Delete Image
```
DELETE /api/v1/banners/delete-image
Authorization: Bearer TOKEN
Content-Type: application/json

Body: { "image_url": "https://..." }
```

---

## 🎯 Usage Workflow

### For Admin Dashboard

```javascript
// 1. User selects image file
const fileInput = document.getElementById('bannerImage');
const file = fileInput.files[0];

// 2. Upload to Firebase Storage
const formData = new FormData();
formData.append('image', file);

const uploadResponse = await fetch('/api/v1/banners/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});

const { data } = await uploadResponse.json();
const imageUrl = data.image_url;

// 3. Create banner with uploaded image URL
const bannerResponse = await fetch('/api/v1/banners', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "50% Off First Order",
    image_url: imageUrl,  // Use uploaded URL
    banner_type: "promotional",
    action_type: "coupon",
    action_data: { coupon_code: "FIRST50" }
  })
});
```

---

## 🐛 Troubleshooting

### Error: "Failed to upload file"

**Possible causes:**
1. Firebase Storage not enabled
2. Wrong bucket name in `.env`
3. Service account lacks Storage permissions
4. Storage rules too restrictive

**Solutions:**
1. Enable Storage in Firebase Console
2. Verify `FIREBASE_STORAGE_BUCKET` in `.env`
3. Check service account has "Storage Admin" role
4. Review and update Storage rules

### Error: "File too large"

**Solution:**
- Compress image before upload
- Maximum size is 5MB
- Use tools like TinyPNG or ImageOptim

### Error: "Invalid file type"

**Solution:**
- Only JPEG, PNG, and WebP are allowed
- Convert other formats before upload

### Error: "Permission denied"

**Solution:**
- Ensure you're logged in as Super Admin or Outlet Admin
- Check token is valid and not expired
- Verify Authorization header is set

---

## 💡 Best Practices

### Image Optimization
1. **Compress images** before upload (use TinyPNG, ImageOptim)
2. **Recommended size:** 1920x1080px or 1600x900px
3. **Format:** WebP for best compression, JPEG for compatibility
4. **Target file size:** < 500KB for fast loading

### Storage Management
1. **Delete old images** when updating banners
2. **Use descriptive filenames** (auto-generated with timestamp)
3. **Monitor storage usage** in Firebase Console
4. **Set up billing alerts** if needed

### Security
1. **Never expose** service account credentials
2. **Use environment variables** for configuration
3. **Validate files** on both client and server
4. **Implement rate limiting** for uploads (already done)

---

## 📈 Monitoring

### Firebase Console
- View uploaded files: Storage → Files
- Check usage: Storage → Usage
- Monitor costs: Storage → Usage → View in Billing

### Application Logs
- Upload success/failure logged
- File details tracked
- User actions recorded

---

## 🚀 Next Steps

### For Development
- ✅ Test upload functionality
- ✅ Verify images are accessible
- ✅ Test banner creation with uploaded images
- ✅ Test image deletion

### For Production
- [ ] Set up CDN (optional, Firebase Storage has global CDN)
- [ ] Configure CORS if needed
- [ ] Set up monitoring and alerts
- [ ] Plan storage cleanup strategy
- [ ] Consider image optimization service

---

## 📞 Support

### Common Issues
- Check Firebase Console for errors
- Review application logs
- Verify environment variables
- Test with small image first

### Resources
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Multer Documentation](https://github.com/expressjs/multer)

---

## ✨ Summary

Firebase Storage is now integrated for banner uploads with:
- ✅ Secure file upload endpoint
- ✅ File validation (type, size)
- ✅ Automatic storage management
- ✅ Public URL generation
- ✅ Image deletion support
- ✅ Permission-based access control

Ready to upload banner images! 🎨
