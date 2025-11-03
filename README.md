# 🍽️ Rekha's Kitchen - Backend API

A comprehensive Node.js backend API for a multi-outlet restaurant management system with advanced features including loyalty programs, OTP authentication, notifications, reviews, and more.

---

## 🚀 Features

### Core Features
- ✅ **Multi-outlet Management** - Manage multiple restaurant locations
- ✅ **Role-based Access Control** - Super Admin, Admin, Outlet Admin, Kitchen Staff, Delivery Boy, Customer
- ✅ **Menu Management** - Categories, items, pricing, availability
- ✅ **Order Management** - Complete order lifecycle tracking
- ✅ **User Management** - Customer profiles, addresses, preferences

### Advanced Features
- 🎁 **Milestone Loyalty Program** - Free meal rewards every 10th order
- 🤝 **Refer and Earn Program** - Earn rewards by referring friends
- 📱 **OTP Authentication** - Mobile-first passwordless login
- 🔔 **Smart Notifications** - Push, Email, SMS with preferences
- ⭐ **Review System** - Multi-dimensional ratings and feedback
- 🎟️ **Coupon System** - Flexible discount management
- 📊 **Analytics Dashboard** - Comprehensive reporting for admins
- ❤️ **Favorites/Wishlist** - Save favorite menu items for quick access

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Database:** Firebase Firestore
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi
- **Security:** Helmet, bcrypt, rate limiting
- **Logging:** Winston

---

## 📋 Prerequisites

- Node.js 16.0.0 or higher
- Firebase project with Firestore enabled
- npm or yarn package manager

---

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd rekhas-kitchen-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env` file in root directory:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d
```

### 4. Firebase Setup
Place your `serviceaccount.json` file in the root directory.

### 5. Initialize Database
```bash
# Create super admin
npm run create-super-admin

# Initialize loyalty programs
npm run init-loyalty
```

### 6. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:3001`

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Quick Links
- **Complete API Docs:** [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)
- **Mobile App Guide:** [`MOBILE_APP_API_GUIDE.md`](MOBILE_APP_API_GUIDE.md)
- **Frontend Guide:** [`FRONTEND_LOYALTY_API_READY.md`](FRONTEND_LOYALTY_API_READY.md)

### Key Endpoints

#### Authentication
```http
POST   /auth/register          # Register new customer
POST   /auth/login             # Email/password login
POST   /auth/otp/send          # Send OTP to phone
POST   /auth/otp/verify        # Verify OTP and login
POST   /auth/refresh-token     # Refresh access token
POST   /auth/logout            # Logout user
GET    /auth/profile           # Get user profile
```

#### Menu
```http
GET    /menu/full              # Get complete menu
GET    /menu/categories        # Get all categories
GET    /menu/items             # Get menu items with filters
POST   /menu/items             # Create menu item (Admin)
PUT    /menu/items/:id         # Update menu item (Admin)
```

#### Orders
```http
POST   /orders                 # Place new order
GET    /orders/my-orders       # Get customer orders
GET    /orders/:id             # Get order details
PATCH  /orders/:id/status      # Update order status (Staff)
```

#### Loyalty Program
```http
GET    /loyalty/programs              # Get available programs
GET    /loyalty/account               # Get user loyalty account
GET    /loyalty/milestone/progress    # Get milestone progress
GET    /loyalty/milestone/rewards     # Get available rewards
POST   /loyalty/milestone/claim       # Claim milestone reward
GET    /loyalty/admin/accounts        # Admin: View all accounts
GET    /loyalty/admin/analytics       # Admin: Get analytics
```

#### Referral Program
```http
GET    /referral/my-code              # Get your referral code
POST   /referral/apply                # Apply referral code
GET    /referral/account              # Get referral account
GET    /referral/my-referrals         # View your referrals
GET    /referral/rewards              # Get available rewards
POST   /referral/claim                # Claim referral reward
GET    /referral/admin/accounts       # Admin: View all accounts
GET    /referral/admin/analytics      # Admin: Get analytics
```

#### Notifications
```http
GET    /notifications          # Get user notifications
PATCH  /notifications/:id/read # Mark as read
PUT    /notifications/preferences # Update preferences
```

---

## 🔐 Authentication

### Email/Password
```javascript
// Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Use token in subsequent requests
Authorization: Bearer <access_token>
```

### Mobile OTP (Recommended for Mobile Apps)
```javascript
// 1. Send OTP
POST /auth/otp/send
{
  "phone": "+919876543210"
}

// 2. Verify OTP
POST /auth/otp/verify
{
  "phone": "+919876543210",
  "otp": "123456",
  "first_name": "John",
  "last_name": "Doe"
}
```

