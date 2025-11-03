# AWS EC2 Deployment Guide - Rekha's Kitchen Backend

Complete step-by-step guide to deploy your Node.js backend on AWS EC2.

---

## 📋 Your Server Details

```
Public IP: 13.62.20.88
Instance ID: i-091f76e99f6d98574
Instance Type: t3.micro (Free Tier)
OS: Ubuntu 24.04 LTS
Region: eu-north-1 (Stockholm)
Status: Running ✅
```

---

## 🚀 Deployment Steps

### Step 1: Connect to Your Server

#### Option A: Using SSH (Recommended)

```bash
# Make sure your key file has correct permissions
chmod 400 rekhas-kitchen-key.pem

# Connect to server
ssh -i rekhas-kitchen-key.pem ubuntu@13.62.20.88
```

#### Option B: Using AWS Console (Browser-based)

1. Go to EC2 Console
2. Select your instance
3. Click "Connect" button
4. Choose "EC2 Instance Connect"
5. Click "Connect"

---

### Step 2: Initial Server Setup

Once connected, run these commands:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x

# Install Git
sudo apt install git -y

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Web Server)
sudo apt install nginx -y
```

---

### Step 3: Clone Your Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
# Replace with your actual GitHub repo URL
git clone https://github.com/yourusername/rekhas-kitchen-backend.git

# Navigate to project directory
cd rekhas-kitchen-backend

# Install dependencies
npm install
```

---

### Step 4: Set Up Environment Variables

```bash
# Create .env file
nano .env
```

Add your environment variables:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_DATABASE_URL=your_database_url
FIREBASE_STORAGE_BUCKET=your_storage_bucket

# MSG91 Configuration
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_template_id

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Razorpay Configuration
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Sentry Configuration
SENTRY_DSN=your_sentry_dsn

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com
```

**Save and exit:** Press `Ctrl + X`, then `Y`, then `Enter`

---

### Step 5: Upload Firebase Service Account

You need to upload your `serviceaccount.json` file:

#### Option A: Using SCP (From your local machine)

```bash
# From your local machine (not on server)
scp -i rekhas-kitchen-key.pem /path/to/serviceaccount.json ubuntu@13.62.20.88:~/rekhas-kitchen-backend/
```

#### Option B: Create file manually on server

```bash
# On server
cd ~/rekhas-kitchen-backend
nano serviceaccount.json
```

Paste your Firebase service account JSON content, then save.

---

### Step 6: Test Your Application

```bash
# Start the app temporarily to test
npm start

# You should see:
# Server running on port 3000
# Firebase initialized successfully
```

**Test from another terminal:**

```bash
curl http://localhost:3000/health
```

If it works, press `Ctrl + C` to stop the app.

---

### Step 7: Set Up PM2 (Process Manager)

```bash
# Start app with PM2
pm2 start src/server.js --name rekhas-kitchen

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Copy and run the command it shows

# Check status
pm2 status

# View logs
pm2 logs rekhas-kitchen

# Other useful PM2 commands:
# pm2 restart rekhas-kitchen  # Restart app
# pm2 stop rekhas-kitchen      # Stop app
# pm2 delete rekhas-kitchen    # Remove from PM2
```

---

### Step 8: Configure Nginx (Reverse Proxy)

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/rekhas-kitchen
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name 13.62.20.88;  # Use your domain later

    # Increase body size for file uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Save and exit:** `Ctrl + X`, `Y`, `Enter`

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/rekhas-kitchen /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

---

### Step 9: Configure AWS Security Groups

1. Go to EC2 Console
2. Click on your instance
3. Go to "Security" tab
4. Click on the security group link
5. Click "Edit inbound rules"
6. Add these rules:

```
Type: HTTP
Protocol: TCP
Port: 80
Source: 0.0.0.0/0 (Anywhere IPv4)

Type: HTTPS
Protocol: TCP
Port: 443
Source: 0.0.0.0/0 (Anywhere IPv4)

Type: Custom TCP
Protocol: TCP
Port: 3000
Source: 0.0.0.0/0 (Optional - for direct API access)

Type: SSH
Protocol: TCP
Port: 22
Source: Your IP (for security)
```

---

### Step 10: Test Your Deployment

```bash
# From your local machine or browser
curl http://13.62.20.88/health

# Or visit in browser:
http://13.62.20.88/health
```

You should see:
```json
{
  "success": true,
  "message": "Rekha's Kitchen API is running",
  "timestamp": "2025-10-29T...",
  "environment": "production"
}
```

---

## 🔒 Step 11: Set Up SSL Certificate (Optional but Recommended)

### Prerequisites:
- You need a domain name
- Domain should point to your server IP (13.62.20.88)

### Install Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 📝 Useful Commands

### Application Management

```bash
# View logs
pm2 logs rekhas-kitchen

