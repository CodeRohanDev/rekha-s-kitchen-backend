# Issue Management API Documentation for Admin Dashboard

## Overview
Complete API documentation for Super Admin and Admin dashboard to manage customer issues, track resolutions, and analyze support metrics.

**Base URL:** `/api/v1/issues`

**Authentication:** Required (Super Admin or Admin role)

---

## Table of Contents
1. [Get All Issues](#1-get-all-issues)
2. [Get Issue Details](#2-get-issue-details)
3. [Update Issue Status](#3-update-issue-status)
4. [Assign Issue](#4-assign-issue)
5. [Update Priority](#5-update-priority)
6. [Add Internal Note](#6-add-internal-note)
7. [Add Comment](#7-add-comment)
8. [Get Statistics](#8-get-statistics)
9. [Dashboard Implementation Guide](#dashboard-implementation-guide)

---

## 1. Get All Issues

Get all issues with advanced filtering and pagination for the admin dashboard.

**Endpoint:** `GET /api/v1/issues/admin/all`

**Authentication:** Required (Super Admin, Admin)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status (open/in_progress/resolved/closed) |
| issue_type | string | No | Filter by type (order_issue/delivery_issue/etc.) |
| priority | string | No | Filter by priority (low/medium/high/urgent) |
| assigned_to | string | No | Filter by assigned user ID |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 50, max: 100) |

**Example Requests:**
```
GET /api/v1/issues/admin/all?page=1&limit=50
GET /api/v1/issues/admin/all?status=open&priority=high
GET /api/v1/issues/admin/all?issue_type=food_quality
GET /api/v1/issues/admin/all?assigned_to=admin_123
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
        "status": "open",
        "priority": "high",
        "user": {
          "id": "user_456",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "assigned_to": null,
        "comments_count": 2,
        "created_at": "2025-10-29T10:00:00.000Z",
        "updated_at": "2025-10-29T11:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 245,
      "items_per_page": 50,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

**Use Case:**
- Display issues table in dashboard
- Filter and search issues
- Monitor unassigned issues
- Track high-priority issues

---

## 2. Get Issue Details

Get complete details of a specific issue including all comments and internal notes.

**Endpoint:** `GET /api/v1/issues/:issueId`

**Authentication:** Required (Super Admin, Admin)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| issueId | string | Yes | Issue ID |

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
      "description": "The food arrived cold and the packaging was damaged. This is very disappointing.",
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
        "name": "Jane Smith",
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
          "id": "comment_17302040000