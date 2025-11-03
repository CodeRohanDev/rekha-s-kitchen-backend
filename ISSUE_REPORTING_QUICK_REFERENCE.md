# Issue Reporting API - Quick Reference

## Endpoints Summary

### Customer Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/issues` | Report new issue (with images) | ✅ |
| GET | `/api/v1/issues/my-issues` | Get my issues | ✅ |
| GET | `/api/v1/issues/:issueId` | Get issue details | ✅ |
| POST | `/api/v1/issues/:issueId/comments` | Add comment | ✅ |

### Admin Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/issues/admin/all` | Get all issues | Admin |
| GET | `/api/v1/issues/admin/statistics` | Get statistics | Admin |
| PATCH | `/api/v1/issues/:issueId/status` | Update status | Admin |
| PATCH | `/api/v1/issues/:issueId/assign` | Assign issue | Admin |
| PATCH | `/api/v1/issues/:issueId/priority` | Update priority | Admin |
| POST | `/api/v1/issues/:issueId/internal-notes` | Add internal note | Admin |

---

## Quick Examples

### Report Issue with Images
```bash
curl -X POST http://localhost:3000/api/v1/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg" \
  -F "issue_type=food_quality" \
  -F "subject=Food was cold" \
  -F "description=Detailed description here" \
  -F "order_id=order_123" \
  -F "priority=high"
```

### Get My Issues
```bash
curl -X GET "http://localhost:3000/api/v1/issues/my-issues?status=open" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Issue Details
```bash
curl -X GET http://localhost:3000/api/v1/issues/issue_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add Comment
```bash
curl -X POST http://localhost:3000/api/v1/issues/issue_abc123/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Thank you for the update"}'
```

---

## Issue Types

| Type | Description |
|------|-------------|
| `order_issue` | Wrong/missing items |
| `delivery_issue` | Delivery problems |
| `payment_issue` | Payment/billing issues |
| `food_quality` | Food quality complaints |
| `app_issue` | App technical issues |
| `other` | Other issues |

---

## Status Flow

```
open → in_progress → resolved → closed
```

- **open**: Newly reported
- **in_progress**: Being worked on
- **resolved**: Issue resolved
- **closed**: Closed

---

## Priority Levels

| Priority | Response Time |
|----------|---------------|
| `low` | 48-72 hours |
| `medium` | 24-48 hours |
| `high` | 12-24 hours |
| `urgent` | 2-4 hours |

---

## Image Upload

- **Max Images:** 5 per issue
- **Max Size:** 5MB per image
- **Formats:** JPEG, PNG, WebP
- **Storage:** Cloudinary (`rekhas-kitchen/issues/`)

---

## JavaScript Example

```javascript
// Report issue with images
const formData = new FormData();

imageFiles.forEach(file => {
  formData.append('images', file);
});

formData.append('issue_type', 'food_quality');
formData.append('subject', 'Food was cold');
formData.append('description', 'Detailed description');
formData.append('order_id', 'order_123');
formData.append('priority', 'high');

const response = await fetch('/api/v1/issues', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const data = await response.json();
console.log(data.data.issue_number); // Issue number
```

---

## Error Codes

| Code | Description |
|------|-------------|
| NOT_FOUND | Issue not found |
| FORBIDDEN | Cannot access issue |
| FILE_TOO_LARGE | Image > 5MB |
| TOO_MANY_FILES | More than 5 images |
| INVALID_FILE | Invalid file type |

---

## Features

✅ Report issues with images  
✅ Track issue status  
✅ Add comments  
✅ View issue history  
✅ Filter by status/type  
✅ Admin management  
✅ Cloudinary storage  
✅ Auto-assignment  
✅ Priority levels  
✅ Resolution tracking  

---

## Implementation Status

✅ Controller created  
✅ Routes configured  
✅ Database collection added  
✅ Image upload integrated  
✅ Complete documentation  
✅ Ready for production  

---

## Mobile UI Flow

1. **Report Issue**
   - Select issue type
   - Enter subject & description
   - Attach photos (optional)
   - Select related order (optional)
   - Set priority
   - Submit

2. **View Issues**
   - List all issues
   - Filter by status
   - View details
   - Add comments

3. **Track Status**
   - Open → In Progress → Resolved → Closed
   - Receive notifications
   - View resolution

---

**Last Updated:** October 29, 2025  
**Version:** 1.0  
**Status:** Production Ready
