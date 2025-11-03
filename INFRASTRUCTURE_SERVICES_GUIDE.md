# Infrastructure Services Guide - Rekha's Kitchen

Complete guide for all third-party services used in the application.

---

## 📋 Services Overview

| Service | Provider | Purpose | Cost |
|---------|----------|---------|------|
| OTP/SMS | MSG91 | Phone verification | ₹0.15-0.20/SMS |
| Push Notifications | Firebase FCM | App notifications | FREE |
| Server | AWS EC2 | Application hosting | FREE (12 months) |
| Database | Firebase Firestore | Data storage | FREE tier available |
| File Storage | Cloudinary | Image/media storage | FREE tier available |
| Email | SendGrid | Transactional emails | FREE tier available |
| Payment Gateway | Razorpay | Payment processing | 2% per transaction |
| CDN | Cloudflare | Content delivery | FREE |
| Analytics | Google Analytics | User analytics | FREE |
| Monitoring | Sentry | Error tracking | FREE tier available |
| Backup | Firebase | Automatic backups | Included |

---

## 1. 📱 MSG91 (OTP/SMS Service)

### Purpose
- Send OTP for phone verification
- Transactional SMS notifications
- Order updates via SMS

### Pricing
```
Pay as you go (₹1500)

OTP SMS:
- 0-10,000 SMS: ₹0.20 per SMS
- 10,001-50,000 SMS: ₹0.18 per SMS
- 50,000+ SMS: ₹0.15 per SMS

Cost Examples:
- 5,000 OTPs: ₹1500
```

### Setup Steps
1. Sign up at https://msg91.com/
2. Verify your account (KYC required)
3. Get API key from dashboard
4. Add sender ID (e.g., "REKHAS")
5. Create OTP template
6. Get template approved (24-48 hours)

### Integration
```javascript
// Install SDK
npm install msg91-node

// Usage
const MSG91 = require('msg91-node');
const msg91 = new MSG91('YOUR_AUTH_KEY');

// Send OTP
await msg91.sendOTP({
  mobile: '+919876543210',
  template_id: 'YOUR_TEMPLATE_ID',
  otp: '123456'
});
```

### Documentation
- Website: https://msg91.com/
- API Docs: https://docs.msg91.com/
- Dashboard: https://control.msg91.com/

---

## 2. 🔔 Firebase Cloud Messaging (Push Notifications)

### Purpose
- Send push notifications to mobile apps
- Order status updates
- Promotional notifications
- Real-time alerts

### Pricing
```
100% FREE
- Unlimited notifications
- No hidden costs
- No monthly limits
```

### Setup Steps
1. Already set up in Firebase project
2. Get server key from Firebase Console
3. Add FCM SDK to mobile app
4. Request notification permissions
5. Get device tokens
6. Store tokens in database

### Integration
```javascript
// Install Admin SDK (already installed)
const admin = require('firebase-admin');

// Send notification
await admin.messaging().send({
  token: deviceToken,
  notification: {
    title: 'Order Confirmed',
    body: 'Your order #1234 has been confirmed'
  },
  data: {
    order_id: '1234',
    type: 'order_update'
  }
});
```

### Documentation
- Console: https://console.firebase.google.com/
- Docs: https://firebase.google.com/docs/cloud-messaging
- Node.js SDK: https://firebase.google.com/docs/admin/setup

---

## 3. 🖥️ AWS EC2 (Server Hosting)

### Purpose
- Host Node.js backend application
- Run API server
- Handle all backend logic

### Pricing
```
Free Tier (12 months):
- t2.micro instance
- 1 vCPU, 1 GB RAM
- 30 GB SSD storage
- 750 hours/month (always on)
- FREE for first 12 months

After Free Tier:
- t3.micro: $8.50/month (₹700/month)
- t3.small: $17/month (₹1,400/month)
- t3.medium: $34/month (₹2,800/month)
```

### Setup Steps
1. Create AWS account at https://aws.amazon.com/
2. Go to EC2 Dashboard
3. Launch Instance
4. Choose Ubuntu Server 22.04 LTS
5. Select t2.micro (free tier)
6. Configure security groups (ports 22, 80, 443, 3000)
7. Create/download key pair
8. Launch instance

### Server Setup
```bash
# Connect to server
ssh -i your-key.pem ubuntu@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Clone your repo
git clone your-repo-url
cd your-repo
npm install

# Start app with PM2
pm2 start src/server.js --name rekhas-kitchen
pm2 startup
pm2 save
```