# Restart app
pm2 restart rekhas-kitchen

# Stop app
pm2 stop rekhas-kitchen

# View app status
pm2 status

# Monitor app
pm2 monit
```

### Server Management

```bash
# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

### Update Application

```bash
# Navigate to project directory
cd ~/rekhas-kitchen-backend

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Restart app
pm2 restart rekhas-kitchen
```

---

## 🔥 Firewall Setup (Optional but Recommended)

```bash
# Install UFW (Uncomplicated Firewall)
sudo apt install ufw -y

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 📊 Monitoring Setup

### Set Up PM2 Monitoring

```bash
# Link PM2 to PM2.io (optional)
pm2 link your_secret_key your_public_key

# Or use PM2 web interface
pm2 web
```

### Set Up Log Rotation

```bash
# Install PM2 log rotate
pm2 install pm2-logrotate

# Configure (optional)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🐛 Troubleshooting

### App won't start

```bash
# Check logs
pm2 logs rekhas-kitchen --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Check environment variables
pm2 env 0
```

### Can't connect to server

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check if app is running
pm2 status

# Check firewall
sudo ufw status

# Check AWS Security Groups in console
```

### Database connection issues

```bash
# Verify Firebase credentials
cat .env | grep FIREBASE

# Test Firebase connection
node -e "const admin = require('firebase-admin'); console.log('Firebase OK');"
```

### High memory usage

```bash
# Check memory
free -h

# Restart app
pm2 restart rekhas-kitchen

# Consider upgrading instance if needed
```

---

## 📦 Backup Strategy

### Automated Backups

```bash
# Create backup script
nano ~/backup.sh
```

Add this content:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/app_$DATE.tar.gz ~/rekhas-kitchen-backend

# Keep only last 7 backups
ls -t $BACKUP_DIR/app_*.tar.gz | tail -n +8 | xargs rm -f

echo "Backup completed: app_$DATE.tar.gz"
```

```bash
# Make executable
chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * ~/backup.sh
```

---

## 🔄 CI/CD Setup (Optional)

### Using GitHub Actions

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy to AWS EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to EC2
      uses: appleboy/ssh-action@master
      with:
        host: 13.62.20.88
        username: ubuntu
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd ~/rekhas-kitchen-backend
          git pull origin main
          npm install
          pm2 restart rekhas-kitchen
```

---

## 📈 Performance Optimization

### Enable Gzip Compression

```bash
# Edit Nginx config
sudo nano /etc/nginx/nginx.conf
```

Add in `http` block:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### Enable Caching

Add to your Nginx server block:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🎯 Post-Deployment Checklist

- [ ] Application is running (check with `pm2 status`)
- [ ] Health endpoint responds (http://13.62.20.88/health)
- [ ] Nginx is configured and running
- [ ] Security groups allow HTTP/HTTPS traffic
- [ ] Environment variables are set correctly
- [ ] Firebase connection works
- [ ] PM2 is set to start on boot
- [ ] Logs are being written (`pm2 logs`)
- [ ] SSL certificate installed (if using domain)
- [ ] Firewall configured (UFW)
- [ ] Backups scheduled
- [ ] Monitoring set up (Sentry)

---

## 📞 Quick Reference

### Your Server Access

```bash
# SSH Command
ssh -i rekhas-kitchen-key.pem ubuntu@13.62.20.88

# Public IP
13.62.20.88

# API Base URL
http://13.62.20.88/api/v1
```

### Important Paths

```bash
# Application
~/rekhas-kitchen-backend

# Nginx Config
/etc/nginx/sites-available/rekhas-kitchen

# Logs
~/.pm2/logs/
/var/log/nginx/

# Environment
~/rekhas-kitchen-backend/.env
```

### Emergency Commands

```bash
# Restart everything
pm2 restart all && sudo systemctl restart nginx

# Check what's wrong
pm2 logs --lines 50

# Free up memory
pm2 flush  # Clear logs
```

---

## 🆘 Need Help?

1. Check logs: `pm2 logs rekhas-kitchen`
2. Check Nginx: `sudo nginx -t`
3. Check firewall: `sudo ufw status`
4. Check AWS Security Groups in console
5. Verify environment variables: `cat .env`

---

**Your API will be available at:** `http://13.62.20.88/api/v1`

**Next Steps:**
1. Point your domain to this IP
2. Set up SSL certificate
3. Update mobile app with new API URL
4. Test all endpoints
5. Monitor logs for any issues

Good luck with your deployment! 🚀
