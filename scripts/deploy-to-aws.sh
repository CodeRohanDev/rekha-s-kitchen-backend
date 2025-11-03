#!/bin/bash

# AWS EC2 Deployment Script for Rekha's Kitchen Backend
# This script automates the deployment process

set -e  # Exit on error

echo "=========================================="
echo "🚀 Rekha's Kitchen - AWS Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Server details
SERVER_IP="13.62.20.88"
SERVER_USER="ubuntu"
KEY_FILE="rekhas-kitchen-key.pem"
APP_DIR="rekhas-kitchen-backend"
APP_NAME="rekhas-kitchen"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    print_error "SSH key file not found: $KEY_FILE"
    echo "Please place your SSH key file in the current directory"
    exit 1
fi

# Set correct permissions for key file
chmod 400 "$KEY_FILE"
print_success "SSH key permissions set"

# Test SSH connection
print_info "Testing SSH connection..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "echo 'Connection successful'" > /dev/null 2>&1; then
    print_success "SSH connection successful"
else
    print_error "Cannot connect to server"
    echo "Please check:"
    echo "  1. Server IP: $SERVER_IP"
    echo "  2. SSH key file: $KEY_FILE"
    echo "  3. AWS Security Group allows SSH from your IP"
    exit 1
fi

echo ""
echo "=========================================="
echo "📦 Deploying Application"
echo "=========================================="
echo ""

# Deploy application
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    set -e
    
    echo "📥 Pulling latest changes..."
    cd ~/rekhas-kitchen-backend
    git pull origin main
    
    echo "📦 Installing dependencies..."
    npm install --production
    
    echo "🔄 Restarting application..."
    pm2 restart rekhas-kitchen || pm2 start src/server.js --name rekhas-kitchen
    
    echo "💾 Saving PM2 configuration..."
    pm2 save
    
    echo "✅ Deployment completed!"
    
    echo ""
    echo "📊 Application Status:"
    pm2 status
    
    echo ""
    echo "📝 Recent Logs:"
    pm2 logs rekhas-kitchen --lines 10 --nostream
ENDSSH

print_success "Deployment completed successfully!"

echo ""
echo "=========================================="
echo "🎉 Deployment Summary"
echo "=========================================="
echo ""
echo "API URL: http://$SERVER_IP/api/v1"
echo "Health Check: http://$SERVER_IP/health"
echo ""
echo "To view logs:"
echo "  ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP"
echo "  pm2 logs $APP_NAME"
echo ""
echo "To restart app:"
echo "  ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP"
echo "  pm2 restart $APP_NAME"
echo ""

# Test health endpoint
print_info "Testing health endpoint..."
sleep 2
if curl -s "http://$SERVER_IP/health" > /dev/null; then
    print_success "API is responding!"
    echo ""
    echo "Response:"
    curl -s "http://$SERVER_IP/health" | python3 -m json.tool || curl -s "http://$SERVER_IP/health"
else
    print_error "API is not responding"
    echo "Please check the logs on the server"
fi

echo ""
print_success "All done! 🚀"
