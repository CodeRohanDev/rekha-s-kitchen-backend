# ☁️ Cloudinary Setup Guide

## ✅ What's Done

- ✅ Cloudinary package installed
- ✅ Storage utility updated to use Cloudinary
- ✅ Environment variables added to `.env`
- ✅ Upload, delete, and metadata functions implemented

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register_free
2. Sign up for a **FREE account**
3. Verify your email

### Step 2: Get Your Credentials

1. After login, you'll see your **Dashboard**
2. Copy these three values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3: Update .env File

Replace the placeholder values in your `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### Step 4: Restart Server

```bash
npm run dev
```

### Step 5: Test Upload

Try uploading a banner image - it should work immediately!

---

## 📊 Free Tier Limits

Cloudinary's free tier includes:
- ✅ **25 GB** storage
- ✅ **25 GB** bandwidth per month
- ✅ **Unlimited** transformations
- ✅ **Built-in CDN**
- ✅ **Automatic optimization**

This is more than enough for your restaurant app!

---

## 🎯 Features You Get

### 1. Automatic Image Optimization
- Images are automatically compressed
- Converted to best format (WebP when supported)
- Faster loading times

### 2. Built-in CDN
- Images served from nearest location
- Fast delivery worldwide
- No extra configuration needed

### 3. Image Transformations
You can transform images on-the-fly by modifying the URL:

```javascript
// Original
https://res.cloudinary.com/your-cloud/image/upload/v123/banners/image.jpg

// Resize to 800x600
https://res.cloudinary.com/your-cloud/image/upload/w_800,h_600/v123/banners/image.jpg

// Thumbnail 200x200
https://res.cloudinary.com/your-cloud/image/upload/w_200,h_200,c_fill/v123/banners/image.jpg

// Auto quality
https://res.cloudinary.com/your-cloud/image/upload/q_auto/v123/banners/image.jpg
```

### 4. Folder Organization
Images are automatically organized:
```
rekhas-kitchen/
├── banners/
│   ├── 1698345678-banner.jpg
│   └── 1698345890-banner.png
├── menu-items/
│   └── ...
└── uploads/
    └── ...
```

---

## 🔧 How It Works

### Upload Flow

1. **Frontend** sends image file to your API
2. **API** converts image to base64
3. **Cloudinary** receives and processes image
4. **Cloudinary** returns secure HTTPS URL
5. **API** saves URL in database
6. **Frontend** displays image from Cloudinary CDN

### URL Format

```
https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[filename]
```

Example:
```
https://res.cloudinary.com/rekhas-kitchen/image/upload/v1698345678/rekhas-kitchen/banners/1698345678-banner.jpg
```

---

## 📱 API Endpoints (No Changes!)

Your existing API endpoints work exactly the same:

```bash
# Upload image
POST /api/v1/banners/upload-image
Content-Type: multipart/form-data
Body: { image: <file> }

# Delete image
DELETE /api/v1/banners/delete-image
Body: { "image_url": "https://res.cloudinary.com/..." }

# Create banner with uploaded image
POST /api/v1/banners
Body: {
  "title": "50% Off",
  "image_url": "https://res.cloudinary.com/...",
  ...
}
```

---

## 🎨 Advanced Features (Optional)

### 1. Automatic Format Conversion

Add to URL: `f_auto`
```
https://res.cloudinary.com/your-cloud/image/upload/f_auto/v123/banners/image.jpg
```
Serves WebP to Chrome, JPEG to Safari, etc.

### 2. Responsive Images

```javascript
// Mobile
w_400,h_300,c_fill

// Tablet
w_800,h_600,c_fill

// Desktop
w_1200,h_900,c_fill
```

### 3. Lazy Loading Placeholder

```javascript
// Blur placeholder (tiny, loads instantly)
w_50,h_50,e_blur:1000
```

---

## 🐛 Troubleshooting

### Error: "Invalid cloud_name"
- Check your `CLOUDINARY_CLOUD_NAME` in `.env`
- Make sure there are no spaces or quotes
- Restart server after changing `.env`

### Error: "Invalid API credentials"
- Verify `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
- Copy them exactly from Cloudinary dashboard
- Don't share API Secret publicly!

### Upload works but image doesn't display
- Check if URL is correct
- Verify image is in Cloudinary dashboard
- Check browser console for CORS errors

---

## 📊 Monitoring Usage

1. Go to Cloudinary Dashboard
2. Click on **"Reports"** → **"Usage"**
3. See:
   - Storage used
   - Bandwidth used
   - Transformations count
   - Credits remaining

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** to Git
2. **Keep API Secret private**
3. **Use signed uploads** for production (optional)
4. **Set upload presets** to restrict file types
5. **Enable moderation** to prevent inappropriate content

---

## 💡 Why Cloudinary > Firebase Storage

| Feature | Cloudinary | Firebase Storage |
|---------|-----------|------------------|
| Setup | 5 minutes | Complex bucket config |
| Free tier | 25GB | 5GB |
| CDN | Built-in | Need to configure |
| Image optimization | Automatic | Manual |
| Transformations | On-the-fly | Need separate service |
| Reliability | 99.99% | Bucket issues |
| API | Simple | Complex |

---

## 🚀 Next Steps

1. **Sign up** for Cloudinary (free)
2. **Copy credentials** to `.env`
3. **Restart server**
4. **Test upload** - it will work immediately!
5. **Enjoy** hassle-free image management! 🎉

---

## 📞 Support

- Cloudinary Docs: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com
- Node.js SDK: https://cloudinary.com/documentation/node_integration

---

Made with ❤️ for Rekha's Kitchen
