# Issue Reporting API Documentation for Mobile App

## Overview
The Issue Reporting system allows users to report problems, complaints, or feedback with optional image attachments. Admins can track, assign, and resolve issues efficiently.

**Features:**
- Report issues with images (up to 5 images)
- Track issue status
- Add comments
- View issue history
- Admin management dashboard

**Base URL:** `/api/v1/issues`

---

## Table of Contents
1. [Report New Issue](#1-report-new-issue)
2. [Get My Issues](#2-get-my-issues)
3. [Get Issue Details](#3-get-issue-details)
4. [Add Comment](#4-add-comment)
5. [Issue Types & Status](#issue-types--status)
6. [Error Codes](#error-codes)
7. [Mobile Implementation Guide](#mobile-implementation-guide)

---

## 1. Report New Issue

Report a new issue with optional image attachments.

**Endpoint:** `POST /api/v1/issues`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| images | file[] | No | Up to 5 images (JPEG, PNG, WebP, max 5MB each) |
| issue_type | string | Yes | Type of issue (see types below) |
| subject | string | Yes | Brief subject/title |
| description | string | Yes | Detailed description |
| order_id | string | No | Related order ID (if applicable) |
| outlet_id | string | No | Related outlet ID (if applicable) |
| priority | string | No | Priority level: low/medium/high/urgent (default: medium) |

**Issue Types:**
- `order_issue` - Problems with order (wrong items, missing items, etc.)
- `delivery_issue` - Delivery problems (late, wrong address, etc.)
- `payment_issue` - Payment or billing issues
- `food_quality` - Food quality complaints
- `app_issue` - Mobile app technical issues
- `other` - Other issues

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@issue-photo1.jpg" \
  -F "images=@issue-photo2.jpg" \
  -F "issue_type=food_quality" \
  -F "subject=Food was cold" \
  -F "description=The food arrived cold and the packaging was damaged" \
  -F "order_id=order_123" \
  -F "priority=high"
```

**Example Request (JavaScript/FormData):**
```javascript
const formData = new FormData();

// Add images
imageFiles.forEach(file => {
  formData.append('images', file);
});

// Add issue details
formData.append('issue_type', 'food_quality');
formData.append('subject', 'Food was cold');
formData.append('description', 'The food arrived cold and the packaging was damaged');
formData.append('order_id', 'order_123');
formData.append('priority', 'high');

const response = await fetch('/api/v1/issues', {
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
  "message": "Issue reported successfully",
  "data": {
    "issue_id": "issue_abc123def456",
    "issue_number": "ISSUE_ABC",
    "status": "open",
    "created_at": "2025-10-29T10:00:00.000Z"
  }
}
```

**Use Case:**
- Report problems from order history
- Report app issues from settings
- Submit feedback or complaints

---

## 2. Get My Issues

Get all issues reported by the authenticated user.

**Endpoint:** `GET /api/v1/issues/my-issues`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status (open/in_progress/resolved/closed) |
| issue_type | string | No | Filter by issue type |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |

**Example Request:**
```
GET /api/v1/issues/my-issues?page=1&limit=20
GET /api/v1/issues/my-issues?status=open
GET /api/v1/issues/my-issues?issue_type=order_issue
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "issues": [
      {
        "id": "issue_abc123",
        "issue_number": "ABC123DE",
        "issue_type": "food_quality",
        "subject": "Food was cold",
        "description": "The food arrived cold and the packaging was damaged",
        "status": "in_progress",
        "priority": "high",
        "images": [
          "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rekhas-kitchen/issues/issue-1730203800000.jpg",
          "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rekhas-kitchen/issues/issue-1730203801000.jpg"
        ],
        "order": {
          "id": "order_123",
          "order_number": "ORD-2025-001",
          "total_amount": 450,
          "created_at": "2025-10-29T09:00:00.000Z"
        },
        "outlet": {
          "id": "outlet_456",
          "name": "Rekha's Kitchen - Downtown",
          "address": "123 Main Street, City"
        },
        "resolution": null,
        "resolved_at": null,
        "comments_count": 2,
        "created_at": "2025-10-29T10:00:00.000Z",
        "updated_at": "2025-10-29T11:00:00.000Z"
      },
      {
        "id": "issue_def456",
        "issue_number": "DEF456GH",
        "issue_type": "delivery_issue",
        "subject": "Late delivery",
        "description": "Order was delivered 45 minutes late",
        "status": "resolved",
        "priority": "medium",
        "images": [],
        "order": {
          "id": "order_789",
          "order_number": "ORD-2025-002",
          "total_amount": 350,
          "created_at": "2025-10-28T18:00:00.000Z"
        },
        "outlet": null,
        "resolution": "We apologize for the delay. A refund has been processed.",
        "resolved_at": "2025-10-28T20:00:00.000Z",
        "comments_count": 3,
        "created_at": "2025-10-28T19:00:00.000Z",
        "updated_at": "2025-10-28T20:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 2,
      "items_per_page": 20,
      "has_next": false,
      "has_previous": false
    }
  }
}
```

**Issue Status:**
- `open` - Newly reported, not yet assigned
- `in_progress` - Being worked on
- `resolved` - Issue resolved
- `closed` - Issue closed (no further action)

**Use Case:**
- Display user's issue history
- Track issue status
- View resolutions

---

## 3. Get Issue Details

Get detailed information about a specific issue.

**Endpoint:** `GET /api/v1/issues/:issueId`

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| issueId | string | Yes | Issue ID |

**Example Request:**
```
GET /api/v1/issues/issue_abc123
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "issue": {
      "id": "issue_abc123",
      "issue_number": "ABC123DE",
      "issue_type": "food_quality",
      "subject": "Food was cold",
      "description": "The food arrived cold and the packaging was damaged",
      "status": "in_progress",
      "priority": "high",
      "images": [
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rekhas-kitchen/issues/issue-1730203800000.jpg",
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rekhas-kitchen/issues/issue-1730203801000.jpg"
      ],
      "order": {
        "id": "order_123",
        "order_number": "ORD-2025-001",
        "total_amount": 450,
        "status": "delivered",
        "created_at": "2025-10-29T09:00:00.000Z"
      },
      "outlet": {
        "id": "outlet_456",
        "name": "Rekha's Kitchen - Downtown",
        "address": "123 Main Street, City",
        "phone": "+1234567890"
      },
      "assigned_to": {
        "id": "admin_789",
        "name": "John Doe",
        "role": "admin"
      },
      "resolution": null,
      "resolved_at": null,
      "comments": [
        {
          "id": "comment_1730203900000",
          "user_id": "user_123",
          "user_role": "customer",
          "comment": "This is very disappointing. I was really looking forward to this meal.",
          "created_at": "2025-10-29T10:15:00.000Z"
        },
        {
          "id": "comment_1730204000000",
          "user_id": "admin_789",
          "user_role": "admin",
          "comment": "We sincerely apologize for this experience. We're investigating with the kitchen and delivery team.",
          "created_at": "2025-10-29T10:30:00.000Z"
        }
      ],
      "created_at": "2025-10-29T10:00:00.000Z",
      "updated_at": "2025-10-29T11:00:00.000Z"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Issue not found"
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only view your own issues"
  }
}
```

**Use Case:**
- View full issue details
- Read comments and updates
- Check resolution status

---

## 4. Add Comment

Add a comment to an existing issue.

**Endpoint:** `POST /api/v1/issues/:issueId/comments`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| issueId | string | Yes | Issue ID |

**Request Body:**
```json
{
  "comment": "Thank you for looking into this. I appreciate the quick response."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "id": "comment_1730204100000",
      "user_id": "user_123",
      "user_role": "customer",
      "comment": "Thank you for looking into this. I appreciate the quick response.",
      "created_at": "2025-10-29T11:00:00.000Z"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Issue not found"
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only comment on your own issues"
  }
}
```

**Use Case:**
- Provide additional information
- Respond to admin questions
- Thank for resolution

---

## Issue Types & Status

### Issue Types
| Type | Description | Common Use Cases |
|------|-------------|------------------|
| `order_issue` | Order problems | Wrong items, missing items, incorrect quantity |
| `delivery_issue` | Delivery problems | Late delivery, wrong address, delivery person issues |
| `payment_issue` | Payment/billing | Payment failed, wrong amount charged, refund issues |
| `food_quality` | Food quality | Cold food, bad taste, poor packaging, hygiene issues |
| `app_issue` | App technical issues | Crashes, bugs, UI problems, login issues |
| `other` | Other issues | General feedback, suggestions, other complaints |

### Status Flow
```
open → in_progress → resolved → closed
```

- **open**: Newly reported, awaiting assignment
- **in_progress**: Assigned and being worked on
- **resolved**: Issue resolved, awaiting user confirmation
- **closed**: Issue closed, no further action

### Priority Levels
| Priority | Description | Response Time |
|----------|-------------|---------------|
| `low` | Minor issues | 48-72 hours |
| `medium` | Standard issues | 24-48 hours |
| `high` | Important issues | 12-24 hours |
| `urgent` | Critical issues | 2-4 hours |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| NOT_FOUND | 404 | Issue not found |
| FORBIDDEN | 403 | Cannot access this issue |
| VALIDATION_ERROR | 400 | Invalid request data |
| FILE_TOO_LARGE | 400 | Image exceeds 5MB |
| INVALID_FILE | 400 | Invalid file type |
| TOO_MANY_FILES | 400 | More than 5 images |
| UNAUTHORIZED | 401 | Invalid or missing token |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Mobile Implementation Guide

### 1. Issue Reporting Screen

**Screen Components:**
- Issue type selector
- Subject input
- Description textarea
- Image picker (up to 5 images)
- Order selector (optional)
- Priority selector
- Submit button

**Example Layout:**
```
┌─────────────────────────────────────┐
│  ← Report an Issue                  │
├─────────────────────────────────────┤
│  Issue Type *                       │
│  [Dropdown: Select type]            │
│                                     │
│  Subject *                          │
│  [Input: Brief description]         │
│                                     │
│  Description *                      │
│  [Textarea: Detailed description]   │
│                                     │
│  Related Order (Optional)           │
│  [Dropdown: Select order]           │
│                                     │
│  Attach Photos (Optional)           │
│  [📷] [📷] [📷] [+]                 │
│  Up to 5 photos                     │
│                                     │
│  Priority                           │
│  ○ Low  ● Medium  ○ High  ○ Urgent │
│                                     │
│  [Submit Issue]                     │
└─────────────────────────────────────┘
```

### 2. Report Issue with Images

```javascript
// Example: Report issue with images
async function reportIssue(issueData, imageFiles) {
  try {
    showLoading();
    
    const formData = new FormData();
    
    // Add images
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
    
    // Add issue details
    formData.append('issue_type', issueData.issue_type);
    formData.append('subject', issueData.subject);
    formData.append('description', issueData.description);
    
    if (issueData.order_id) {
      formData.append('order_id', issueData.order_id);
    }
    
    if (issueData.outlet_id) {
      formData.append('outlet_id', issueData.outlet_id);
    }
    
    formData.append('priority', issueData.priority || 'medium');
    
    const response = await fetch('/api/v1/issues', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Issue reported successfully');
      showConfirmation(data.data.issue_number);
      navigateToMyIssues();
    } else {
      showToast(data.error.message);
    }
  } catch (error) {
    showToast('Failed to report issue');
  } finally {
    hideLoading();
  }
}
```

### 3. My Issues Screen

```javascript
// Example: Load user's issues
async function loadMyIssues(status = null, page = 1) {
  try {
    showLoading();
    
    let url = `/api/v1/issues/my-issues?page=${page}&limit=20`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.data.issues.length === 0) {
        showEmptyState('No issues reported yet');
      } else {
        renderIssues(data.data.issues);
        updatePagination(data.data.pagination);
      }
    }
  } catch (error) {
    showError('Failed to load issues');
  } finally {
    hideLoading();
  }
}

function renderIssues(issues) {
  const issuesList = issues.map(issue => {
    const statusColor = getStatusColor(issue.status);
    const priorityIcon = getPriorityIcon(issue.priority);
    
    return `
      <div class="issue-card" onclick="viewIssue('${issue.id}')">
        <div class="issue-header">
          <span class="issue-number">#${issue.issue_number}</span>
          <span class="status ${statusColor}">${issue.status}</span>
        </div>
        <h3>${priorityIcon} ${issue.subject}</h3>
        <p class="issue-type">${formatIssueType(issue.issue_type)}</p>
        <div class="issue-footer">
          <span>${formatDate(issue.created_at)}</span>
          <span>${issue.comments_count} comments</span>
        </div>
      </div>
    `;
  }).join('');
  
  issuesContainer.innerHTML = issuesList;
}
```

### 4. Issue Details Screen

```javascript
// Example: Load issue details
async function loadIssueDetails(issueId) {
  try {
    showLoading();
    
    const response = await fetch(`/api/v1/issues/${issueId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      renderIssueDetails(data.data.issue);
    } else {
      showError(data.error.message);
    }
  } catch (error) {
    showError('Failed to load issue details');
  } finally {
    hideLoading();
  }
}

function renderIssueDetails(issue) {
  // Render issue header
  issueNumberEl.textContent = `#${issue.issue_number}`;
  statusEl.textContent = issue.status;
  statusEl.className = `status ${getStatusColor(issue.status)}`;
  
  // Render issue details
  subjectEl.textContent = issue.subject;
  descriptionEl.textContent = issue.description;
  typeEl.textContent = formatIssueType(issue.issue_type);
  priorityEl.textContent = issue.priority;
  createdAtEl.textContent = formatDate(issue.created_at);
  
  // Render images
  if (issue.images.length > 0) {
    renderImages(issue.images);
  }
  
  // Render order info
  if (issue.order) {
    renderOrderInfo(issue.order);
  }
  
  // Render resolution
  if (issue.resolution) {
    renderResolution(issue.resolution, issue.resolved_at);
  }
  
  // Render comments
  renderComments(issue.comments);
}
```

### 5. Add Comment

```javascript
// Example: Add comment to issue
async function addComment(issueId, comment) {
  try {
    showLoading();
    
    const response = await fetch(`/api/v1/issues/${issueId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Comment added');
      appendComment(data.data.comment);
      clearCommentInput();
    } else {
      showToast(data.error.message);
    }
  } catch (error) {
    showToast('Failed to add comment');
  } finally {
    hideLoading();
  }
}
```

### 6. Image Picker

```javascript
// Example: Image picker with validation
function setupImagePicker() {
  const maxImages = 5;
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    // Validate count
    if (selectedImages.length + files.length > maxImages) {
      showToast(`You can only upload up to ${maxImages} images`);
      return;
    }
    
    // Validate each file
    for (const file of files) {
      // Check size
      if (file.size > maxSize) {
        showToast(`${file.name} is too large. Max size is 5MB`);
        continue;
      }
      
      // Check type
      if (!allowedTypes.includes(file.type)) {
        showToast(`${file.name} is not a valid image type`);
        continue;
      }
      
      // Add to selected images
      selectedImages.push(file);
      displayImagePreview(file);
    }
  });
}

function displayImagePreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.innerHTML = `
      <img src="${e.target.result}" alt="Preview">
      <button onclick="removeImage(${selectedImages.length - 1})">×</button>
    `;
    imagePreviewContainer.appendChild(preview);
  };
  reader.readAsDataURL(file);
}
```

### 7. Status Filters

```javascript
// Example: Filter issues by status
function setupStatusFilters() {
  const filters = ['all', 'open', 'in_progress', 'resolved', 'closed'];
  
  filters.forEach(status => {
    const button = document.getElementById(`filter-${status}`);
    button.addEventListener('click', () => {
      // Update active filter
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      
      // Load issues with filter
      const filterValue = status === 'all' ? null : status;
      loadMyIssues(filterValue);
    });
  });
}
```

### 8. Report from Order History

```javascript
// Example: Quick report from order
function reportIssueFromOrder(order) {
  // Pre-fill issue form with order details
  navigateToReportIssue({
    order_id: order.id,
    outlet_id: order.outlet_id,
    issue_type: 'order_issue',
    subject: `Issue with Order #${order.order_number}`
  });
}
```

### 9. Push Notifications

```javascript
// Example: Handle issue update notifications
function handleIssueNotification(notification) {
  if (notification.type === 'issue_update') {
    const { issue_id, status, message } = notification.data;
    
    // Show notification
    showNotification({
      title: 'Issue Update',
      body: message,
      icon: getStatusIcon(status),
      onClick: () => navigateToIssue(issue_id)
    });
    
    // Update badge if on issues screen
    if (currentScreen === 'issues') {
      refreshIssuesList();
    }
  }
}
```

### 10. Best Practices

1. **Image Validation**: Validate images before upload (size, type, count)
2. **Progress Indicator**: Show upload progress for images
3. **Auto-Save**: Save draft issues locally
4. **Quick Actions**: Allow reporting from order history
5. **Status Updates**: Show notifications for status changes
6. **Offline Support**: Queue issues for submission when online
7. **Image Compression**: Compress images before upload
8. **Error Handling**: Handle network errors gracefully
9. **Deep Linking**: Support deep links to specific issues
10. **Analytics**: Track issue reporting patterns

---

## Testing Checklist

- [ ] Report issue without images
- [ ] Report issue with 1 image
- [ ] Report issue with 5 images
- [ ] Try uploading > 5 images (should fail)
- [ ] Try uploading file > 5MB (should fail)
- [ ] Try uploading non-image file (should fail)
- [ ] View my issues list
- [ ] Filter issues by status
- [ ] Filter issues by type
- [ ] View issue details
- [ ] Add comment to issue
- [ ] View images in issue
- [ ] Test with related order
- [ ] Test without related order
- [ ] Test pagination
- [ ] Test empty state

---

## Support

For issues or questions, contact the backend team or refer to the main API documentation.

**API Version:** 1.0  
**Last Updated:** October 29, 2025  
**Max Images:** 5 per issue  
**Max Image Size:** 5MB  
**Allowed Formats:** JPEG, PNG, WebP  