### Documentation
- Console: https://console.aws.amazon.com/
- EC2 Docs: https://docs.aws.amazon.com/ec2/
- Free Tier: https://aws.amazon.com/free/

---

## 4. 🗄️ Firebase Firestore (Database)

### Purpose
- Store all application data
- User profiles, orders, menu items
- Real-time data sync
- Automatic backups

### Pricing
```
Free (Spark Plan):
- 1 GB storage
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day

Blaze Plan (Pay as you go):
- Storage: $0.18/GB/month (₹15/GB)
- Reads: $0.06 per 100,000 (₹5 per 100k)
- Writes: $0.18 per 100,000 (₹15 per 100k)
- Deletes: $0.02 per 100,000 (₹1.6 per 100k)

Monthly Cost Examples:
- 5,000 users: ₹300-500
- 10,000 users: ₹800-1,200
- 25,000 users: ₹2,000-3,000
- 50,000 users: ₹4,000-6,000
```

### Setup
Already configured in your project!

### Best Practices
- Use indexes for queries
- Batch writes when possible
- Cache frequently accessed data
- Use subcollections for nested data
- Monitor usage in Firebase Console

### Documentation
- Console: https://console.firebase.google.com/
- Docs: https://firebase.google.com/docs/firestore
- Pricing: https://firebase.google.com/pricing

---

## 5. 📦 Cloudinary (File Storage)

### Purpose
- Store food images
- User profile pictures
- Banner images
- Automatic image optimization
- CDN delivery

### Pricing
```
Free Plan:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month
- Image optimization included

Plus Plan: $99/month (₹8,000/month)
- 100 GB storage
- 100 GB bandwidth/month
- 100,000 transformations/month

Monthly Cost Examples:
- Small app: FREE
- Medium app (50GB): FREE
- Large app (100GB+): ₹8,000/month
```

### Setup Steps
1. Sign up at https://cloudinary.com/
2. Get cloud name, API key, API secret
3. Install SDK
4. Configure in your app

### Integration
```javascript
// Install SDK
npm install cloudinary

// Configure
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'your_cloud_name',
  api_key: 'your_api_key',
  api_secret: 'your_api_secret'
});

// Upload image
const result = await cloudinary.uploader.upload(filePath, {
  folder: 'rekhas-kitchen/menu',
  transformation: [
    { width: 800, height: 600, crop: 'fill' },
    { quality: 'auto' },
    { fetch_format: 'auto' }
  ]
});
```

### Documentation
- Website: https://cloudinary.com/
- Dashboard: https://cloudinary.com/console
- Docs: https://cloudinary.com/documentation
- Node.js SDK: https://cloudinary.com/documentation/node_integration

---

## 6. 📧 SendGrid (Email Service)

### Purpose
- Send transactional emails
- Order confirmations
- Password reset emails
- Promotional emails

### Pricing
```
Free Plan:
- 100 emails/day
- 3,000 emails/month
- Email API included

Essentials: $19.95/month (₹1,600/month)
- 50,000 emails/month
- Email validation

Pro: $89.95/month (₹7,400/month)
- 100,000 emails/month
- Advanced features

Monthly Cost Examples:
- <100 emails/day: FREE
- 50,000 emails: ₹1,600/month
- 100,000 emails: ₹7,400/month
```

### Setup Steps
1. Sign up at https://sendgrid.com/
2. Verify sender email/domain
3. Create API key
4. Install SDK
5. Create email templates

### Integration
```javascript
// Install SDK
npm install @sendgrid/mail

// Configure
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send email
await sgMail.send({
  to: 'customer@example.com',
  from: 'noreply@rekhaskitchen.com',
  subject: 'Order Confirmed',
  templateId: 'd-xxxxxxxxxxxxx',
  dynamicTemplateData: {
    order_id: '1234',
    customer_name: 'John Doe'
  }
});
```

### Documentation
- Website: https://sendgrid.com/
- Dashboard: https://app.sendgrid.com/
- API Docs: https://docs.sendgrid.com/
- Node.js SDK: https://github.com/sendgrid/sendgrid-nodejs

---

## 7. 💳 Razorpay (Payment Gateway)

### Purpose
- Accept online payments
- UPI, cards, wallets
- Payment links
- Refunds