---

## 👥 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `super_admin` | System administrator | Full access to all features |
| `admin` | Admin user | Manage users, view analytics |
| `outlet_admin` | Outlet manager | Manage assigned outlet |
| `kitchen_staff` | Kitchen employee | Update order status, menu availability |
| `delivery_boy` | Delivery person | Update delivery status |
| `customer` | End user | Place orders, reviews, loyalty |

---

## 🎁 Loyalty Program

### Milestone Rewards Program

**How It Works:**
- Free meal every 10th order
- Reward value: Up to ₹500
- Reward expires in 30 days
- Minimum order ₹200 to count towards milestone

### Features
- Auto-enrollment on first access
- Track progress towards next milestone
- View and claim available rewards
- Admin can manage all user accounts
- Comprehensive analytics

**Setup Guide:** [`LOYALTY_SETUP_GUIDE.md`](LOYALTY_SETUP_GUIDE.md)

---

## 🤝 Refer and Earn Program

### How It Works

**For Referrers:**
- Get a unique 6-character referral code
- Share with friends
- Earn rewards when friends complete orders

**Reward System:**
- 5 successful referrals = 1 free meal (₹500)
- Each referred friend must complete 1 order (≥ ₹200)
- Maximum 3 unclaimed rewards at a time
- Rewards expire in 60 days

### Features
- Automatic referral code generation
- Real-time progress tracking
- View all your referrals and their status
- Claim rewards on orders
- Admin analytics and monitoring

**Complete Guide:** [`REFERRAL_PROGRAM_GUIDE.md`](REFERRAL_PROGRAM_GUIDE.md)

---

## 🚚 Delivery Fee & Payout System (Documentation Ready)

### Customer Delivery Fees

**Distance-Based Pricing:**
- 0-2 km: ₹25-30 (free for orders ₹500+)
- 2-10 km: Base + per km charge (free for orders ₹500+)
- 10-15 km: Base + per km charge (50% off for orders ₹500+)

### Delivery Partner Payouts

**Distance-Based Earnings:**
- 0-2 km: ₹30 flat
- 2-10 km: ₹25 + ₹8/km
- 10-15 km: ₹25 + ₹10/km

### Payout Schedules
- Daily, Weekly, Monthly, or Custom dates
- Global schedule for all partners
- Individual schedules for specific partners
- Fully configurable by super admin

**Documentation:** [`DELIVERY_DOCUMENTATION_INDEX.md`](DELIVERY_DOCUMENTATION_INDEX.md)

---

## 📱 Mobile OTP Authentication

### Features
- Passwordless authentication
- 6-digit OTP
- 5-minute expiry
- Auto-registration for new users
- Console logging for development

### Quick Test
```bash
# Send OTP
curl -X POST http://localhost:3001/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210"}'

# Check console for OTP, then verify
curl -X POST http://localhost:3001/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","otp":"123456"}'
```

**Complete Guide:** [`OTP_AUTHENTICATION_GUIDE.md`](OTP_AUTHENTICATION_GUIDE.md)

---

## 🔔 Notification System

### Channels
- Push Notifications
- Email
- SMS

### Types
- Order updates
- Promotional offers
- Loyalty rewards
- Review reminders
- General announcements

### User Preferences
Users can customize notification preferences per channel and type.

**Guide:** [`docs/NOTIFICATION_SYSTEM_GUIDE.md`](docs/NOTIFICATION_SYSTEM_GUIDE.md)

---

## 📊 Database Structure

### Collections
```
users                      # User accounts
user_profiles              # User profile data
outlets                    # Restaurant outlets
menu_categories            # Menu categories
menu_items                 # Menu items
orders                     # Customer orders
order_items                # Order line items
payments                   # Payment records
reviews                    # Customer reviews
coupons                    # Discount coupons
notifications              # User notifications
notification_preferences   # Notification settings
loyalty_programs           # Loyalty program configs
user_loyalty_accounts      # User loyalty data
loyalty_transactions       # Loyalty transaction history
milestone_rewards          # Milestone rewards
otp_verifications          # OTP verification codes
refresh_tokens             # JWT refresh tokens
```

---

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent brute force attacks
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Joi schema validation
- **Role-based Access** - Granular permissions
- **Audit Logging** - Track all admin actions

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)

# Production
npm start                # Start server

