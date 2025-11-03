# Menu Item Image Upload - API Documentation

## Overview
Menu item image upload functionality using Cloudinary for cloud storage. Supports both separate upload workflow and combined upload+create workflow.

**Storage:** Cloudinary  
**Folder:** `rekhas-kitchen/menu-items/`  
**Max File Size:** 5MB  
**Allowed Formats:** JPEG, PNG, WebP  

---

## Table of Contents
1. [Upload Image Only](#1-upload-image-only)
2. [Upload Image AND Create Menu Item](#2-upload-image-and-create-menu-item)
3. [Delete Image from Storage](#3-delete-image-from-storage)
4. [Update Menu Item with Image](#4-update-menu-item-with-image)
5. [Implementation Examples](#implementation-examples)
6. [Error Handling](#error-handling)

---

## 1. Upload Image Only

Upload a menu item image to Cloudinary and get the URL. Use this when you want to upload the image first, then create the menu item separately.

**Endpoint:** `POST /api/v1/menu/items/upload-image`

**Authentication:** Required (Super Admin, Outlet Admin)

**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | file | Yes | Image file (JPEG, PNG, WebP, max 5MB) |

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/menu/items/upload-image \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/menu-item.jpg"
```

**Example Request (JavaScript/FormData):**
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/v1/menu/items/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const data = await response.json();
console.log(data.data.image_url); // Use this URL when creating menu item
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "image_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rekhas-kitchen/menu-items/1730203800000-menu-item.jpg",
    "file_name": "menu-item-1730203800000.jpg",
    "file_size": 245678,
    "mime_type": "image/jpeg"
  }
}
```

**Use Case:** 
- Upload image first, get URL
- Then create menu item with the URL using `POST /api/v1/menu/items`

---

## 2. Upload Image AND Create Menu Item

Upload image and create menu item in a single request. Recommended for simpler workflow.

**Endpoint:** `POST /api/v1/menu/items/upload-and-create`

**Authentication:** Required (Super Admin, Outlet Admin)

**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | file | Yes | Image file (JPEG, PNG, WebP, max 5MB) |
| category_id | string | Yes | Menu category ID |
| name | string | Yes | Item name |
| description | string | No | Item description |
| price | number | Yes | Item price |
| is_vegetarian | boolean | No | Is vegetarian (default: false) |
| is_vegan | boolean | No | Is vegan (default: false) |
| is_gluten_free | boolean | No | Is gluten free (default: false) |
| spice_level | string | No | Spice level: mild/medium/hot (default: mild) |
| preparation_time | number | No | Preparation time in minutes |
| ingredients | string | No | JSON array of ingredients |
| nutritional_info | string | No | JSON object with nutritional data |
| is_available | boolean | No | Is available for order (default: true) |
| min_order_quantity | number | No | Minimum order quantity (default: 1) |

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/menu/items/upload-and-create \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/paneer-masala.jpg" \
  -F "category_id=cat_123" \
  -F "name=Paneer Butter Masala" \
  -F "description=Rich and creamy paneer curry" \
  -F "price=250" \
  -F "is_vegetarian=true" \
  -F "spice_level=medium" \
  -F "preparation_time=20" \
  -F 'ingredients=["Paneer","Tomatoes","Cream","Spices"]' \
  -F 'nutritional_info={"calories":350,"protein":"15g","carbs":"20g"}' \
  -F "is_available=true"
```

**Example Request (JavaScript/FormData):**
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('category_id', 'cat_123');
formData.append('name', 'Paneer Butter Masala');
formData.append('description', 'Rich and creamy paneer curry');
formData.append('price', '250');
formData.append('is_vegetarian', 'true');
formData.append('spice_level', 'medium');
formData.append('preparation_time', '20');
formData.append('ingredients', JSON.stringify(['Paneer', 'Tomatoes', 'Cream', 'Spices']));
formData.append('nutritional_info', JSON.stringify({
  calories: 350,
  protein: '15g',
  carbs: '20g'
}));
formData.append('is_available', 'true');

const response = await fetch('/api/v1/menu/items/upload-and-create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const data = await response.json();
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "item_id": "item_abc123",
    "item": {
      "id": "item_abc123",
      "category_id": "cat_123",
      "outlet_id": "outlet_456",
      "name": "Paneer Butter Masala",
      "description": "Rich and creamy paneer curry",
      "price": 250,
      "image_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rekhas-kitchen/menu-items/1730203800000-menu-item.jpg",
      "is_vegetarian": true,
      "is_vegan": false,
      "is_gluten_free": false,
      "spice_level": "medium",
      "preparation_time": 20,
      "ingredients": ["Paneer", "Tomatoes", "Cream", "Spices"],
      "nutritional_info": {
        "calories": 350,
        "protein": "15g",
        "carbs": "20g"
      },
      "is_available": true,
      "is_active": true,
      "min_order_quantity": 1,
      "created_by": "user_789",
      "total_orders": 0,
      "average_rating": 0,
      "review_count": 0
    }
  }
}
```

---

## 3. Delete Image from Storage

Delete a menu item image from Cloudinary storage.

**Endpoint:** `DELETE /api/v1/menu/items/delete-image`

**Authentication:** Required (Super Admin, Outlet Admin)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "image_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rekhas-kitchen/menu-items/1730203800000-menu-item.jpg"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Image not found in storage"
  }
}
```

**Note:** When you delete a menu item using `DELETE /api/v1/menu/items/:itemId`, the image is automatically deleted from Cloudinary.

---

## 4. Update Menu Item with Image

To update a menu item's image, you have two options:

### Option A: Upload new image first, then update
```javascript
// 1. Upload new image
const uploadResponse = await fetch('/api/v1/menu/items/upload-image', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formDataWithImage
});
const { image_url } = await uploadResponse.json();

// 2. Update menu item with new image URL
await fetch(`/api/v1/menu/items/${itemId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ image_url })
});

// 3. Delete old image (optional)
await fetch('/api/v1/menu/items/delete-image', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ image_url: oldImageUrl })
});
```

### Option B: Delete item and recreate with new image
```javascript
// 1. Delete old item (image auto-deleted)
await fetch(`/api/v1/menu/items/${itemId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

// 2. Create new item with new image
await fetch('/api/v1/menu/items/upload-and-create', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formDataWithNewImage
});
```

---

## Implementation Examples

### React/React Native Example

```javascript
import React, { useState } from 'react';

const MenuItemUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleImageUpload = async (file) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/v1/menu/items/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setImageUrl(data.data.image_url);
        alert('Image uploaded successfully!');
      } else {
        alert('Upload failed: ' + data.error.message);
      }
    } catch (error) {
      alert('Upload error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateMenuItem = async (itemData) => {
    const formData = new FormData();
    
    // Add image
    formData.append('image', itemData.image);
    
    // Add all other fields
    Object.keys(itemData).forEach(key => {
      if (key !== 'image') {
        if (typeof itemData[key] === 'object') {
          formData.append(key, JSON.stringify(itemData[key]));
        } else {
          formData.append(key, itemData[key]);
        }
      }
    });

    try {
      const response = await fetch('/api/v1/menu/items/upload-and-create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Menu item created successfully!');
        return data.data.item;
      } else {
        alert('Creation failed: ' + data.error.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleImageUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" style={{ width: 200 }} />}
    </div>
  );
};
```

### Admin Panel Example (Complete Form)

```javascript
const CreateMenuItemForm = () => {
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    spice_level: 'mild',
    preparation_time: '',
    ingredients: [],
    nutritional_info: {},
    is_available: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      alert('Please select an image');
      return;
    }

    setLoading(true);

    const submitData = new FormData();
    submitData.append('image', imageFile);
    
    Object.keys(formData).forEach(key => {
      if (key === 'ingredients' || key === 'nutritional_info') {
        submitData.append(key, JSON.stringify(formData[key]));
      } else {
        submitData.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch('/api/v1/menu/items/upload-and-create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        alert('Menu item created successfully!');
        // Reset form
        setFormData({
          category_id: '',
          name: '',
          description: '',
          price: '',
          is_vegetarian: false,
          is_vegan: false,
          is_gluten_free: false,
          spice_level: 'mild',
          preparation_time: '',
          ingredients: [],
          nutritional_info: {},
          is_available: true
        });
        setImageFile(null);
        setImagePreview('');
      } else {
        alert('Error: ' + data.error.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Image Upload */}
      <div>
        <label>Menu Item Image *</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          required
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" style={{ width: 200, marginTop: 10 }} />
        )}
      </div>

      {/* Other form fields... */}
      <div>
        <label>Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Price *</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>

      {/* Add more fields as needed */}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Menu Item'}
      </button>
    </form>
  );
};
```

---

## Error Handling

### Common Errors

**400 Bad Request - No File:**
```json
{
  "success": false,
  "error": {
    "code": "NO_FILE",
    "message": "No image file provided"
  }
}
```

**400 Bad Request - Invalid File:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE",
    "message": "Invalid file type. Only JPEG, PNG, and WebP are allowed"
  }
}
```

**400 Bad Request - File Too Large:**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 5MB limit"
  }
}
```

**404 Not Found - Category Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Category not found"
  }
}
```

**409 Conflict - Duplicate Name:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Menu item with this name already exists in this category"
  }
}
```

**500 Internal Server Error - Upload Failed:**
```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_FAILED",
    "message": "Failed to upload image"
  }
}
```

---

## Best Practices

1. **Image Optimization**
   - Compress images before upload
   - Recommended size: 800x600 pixels
   - Use JPEG for photos, PNG for graphics with transparency

2. **Error Handling**
   - Always validate file size and type on client side
   - Show user-friendly error messages
   - Implement retry logic for network failures

3. **User Experience**
   - Show image preview before upload
   - Display upload progress
   - Provide feedback on success/failure

4. **Security**
   - Only authenticated admins can upload
   - File type validation on both client and server
   - Size limits enforced

5. **Performance**
   - Use Cloudinary's CDN for fast delivery
   - Implement lazy loading for menu images
   - Cache image URLs

---

## Testing Checklist

- [ ] Upload JPEG image
- [ ] Upload PNG image
- [ ] Upload WebP image
- [ ] Try uploading file > 5MB (should fail)
- [ ] Try uploading non-image file (should fail)
- [ ] Upload and create menu item in one step
- [ ] Upload image only, then create item separately
- [ ] Update menu item with new image
- [ ] Delete menu item (image should auto-delete)
- [ ] Delete image manually
- [ ] Test with invalid category_id
- [ ] Test with duplicate item name
- [ ] Test without authentication (should fail)
- [ ] Test with customer role (should fail)

---

## Support

For issues or questions:
- Check Cloudinary dashboard for uploaded images
- Review server logs for upload errors
- Verify Cloudinary credentials in .env file

**Last Updated:** October 29, 2025  
**Version:** 1.0