### Pricing
```
Transaction Fees:
- Domestic cards: 2% per transaction
- International cards: 3% per transaction
- UPI: 2% per transaction
- Wallets: 2% per transaction
- Net banking: 2% per transaction

No setup fee
No monthly fee
No hidden charges

Monthly Cost Examples:
- ₹50,000 GMV: ₹1,000 fees
- ₹1,00,000 GMV: ₹2,000 fees
- ₹5,00,000 GMV: ₹10,000 fees
- ₹10,00,000 GMV: ₹20,000 fees
```

### Setup Steps
1. Sign up at https://razorpay.com/
2. Complete KYC verification
3. Get API keys (test & live)
4. Install SDK
5. Integrate checkout

### Integration
```javascript
// Install SDK
npm install razorpay

// Create order
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const order = await razorpay.orders.create({
  amount: 50000, // in paise (₹500)
  currency: 'INR',
  receipt: 'order_1234'
});

// Verify payment
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(order_id + '|' + payment_id)
  .digest('hex');
```

### Documentation
- Website: https://razorpay.com/
- Dashboard: https://dashboard.razorpay.com/
- API Docs: https://razorpay.com/docs/api/
- Node.js SDK: https://razorpay.com/docs/server-side/nodejs/

---

## 8. 🌐 Cloudflare (CDN & Security)

### Purpose
- CDN for faster content delivery
- DDoS protection
- Free SSL certificate
- DNS management
- Caching

### Pricing
```
Free Plan:
- Unlimited bandwidth
- DDoS protection
- SSL certificate
- Basic caching
- DNS management

Pro Plan: $20/month (₹1,600/month)
- Advanced caching
- Image optimization
- Better performance

Recommendation: Use FREE plan
```

### Setup Steps
1. Sign up at https://cloudflare.com/
2. Add your domain
3. Update nameservers at domain registrar
4. Configure SSL (Full/Strict)
5. Enable caching rules
6. Set up page rules

### Configuration
```
DNS Records:
- A record: @ → Your AWS server IP
- A record: www → Your AWS server IP
- CNAME: api → Your AWS server

SSL/TLS: Full (Strict)
Caching Level: Standard
Browser Cache TTL: 4 hours
Always Use HTTPS: On
Auto Minify: JS, CSS, HTML
```

### Documentation
- Website: https://cloudflare.com/
- Dashboard: https://dash.cloudflare.com/
- Docs: https://developers.cloudflare.com/

---

## 9. 📊 Google Analytics (Analytics)

### Purpose
- Track user behavior
- Monitor app usage
- Conversion tracking
- User demographics

### Pricing
```
100% FREE
- Unlimited events
- Unlimited users
- Real-time reporting
- Custom reports
```

### Setup Steps
1. Go to https://analytics.google.com/
2. Create account
3. Create property (App + Web)
4. Get Measurement ID
5. Install SDK in mobile app
6. Configure events

### Integration
```javascript
// For web (if needed)
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

// For mobile app
// Add Firebase Analytics SDK
// Events are automatically tracked
```

### Documentation
- Website: https://analytics.google.com/
- Docs: https://developers.google.com/analytics
- Firebase Analytics: https://firebase.google.com/docs/analytics

---

## 10. 🔍 Sentry (Error Monitoring)

### Purpose
- Track application errors
- Monitor performance
- Get alerts for issues
- Debug production problems

### Pricing
```
Free Plan:
- 5,000 errors/month
- 10,000 performance units/month
- 30-day data retention
- Email alerts

Team Plan: $26/month (₹2,100/month)
- 50,000 errors/month
- 100,000 performance units/month
- 90-day retention

Recommendation: Start with FREE plan
```

### Setup Steps
1. Sign up at https://sentry.io/
2. Create project (Node.js)
3. Get DSN key
4. Install SDK
5. Configure error tracking

### Integration
```javascript
// Install SDK
npm install @sentry/node @sentry/profiling-node

// Configure
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'your-dsn-here',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Use in Express
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Documentation
- Website: https://sentry.io/
- Dashboard: https://sentry.io/organizations/
- Docs: https://docs.sentry.io/
- Node.js SDK: https://docs.sentry.io/platforms/node/

---

## 💰 Complete Cost Breakdown

### Monthly Costs by User Scale

#### 0-5,000 Users (Launch Phase)
```
MSG91 (2,000 OTPs): ₹400
Firebase FCM: FREE
AWS EC2: FREE (12 months)
Firebase Firestore: FREE
Cloudinary: FREE
SendGrid: FREE
Razorpay: 2% of GMV
Cloudflare: FREE
Google Analytics: FREE
Sentry: FREE

