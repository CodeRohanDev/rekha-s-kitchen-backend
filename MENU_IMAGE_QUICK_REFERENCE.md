# Menu Item Image Upload - Quick Reference

## Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/menu/items/upload-image` | Upload image only | Admin |
| POST | `/api/v1/menu/items/upload-and-create` | Upload + create item | Admin |
| DELETE | `/api/v1/menu/items/delete-image` | Delete image | Admin |

## Quick Examples

### Upload Image Only
```bash
curl -X POST http://localhost:3000/api/v1/menu/items/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@menu-item.jpg"
```

### Upload and Create Menu Item
```bash
curl -X POST http://localhost:3000/api/v1/menu/items/upload-and-create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@paneer-masala.jpg" \
  -F "category_id=cat_123" \
  -F "name=Paneer Butter Masala" \
  -F "description=Rich and creamy" \
  -F "price=250" \
  -F "is_vegetarian=true" \
  -F "spice_level=medium"
```

### Delete Image
```bash
curl -X DELETE http://localhost:3000/api/v1/menu/items/delete-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image_url":"https://res.cloudinary.com/..."}'
```

## File Requirements

- **Max Size:** 5MB
- **Formats:** JPEG, PNG, WebP
- **Recommended:** 800x600px, compressed

## Storage

- **Provider:** Cloudinary
- **Folder:** `rekhas-kitchen/menu-items/`
- **CDN:** Automatic via Cloudinary

## Features

✅ Upload image only (get URL)  
✅ Upload + create in one step  
✅ Auto-delete on item deletion  
✅ Manual image deletion  
✅ File validation (type, size)  
✅ Cloudinary CDN delivery  
✅ Admin-only access  

## Workflow Options

### Option 1: Separate Upload
1. Upload image → Get URL
2. Create menu item with URL

### Option 2: Combined Upload
1. Upload image + create item in one request

### Option 3: Update Image
1. Upload new image → Get URL
2. Update menu item with new URL
3. Delete old image (optional)

## JavaScript Example

```javascript
// Upload and create
const formData = new FormData();
formData.append('image', imageFile);
formData.append('category_id', 'cat_123');
formData.append('name', 'Paneer Masala');
formData.append('price', '250');
formData.append('is_vegetarian', 'true');

const response = await fetch('/api/v1/menu/items/upload-and-create', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const data = await response.json();
console.log(data.data.item);
```

## Error Codes

| Code | Description |
|------|-------------|
| NO_FILE | No image provided |
| INVALID_FILE | Wrong file type |
| FILE_TOO_LARGE | Exceeds 5MB |
| NOT_FOUND | Category not found |
| CONFLICT | Duplicate item name |
| UPLOAD_FAILED | Cloudinary error |

## Implementation Status

✅ Controller methods created  
✅ Routes configured  
✅ Multer middleware integrated  
✅ Cloudinary storage configured  
✅ Auto-delete on item deletion  
✅ Complete documentation  
✅ Ready for production  
