# Loyalty Program API Documentation for Mobile App

## Overview
The Loyalty Program allows customers to earn rewards through the **Milestone Program**. Every 10th completed order earns a free meal reward.

**Program Type:** Milestone-based  
**Reward:** Free meal on every 10th order  
**Minimum Order:** ₹200 to count towards milestone  
**Reward Expiry:** 60 days from earning  
**Auto-Enrollment:** Users are automatically enrolled on first order

**Base URL:** `/api/v1/loyalty`

---

## Table of Contents
1. [Get Loyalty Account](#1-get-loyalty-account)
2. [Get Milestone Progress](#2-get-milestone-progress)
3. [Get Available Rewards](#3-get-available-rewards)
4. [Claim Milestone Reward](#4-claim-milestone-reward)
5. [Get Transaction History](#5-get-transaction-history)
6. [Get Available Programs](#6-get-available-programs)
7. [Error Codes](#error-codes)
8. [Mobile Implementation Guide](#mobile-implementation-guide)

---

## 1. Get Loyalty Account

Get the user's complete loyalty account information including program details and current status.

**Endpoint:** `GET /api/v1/loyalty/account`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "account": {
      "id": "account_abc123",
      "user_id": "user_456",
      "active_program_id": "program_789",
      "active_program_type": "milestone",
      "activated_at": "2025-01-15T10:00:00.000Z",
      "milestone_program": {
        "total_orders_completed": 7,
        "current_milestone_progress": 7,
        "next_milestone_at": 10,
        "total_milestones_achieved": 0,
        "total_rewards_claimed": 0,
        "is_frozen": false
      },
      "created_at": "2025-01-15T10:00:00.000Z",
      "updated_at": "2025-10-29T10:00:00.000Z"
    },
    "active_program": {
      "id": "program_789",
      "program_type": "milestone",
      "name": "Milestone Rewards",
      "description": "Get a free meal every 10 orders",
      "is_active": true,
      "is_default": true,
      "config": {
        "milestone_interval": 10,
        "reward_type": "free_meal",
        "min_order_amount": 200,
        "reward_expiry_days": 60
      }
    }
  }
}
```

**Use Case:** Display user's loyalty status on profile screen or loyalty dashboard.

---

## 2. Get Milestone Progress

Get the user's current progress towards the next milestone reward.

**Endpoint:** `GET /api/v1/loyalty/milestone/progress`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "current_progress": 7,
    "next_milestone": 10,
    "total_orders": 7,
    "total_milestones_achieved": 0,
    "total_rewards_claimed": 0,
    "is_active": true,
    "is_frozen": false
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| current_progress | number | Orders completed towards next milestone (0-9) |
| next_milestone | number | Total orders needed for next reward (always 10) |
| total_orders | number | Total qualifying orders completed |
| total_milestones_achieved | number | Total milestones reached |
| total_rewards_claimed | number | Total rewards claimed |
| is_active | boolean | Whether milestone program is active |
| is_frozen | boolean | Whether account is frozen by admin |

**Use Case:** 
- Display progress bar: "7 out of 10 orders completed"
- Show on home screen or order confirmation
- Update after each order

---

## 3. Get Available Rewards

Get all available (unclaimed) milestone rewards for the user.

**Endpoint:** `GET /api/v1/loyalty/milestone/rewards`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": "reward_abc123",
        "user_id": "user_456",
        "milestone_number": 1,
        "earned_at": "2025-10-20T15:30:00.000Z",
        "expires_at": "2025-12-19T15:30:00.000Z",
        "status": "available",
        "reward_details": {
          "type": "free_meal",
          "description": "Free meal up to ₹300",
          "max_value": 300,
          "items": [
            {
              "item_id": "item_123",
              "item_name": "Paneer Butter Masala",
              "quantity": 1
            },
            {
              "item_id": "item_456",
              "item_name": "Naan",
              "quantity": 2
            }
          ]
        },
        "created_at": "2025-10-20T15:30:00.000Z"
      },
      {
        "id": "reward_def456",
        "user_id": "user_456",
        "milestone_number": 2,
        "earned_at": "2025-10-25T18:00:00.000Z",
        "expires_at": "2025-12-24T18:00:00.000Z",
        "status": "available",
        "reward_details": {
          "type": "free_meal",
          "description": "Free meal up to ₹300",
          "max_value": 300,
          "items": [
            {
              "item_id": "item_789",
              "item_name": "Chicken Biryani",
              "quantity": 1
            }
          ]
        },
        "created_at": "2025-10-25T18:00:00.000Z"
      }
    ],
    "count": 2
  }
}
```

**Reward Status:**
- `available` - Can be claimed
- `claimed` - Already used
- `expired` - Past expiry date

**Use Case:**
- Display available rewards on loyalty screen
- Show reward count badge
- Allow user to select reward during checkout

---

## 4. Claim Milestone Reward

Claim a milestone reward and apply it to an order.

**Endpoint:** `POST /api/v1/loyalty/milestone/claim`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reward_id": "reward_abc123",
  "order_id": "order_xyz789"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reward_id | string | Yes | ID of the reward to claim |
| order_id | string | Yes | ID of the order to apply reward to |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Reward claimed successfully",
  "data": {
    "reward_items": [
      {
        "item_id": "item_123",
        "item_name": "Paneer Butter Masala",
        "quantity": 1
      },
      {
        "item_id": "item_456",
        "item_name": "Naan",
        "quantity": 2
      }
    ],
    "order_id": "order_xyz789"
  }
}
```

**Error Responses:**

**404 Not Found** - Reward doesn't exist:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Reward not found"
  }
}
```

**403 Forbidden** - Reward belongs to another user:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "This reward does not belong to you"
  }
}
```

**400 Bad Request** - Reward not available:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Reward is not available"
  }
}
```

**400 Bad Request** - Reward expired:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Reward has expired"
  }
}
```

**Use Case:**
- User selects reward during checkout
- Apply reward to order
- Show confirmation message

---

## 5. Get Transaction History

Get the user's loyalty transaction history.

**Endpoint:** `GET /api/v1/loyalty/transactions`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| program_type | string | No | Filter by program type (milestone) |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |

**Example Request:**
```
GET /api/v1/loyalty/transactions?page=1&limit=20
GET /api/v1/loyalty/transactions?program_type=milestone
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "trans_abc123",
        "user_id": "user_456",
        "program_type": "milestone",
        "type": "milestone_achieved",
        "description": "Milestone 1 achieved - 10 orders completed",
        "metadata": {
          "milestone_number": 1,
          "orders_completed": 10
        },
        "created_at": "2025-10-20T15:30:00.000Z"
      },
      {
        "id": "trans_def456",
        "user_id": "user_456",
        "program_type": "milestone",
        "type": "order_completed",
        "description": "Order completed - Progress: 7/10",
        "metadata": {
          "order_id": "order_123",
          "order_amount": 450,
          "progress": 7
        },
        "created_at": "2025-10-29T10:00:00.000Z"
      },
      {
        "id": "trans_ghi789",
        "user_id": "user_456",
        "program_type": "milestone",
        "type": "milestone_claimed",
        "description": "Milestone reward claimed",
        "metadata": {
          "reward_id": "reward_abc123",
          "order_id": "order_xyz789"
        },
        "created_at": "2025-10-21T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3
    }
  }
}
```

**Transaction Types:**
- `milestone_achieved` - Reached a milestone (10th order)
- `order_completed` - Qualifying order completed
- `milestone_claimed` - Reward claimed
- `admin_reset` - Admin reset progress

**Use Case:**
- Display transaction history on loyalty screen
- Show activity timeline
- Track rewards earned and claimed

---

## 6. Get Available Programs

Get information about available loyalty programs.

**Endpoint:** `GET /api/v1/loyalty/programs`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "programs": [
      {
        "id": "program_789",
        "program_type": "milestone",
        "name": "Milestone Rewards",
        "description": "Get a free meal every 10 orders",
        "is_active": true,
        "is_default": true,
        "config": {
          "milestone_interval": 10,
          "reward_type": "free_meal",
          "min_order_amount": 200,
          "reward_expiry_days": 60
        },
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Use Case:**
- Display program information
- Show terms and conditions
- Explain how rewards work

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| NOT_FOUND | 404 | Reward or account not found |
| FORBIDDEN | 403 | Reward belongs to another user |
| VALIDATION_ERROR | 400 | Invalid request or reward not available |
| UNAUTHORIZED | 401 | Invalid or missing authentication token |
| INTERNAL_ERROR | 500 | Server error |

---

## Mobile Implementation Guide

### 1. Loyalty Dashboard Screen

**Screen Components:**
- Progress bar showing orders towards next milestone
- Available rewards count badge
- Transaction history list
- Program information

**Example Layout:**
```
┌─────────────────────────────────────┐
│  🎁 Loyalty Rewards                 │
├─────────────────────────────────────┤
│  Progress to Next Reward            │
│  ████████░░ 7/10 orders             │
│  3 more orders to go!               │
├─────────────────────────────────────┤
│  Available Rewards (2)              │
│  ┌─────────────────────────────┐   │
│  │ 🎁 Free Meal                │   │
│  │ Expires: Dec 19, 2025       │   │
│  │ [Claim Now]                 │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 🎁 Free Meal                │   │
│  │ Expires: Dec 24, 2025       │   │
│  │ [Claim Now]                 │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Recent Activity                    │
│  • Milestone achieved - Oct 20      │
│  • Order completed - Oct 29         │
│  • Reward claimed - Oct 21          │
└─────────────────────────────────────┘
```

### 2. Load Loyalty Data

```javascript
// Example: Load loyalty dashboard data
async function loadLoyaltyDashboard() {
  try {
    showLoading();
    
    // Load account and progress
    const [accountRes, progressRes, rewardsRes] = await Promise.all([
      fetch('/api/v1/loyalty/account', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }),
      fetch('/api/v1/loyalty/milestone/progress', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }),
      fetch('/api/v1/loyalty/milestone/rewards', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
    ]);
    
    const account = await accountRes.json();
    const progress = await progressRes.json();
    const rewards = await rewardsRes.json();
    
    if (account.success && progress.success && rewards.success) {
      // Update UI
      updateProgressBar(progress.data.current_progress, progress.data.next_milestone);
      displayAvailableRewards(rewards.data.rewards);
      updateRewardsBadge(rewards.data.count);
    }
  } catch (error) {
    showError('Failed to load loyalty data');
  } finally {
    hideLoading();
  }
}
```

### 3. Display Progress Bar

```javascript
// Example: Update progress bar
function updateProgressBar(current, total) {
  const percentage = (current / total) * 100;
  const remaining = total - current;
  
  // Update progress bar
  progressBar.style.width = `${percentage}%`;
  
  // Update text
  progressText.textContent = `${current}/${total} orders`;
  
  if (remaining === 0) {
    messageText.textContent = 'Congratulations! You earned a reward!';
  } else if (remaining === 1) {
    messageText.textContent = '1 more order to go!';
  } else {
    messageText.textContent = `${remaining} more orders to go!`;
  }
}
```

### 4. Display Available Rewards

```javascript
// Example: Render available rewards
function displayAvailableRewards(rewards) {
  if (rewards.length === 0) {
    showEmptyState('No rewards available yet');
    return;
  }
  
  const rewardsList = rewards.map(reward => {
    const expiryDate = new Date(reward.expires_at);
    const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
      <div class="reward-card">
        <div class="reward-icon">🎁</div>
        <div class="reward-details">
          <h3>${reward.reward_details.description}</h3>
          <p>Expires: ${formatDate(expiryDate)}</p>
          ${daysUntilExpiry <= 7 ? `<p class="warning">Expires in ${daysUntilExpiry} days!</p>` : ''}
          <button onclick="claimReward('${reward.id}')">Claim Now</button>
        </div>
      </div>
    `;
  }).join('');
  
  rewardsContainer.innerHTML = rewardsList;
}
```

### 5. Claim Reward During Checkout

```javascript
// Example: Claim reward and apply to order
async function claimReward(rewardId, orderId) {
  try {
    showLoading();
    
    const response = await fetch('/api/v1/loyalty/milestone/claim', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reward_id: rewardId,
        order_id: orderId
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Reward claimed successfully!');
      
      // Add reward items to order
      data.data.reward_items.forEach(item => {
        addItemToOrder(item.item_id, item.quantity, true); // true = free item
      });
      
      // Refresh rewards list
      await loadAvailableRewards();
      
      // Update order total
      recalculateOrderTotal();
    } else {
      showToast(data.error.message);
    }
  } catch (error) {
    showToast('Failed to claim reward');
  } finally {
    hideLoading();
  }
}
```

### 6. Show Progress After Order

```javascript
// Example: Update progress after order completion
async function showOrderCompletionWithProgress(orderId) {
  try {
    // Get updated progress
    const response = await fetch('/api/v1/loyalty/milestone/progress', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const { current_progress, next_milestone } = data.data;
      
      // Show progress in order confirmation
      if (current_progress === next_milestone) {
        // Milestone achieved!
        showCelebration('🎉 Congratulations! You earned a free meal!');
      } else {
        const remaining = next_milestone - current_progress;
        showMessage(`${remaining} more order${remaining > 1 ? 's' : ''} until your next reward!`);
      }
      
      // Update progress bar
      updateProgressBar(current_progress, next_milestone);
    }
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
}
```

### 7. Transaction History Screen

```javascript
// Example: Load and display transaction history
async function loadTransactionHistory(page = 1) {
  try {
    showLoading();
    
    const response = await fetch(
      `/api/v1/loyalty/transactions?page=${page}&limit=20`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      renderTransactions(data.data.transactions);
      updatePagination(data.data.pagination);
    }
  } catch (error) {
    showError('Failed to load transaction history');
  } finally {
    hideLoading();
  }
}

function renderTransactions(transactions) {
  const transactionsList = transactions.map(transaction => {
    const icon = getTransactionIcon(transaction.type);
    const date = formatDate(transaction.created_at);
    
    return `
      <div class="transaction-item">
        <div class="transaction-icon">${icon}</div>
        <div class="transaction-details">
          <p class="transaction-description">${transaction.description}</p>
          <p class="transaction-date">${date}</p>
        </div>
      </div>
    `;
  }).join('');
  
  transactionsContainer.innerHTML = transactionsList;
}

function getTransactionIcon(type) {
  const icons = {
    'milestone_achieved': '🎉',
    'order_completed': '✅',
    'milestone_claimed': '🎁',
    'admin_reset': '🔄'
  };
  return icons[type] || '📝';
}
```

### 8. Rewards Badge on Tab

```javascript
// Example: Update rewards count badge
async function updateRewardsBadge() {
  try {
    const response = await fetch('/api/v1/loyalty/milestone/rewards', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const count = data.data.count;
      
      if (count > 0) {
        showBadge(count);
      } else {
        hideBadge();
      }
    }
  } catch (error) {
    console.error('Failed to update rewards badge');
  }
}

// Call this after login and after any reward changes
```

### 9. Handle Frozen Account

```javascript
// Example: Check if account is frozen
async function checkAccountStatus() {
  try {
    const response = await fetch('/api/v1/loyalty/milestone/progress', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const data = await response.json();
    
    if (data.success && data.data.is_frozen) {
      showWarning('Your loyalty account is temporarily frozen. Please contact support.');
      disableLoyaltyFeatures();
    }
  } catch (error) {
    console.error('Failed to check account status');
  }
}
```

### 10. Best Practices

1. **Auto-Refresh**: Refresh loyalty data after each order
2. **Badge Updates**: Update rewards badge on app launch and after claims
3. **Expiry Warnings**: Show warnings for rewards expiring soon (< 7 days)
4. **Celebration**: Show celebration animation when milestone is achieved
5. **Progress Visibility**: Display progress on home screen or order confirmation
6. **Error Handling**: Handle expired rewards gracefully
7. **Offline Support**: Cache loyalty data for offline viewing
8. **Push Notifications**: Notify users when they earn rewards
9. **Deep Linking**: Support deep links to loyalty screen
10. **Analytics**: Track loyalty engagement metrics

---

## Testing Checklist

- [ ] Load loyalty account
- [ ] Display progress bar correctly
- [ ] Show available rewards
- [ ] Claim reward successfully
- [ ] Handle expired rewards
- [ ] Handle claimed rewards
- [ ] View transaction history
- [ ] Update progress after order
- [ ] Show milestone achievement celebration
- [ ] Handle frozen account
- [ ] Display expiry warnings
- [ ] Update rewards badge
- [ ] Test with no rewards
- [ ] Test with multiple rewards
- [ ] Test pagination in history

---

## Support

For issues or questions, contact the backend team or refer to the main API documentation.

**API Version:** 1.0  
**Last Updated:** October 29, 2025  
**Program Type:** Milestone-based  
**Reward Interval:** Every 10 orders