# Database Setup
npm run create-super-admin  # Create super admin user
npm run init-loyalty        # Initialize loyalty programs
npm run init-referral       # Initialize referral program
npm run init-delivery       # Initialize delivery system

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
```

---

## 📁 Project Structure

```
rekhas-kitchen-backend/
├── src/
│   ├── config/
│   │   └── database.js           # Firebase configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── orderController.js    # Order management
│   │   ├── loyaltyController.js  # Loyalty program
│   │   ├── notificationController.js
│   │   ├── reviewController.js
│   │   └── couponController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── validation.js         # Input validation
│   │   └── errorHandler.js       # Error handling
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── orders.js             # Order routes
│   │   ├── loyalty.js            # Loyalty routes
│   │   └── ...
│   └── utils/
│       ├── auth.js               # Auth utilities
│       └── logger.js             # Winston logger
├── scripts/
│   ├── create-super-admin.js     # Admin creation script
│   └── init-loyalty-programs.js  # Loyalty setup script
├── docs/
│   ├── API_DOCUMENTATION.md      # Complete API docs
│   ├── NOTIFICATION_SYSTEM_GUIDE.md
│   └── LOYALTY_ADMIN_MANAGEMENT.md
├── logs/
│   ├── combined.log              # All logs
│   └── error.log                 # Error logs
├── .env                          # Environment variables
├── serviceaccount.json           # Firebase credentials
├── server.js                     # Entry point
└── package.json                  # Dependencies
```

---

## 🧪 Testing

### Test Credentials

**Super Admin:**
```
Email: admin@rekhaskitchen.in
Password: Rohan@0212
```

**Test Customer:**
```
Email: customer@example.com
Password: password123
```

### Test Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Get menu (no auth)
curl http://localhost:3001/api/v1/menu/full

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password123"}'
```

---

## 🚀 Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3001

# Use environment variables instead of serviceaccount.json
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

JWT_SECRET=strong-random-secret
JWT_REFRESH_SECRET=another-strong-secret
```

### Deployment Platforms
- **Heroku** - Easy deployment with Git
- **AWS EC2** - Full control
- **Google Cloud Run** - Serverless containers
- **DigitalOcean** - Simple VPS
- **Railway** - Modern deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS
- [ ] Set up SMS provider for OTP
- [ ] Configure email service
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Enable database backups
- [ ] Configure CDN for static assets
- [ ] Set up CI/CD pipeline

---

## 📈 Monitoring & Logging

### Logs
- **combined.log** - All logs
- **error.log** - Error logs only
- Console output in development

### Key Metrics to Monitor
- API response times
- Error rates
- Authentication success/failure
- Order completion rates
- Loyalty program engagement
- OTP delivery success
- Database query performance

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 Documentation

### For Developers
- [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) - Complete API reference
- [`docs/ENHANCEMENTS_SUMMARY.md`](docs/ENHANCEMENTS_SUMMARY.md) - Feature summary

### For Mobile Developers
- [`MOBILE_APP_API_GUIDE.md`](MOBILE_APP_API_GUIDE.md) - Mobile integration guide
- [`OTP_AUTHENTICATION_GUIDE.md`](OTP_AUTHENTICATION_GUIDE.md) - OTP implementation

### For Frontend Developers
- [`FRONTEND_LOYALTY_API_READY.md`](FRONTEND_LOYALTY_API_READY.md) - Loyalty API guide

### For Admins
- [`docs/LOYALTY_ADMIN_MANAGEMENT.md`](docs/LOYALTY_ADMIN_MANAGEMENT.md) - Admin features
- [`LOYALTY_SETUP_GUIDE.md`](LOYALTY_SETUP_GUIDE.md) - Setup instructions

### For DevOps
- [`scripts/README.md`](scripts/README.md) - Scripts documentation

---

## 🐛 Troubleshooting

### Common Issues

**"Firebase initialization failed"**
- Check `serviceaccount.json` exists
- Verify Firebase credentials
- Ensure Firestore is enabled

**"Port already in use"**
```bash
# Change port in .env
PORT=3002
```

**"OTP not received"**
- Check backend console for OTP
- In production, verify SMS provider setup

**"Token expired"**
- Use refresh token endpoint
- Re-authenticate if refresh token expired

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review error logs
3. Check Firebase console
4. Contact development team

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Authors

**Rekha's Kitchen Development Team**

---

## 🎉 Acknowledgments

- Express.js community
- Firebase team
- All contributors

---

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Complete authentication system
- ✅ Multi-outlet management
- ✅ Order management
- ✅ Dual loyalty programs
- ✅ OTP authentication
- ✅ Notification system
- ✅ Review system
- ✅ Coupon system
- ✅ Admin analytics

---

**Built with ❤️ for Rekha's Kitchen**