TOTAL: ₹400/month + 2% transaction fee
```

#### 5,000-15,000 Users (Growth Phase)
```
MSG91 (8,000 OTPs): ₹1,600
Firebase FCM: FREE
AWS EC2: FREE (if within 12 months) or ₹700
Firebase Firestore: ₹800-1,200
Cloudinary: FREE
SendGrid: FREE
Razorpay: 2% of GMV
Cloudflare: FREE
Google Analytics: FREE
Sentry: FREE

TOTAL: ₹2,400-3,500/month + 2% transaction fee
```

#### 15,000-50,000 Users (Scale Phase)
```
MSG91 (25,000 OTPs): ₹4,500
Firebase FCM: FREE
AWS EC2: ₹1,400 (t3.small)
Firebase Firestore: ₹3,000-5,000
Cloudinary: FREE
SendGrid: ₹1,600 (if >3k emails/month)
Razorpay: 2% of GMV
Cloudflare: FREE
Google Analytics: FREE
Sentry: ₹2,100 (Team plan)

TOTAL: ₹12,600-14,600/month + 2% transaction fee
```

---

## 🔐 Environment Variables

Add these to your `.env` file:

```bash
# MSG91
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_template_id

# Firebase (already configured)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Sentry
SENTRY_DSN=your_sentry_dsn

# Server
PORT=3000
NODE_ENV=production
```

---

## 📋 Setup Checklist

### Week 1: Core Services
- [ ] AWS EC2 server setup
- [ ] Domain DNS configured with Cloudflare
- [ ] SSL certificate active
- [ ] Firebase Firestore configured
- [ ] Application deployed

### Week 2: Communication Services
- [ ] MSG91 account created
- [ ] OTP template approved
- [ ] SendGrid account verified
- [ ] Email templates created
- [ ] FCM configured in mobile app

### Week 3: Payment & Storage
- [ ] Razorpay KYC completed
- [ ] Payment integration tested
- [ ] Cloudinary account setup
- [ ] Image upload working

### Week 4: Monitoring & Analytics
- [ ] Google Analytics configured
- [ ] Sentry error tracking active
- [ ] Monitoring dashboard setup
- [ ] Alerts configured

---

## 🆘 Support & Documentation

### Quick Links
- MSG91: https://docs.msg91.com/
- Firebase: https://firebase.google.com/docs
- AWS: https://docs.aws.amazon.com/
- Cloudinary: https://cloudinary.com/documentation
- SendGrid: https://docs.sendgrid.com/
- Razorpay: https://razorpay.com/docs/
- Cloudflare: https://developers.cloudflare.com/
- Sentry: https://docs.sentry.io/

### Support Contacts
- MSG91: support@msg91.com
- Razorpay: support@razorpay.com
- SendGrid: support@sendgrid.com
- AWS: AWS Support Console
- Others: Check respective dashboards

---

## 📈 Scaling Recommendations

### When to Upgrade

**AWS EC2:**
- Upgrade to t3.small when CPU > 80% consistently
- Upgrade to t3.medium when handling 50k+ users

**Firebase Firestore:**
- Monitor daily read/write limits
- Optimize queries to reduce costs
- Consider caching frequently accessed data

**Cloudinary:**
- Upgrade to Plus when storage > 20 GB
- Or switch to AWS S3 for cheaper storage

**SendGrid:**
- Upgrade when sending > 3,000 emails/month
- Consider transactional email templates

**Sentry:**
- Upgrade when errors > 5,000/month
- Or filter less critical errors

---

## 🎯 Cost Optimization Tips

1. **Use Firebase free tier** as long as possible
2. **Cache aggressively** with Cloudflare
3. **Optimize images** before uploading to Cloudinary
4. **Batch database operations** to reduce writes
5. **Use MSG91 bulk pricing** for high volume
6. **Monitor usage** regularly in all dashboards
7. **Set up billing alerts** in AWS
8. **Use CDN** to reduce server bandwidth costs

---

**Last Updated:** October 29, 2025

**Total Estimated Cost:** ₹400-15,000/month (depending on scale) + 2% payment processing fee
