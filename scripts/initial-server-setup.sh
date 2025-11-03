#!/bin/bash

# Initial AWS EC2 Server Setup Script
# Run this script on your EC2 server for first-time setup

set -e  # Exit on error

echo "=========================================="
echo "🔧 Initial Server Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Update system
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated"

# Install Node.js
print_info "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
print_success "Node.js installed: $(node --version)"

# Install Git
print_info "Installing Git..."
sudo apt install git -y
print_success "Git installed: $(git --version)"

# Install PM2
print_info "Installing PM2..."
sudo npm install -g pm2
print_success "PM2 installed: $(pm2 --version)"

# Install Nginx
print_info "Installing Nginx..."
sudo apt install nginx -y
print_success "Nginx installed"

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
print_success "Nginx started and enabled"

# Install UFW Firewall
print_info "Setting up firewall..."
sudo apt install ufw -y
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw --force enable
print_success "Firewall configured"

# Create application directory
print_info "Setting up application directory..."
cd ~
if [ ! -d "rekhas-kitchen-backend" ]; then
    echo "Please enter your GitHub repository URL:"
    read REPO_URL
    git clone "$REPO_URL" rekhas-kitchen-backend
    print_success "Repository cloned"
else
    print_info "Application directory already exists"
fi

# Install application dependencies
print_info "Installing application dependencies..."
cd ~/rekhas-kitchen-backend
npm install
print_success "Dependencies installed"

# Create .env file template
if [ ! -f ".env" ]; then
    print_info "Creating .env template..."
    cat > .env << 'EOF'
# Server Configuration
PORT=3000
NODE_ENV=production

# Firebase Configuration
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_DATABASE_URL=
FIREBASE_STORAGE_BUCKET=

# MSG91 Configuration
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# SendGrid Configuration
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# Razorpay Configuration
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Sentry Configuration
SENTRY_DSN=

# JWT Configuration
JWT_SECRET=
JWT_REFRESH_SECRET=

# CORS Configuration
CORS_ORIGIN=
EOF
    print_success ".env template created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and add your credentials:"
    echo "   nano ~/rekhas-kitchen-backend/.env"
else
    print_info ".env file already exists"
fi

# Configure Nginx
print_info "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/rekhas-kitchen > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/rekhas-kitchen /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
print_success "Nginx configured"

# Set up PM2 log rotation
print_info "Setting up log rotation..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
print_success "Log rotation configured"

# Create backup script
print_info "Creating backup script..."
cat > ~/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR

tar -czf $BACKUP_DIR/app_$DATE.tar.gz ~/rekhas-kitchen-backend

ls -t $BACKUP_DIR/app_*.tar.gz | tail -n +8 | xargs rm -f

echo "Backup completed: app_$DATE.tar.gz"
EOF

chmod +x ~/backup.sh
print_success "Backup script created"

# Add backup to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup.sh") | crontab -
print_success "Daily backup scheduled (2 AM)"

echo ""
echo "=========================================="
echo "✅ Initial Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Edit environment variables:"
echo "   nano ~/rekhas-kitchen-backend/.env"
echo ""
echo "2. Upload Firebase service account:"
echo "   scp -i your-key.pem serviceaccount.json ubuntu@server-ip:~/rekhas-kitchen-backend/"
echo ""
echo "3. Start the application:"
echo "   cd ~/rekhas-kitchen-backend"
echo "   pm2 start src/server.js --name rekhas-kitchen"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "4. Test the application:"
echo "   curl http://localhost:3000/health"
echo ""
echo "5. View logs:"
echo "   pm2 logs rekhas-kitchen"
echo ""
echo "=========================================="
