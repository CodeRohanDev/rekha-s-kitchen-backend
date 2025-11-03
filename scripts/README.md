# Scripts Directory

This directory contains utility scripts for database initialization, migrations, and maintenance tasks.

---

## Available Scripts

### 1. Initial Server Setup (`initial-server-setup.sh`)

Sets up a fresh AWS EC2 server with all required software and configurations.

**Usage:**

```bash
# On your EC2 server (first time only)
curl -o setup.sh https://raw.githubusercontent.com/yourusername/rekhas-kitchen-backend/main/scripts/initial-server-setup.sh
chmod +x setup.sh
./setup.sh
```

**What it does:**
- Updates system packages
- Installs Node.js 18.x
- Installs Git, PM2, Nginx
- Configures firewall (UFW)
- Clones repository
- Sets up Nginx reverse proxy
- Creates .env template
- Configures log rotation
- Sets up automated backups

**Time:** ~5-10 minutes

---

### 2. Deploy to AWS (`deploy-to-aws.sh`)

Automated deployment script for pushing updates to AWS EC2.

**Usage:**

```bash
# From your local machine
./scripts/deploy-to-aws.sh
```

**Prerequisites:**
- SSH key file (rekhas-kitchen-key.pem) in current directory
- Server already set up with initial-server-setup.sh
- Git repository configured

**What it does:**
- Tests SSH connection
- Pulls latest code from Git
- Installs dependencies
- Restarts application with PM2
- Tests health endpoint
- Shows deployment status

**Time:** ~30 seconds

---

### 3. Initialize FAQs (`initialize-faqs.js`)

Populates the FAQ system with sample FAQs for all categories.

**Usage:**

```bash
# Option 1: Using environment variable (recommended)
export SUPER_ADMIN_TOKEN="your_access_token_here"
node scripts/initialize-faqs.js

# Option 2: Edit script and update ACCESS_TOKEN variable
node scripts/initialize-faqs.js
```

**What it does:**
- Creates 40+ sample FAQs across 8 categories
- Sets appropriate display order
- Activates all FAQs by default

**Categories initialized:**
- General (4 FAQs)
- Orders (7 FAQs)
- Payments (6 FAQs)
- Delivery (6 FAQs)
- Account (6 FAQs)
- Menu (6 FAQs)
- Loyalty (6 FAQs)
- Technical (6 FAQs)

**Prerequisites:**
- Server must be running
- Super admin account created
- Valid access token

---

### 2. Migrate Coordinates (`migrate-coordinates.js`)

Migrates outlet coordinates from nested structure to flat structure.

**Usage:**

```bash
node scripts/migrate-coordinates.js
```

**What it does:**
- Updates outlet documents with flat coordinate structure
- Maintains backward compatibility
- Logs migration progress

---

## Getting Access Token

### For Super Admin:

1. **Create super admin account** (development only):
```bash
curl -X POST http://localhost:3000/api/v1/auth/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rekhaskitchen.com",
    "password": "SecurePassword123!",
    "phone": "+1234567890",
    "first_name": "Admin",
    "last_name": "User",
    "secret_key": "REKHAS_KITCHEN_SUPER_ADMIN_2024"
  }'
```

2. **Login to get token**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rekhaskitchen.com",
    "password": "SecurePassword123!"
  }'
```

3. **Copy the access_token** from the response

---

## Environment Variables

You can set these environment variables for scripts:

```bash
# API Configuration
export API_BASE_URL="http://localhost:3000/api/v1"

# Authentication
export SUPER_ADMIN_TOKEN="your_access_token_here"

# Run script
node scripts/initialize-faqs.js
```

---

## Common Issues

### "Please set your access token"
- You need to provide a valid super admin access token
- Either set SUPER_ADMIN_TOKEN env variable or edit the script

### "Authentication required" or "Insufficient permissions"
- Your token may be expired
- Login again to get a fresh token
- Ensure you're using a super_admin account

### "Too many requests"
- Scripts include delays to avoid rate limiting
- If you still hit limits, increase the delay in the script

### "Failed to create FAQ"
- Check if server is running
- Verify database connection
- Check server logs for detailed errors

---

## Best Practices

1. **Backup First**
   - Always backup your database before running scripts
   - Test scripts in development environment first

2. **Use Environment Variables**
   - Don't commit tokens to version control
   - Use .env files or environment variables

3. **Check Logs**
   - Scripts provide detailed output
   - Review logs to ensure everything worked correctly

4. **Verify Results**
   - After running scripts, verify data in database
   - Test endpoints to ensure everything works

---

## Creating New Scripts

When creating new initialization scripts, follow this template:

```javascript
/**
 * Script Name
 * 
 * Description of what the script does
 * 
 * Usage:
 * node scripts/your-script.js
 */

const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const ACCESS_TOKEN = process.env.SUPER_ADMIN_TOKEN || 'YOUR_TOKEN_HERE';

async function main() {
  console.log('Starting script...');
  
  // Validate token
  if (ACCESS_TOKEN === 'YOUR_TOKEN_HERE') {
    console.log('❌ Please set access token');
    return;
  }
  
  try {
    // Your script logic here
    
    console.log('✅ Script completed successfully');
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main();
```

---

## Script Maintenance

### Adding New Sample Data

To add more sample FAQs:

1. Edit `initialize-faqs.js`
2. Add FAQs to the `sampleFAQs` object
3. Follow the existing structure
4. Test the script

### Updating Existing Data

To update sample FAQs:

1. Modify the FAQ text in `sampleFAQs`
2. Adjust display_order if needed
3. Run the script (it will create new FAQs)
4. Delete old FAQs manually if needed

---

## Support

For issues with scripts:
1. Check script output for error messages
2. Verify prerequisites are met
3. Check server logs
4. Contact development team

---

## Future Scripts

Planned scripts:
- [ ] Initialize sample menu items
- [ ] Initialize sample outlets
- [ ] Bulk import FAQs from CSV
- [ ] Database cleanup utilities
- [ ] Analytics data seeding
- [ ] Test data generation
