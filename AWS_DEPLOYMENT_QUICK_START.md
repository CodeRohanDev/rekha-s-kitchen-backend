# AWS Deployment - Quick Start Guide

Ultra-quick reference for deploying to AWS EC2.

---

## 🚀 Your Server Info

```
Public IP: 13.62.20.88
SSH: ssh -i rekhas-kitchen-key.pem ubuntu@13.62.20.88
API URL: http://13.62.20.88/api/v1
```

---

## ⚡ First Time Setup (5 Minutes)

### 1. Connect to Server

```bash
chmod 400 rekhas-kitchen-key.pem
ssh -i rekhas-kitchen-key.pem ubuntu@13.62.20.88
```

### 2. Run Setup Script

```bash
# Download and run setup script
curl -o setup.sh https://raw.githubusercontent.com/yourusername/rekhas-kitchen-backend/main/scripts/initial-server-setup.sh
chmod +x setup.sh
./setup.sh
```

### 3. Configure Environment

```bash
nano ~/rekhas-kitchen-backend/.env
```

Add your credentials, then save (`Ctrl+X`, `Y`, `Enter`)

### 4. Upload Firebase Service Account

From your local machine:

```bash
scp -i rekhas-kitchen-key.pem serviceaccount.json ubuntu@13.62.20.88:~/rekhas-kitchen-backend/
```

### 5. Start Application

```bash
cd ~/rekhas-kitchen-backend
pm2 start src/server.js --name rekhas-kitchen
pm2 save
pm2 startup  # Copy and run the command it shows
```

### 6. Test

```bash
curl http://13.62.20.88/health
```

✅ Done! Your API is live!

---

## 🔄 Deploy Updates (30 Seconds)

### Option A: Automated (Recommended)

From your local machine:

```bash
./scripts/deploy-to-aws.sh
```

### Option B: Manual

```bash
# SSH to server
ssh -i rekhas-kitchen-key.pem ubuntu@13.62.20.88

# Update code
cd ~/rekhas-kitchen-backend
git pull origin main
npm install
pm2 restart rekhas-kitchen
```

---

## 📝 Common Commands

### Application

```bash
pm2 status                    # Check status
pm2 logs rekhas-kitchen       # View logs
pm2 restart rekhas-kitchen    # Restart app
pm2 stop rekhas-kitchen       # Stop app
pm2 monit                     # Monitor resources
```

### Server

```bash
sudo systemctl status nginx   # Check Nginx
sudo systemctl restart nginx  # Restart Nginx
df -h                         # Check disk space
free -h                       # Check memory
top                           # Check CPU
```

### Logs

```bash
pm2 logs rekhas-kitchen --lines 50              # App logs
sudo tail -f /var/log/nginx/error.log           # Nginx errors
sudo tail -f /var/log/nginx/access.log          # Nginx access
```

---

## 🐛 Quick Troubleshooting

### App won't start

```bash
pm2 logs rekhas-kitchen --lines 100
cat ~/rekhas-kitchen-backend/.env  # Check env vars
```

### Can't access API

```bash
# Check if app is running
pm2 status

# Check if Nginx is running
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Test locally
curl http://localhost:3000/health
```

### Out of memory

```bash
free -h                       # Check memory
pm2 restart rekhas-kitchen    # Restart app
```

---

## 🔒 Security Checklist

- [ ] SSH key has correct permissions (400)
- [ ] Firewall is enabled (UFW)
- [ ] Only necessary ports are open (22, 80, 443)
- [ ] Environment variables are set
- [ ] .env file is not in git
- [ ] PM2 is set to start on boot

---

## 📊 Monitoring

### Check Application Health

```bash
curl http://13.62.20.88/health
```

### Check Resource Usage

```bash
pm2 monit
```

### View Error Logs

```bash
pm2 logs rekhas-kitchen --err
```

---

## 🆘 Emergency Commands

### Restart Everything

```bash
pm2 restart all
sudo systemctl restart nginx
```

### Clear Logs

```bash
pm2 flush
```

### Check What's Using Port 3000

```bash
sudo lsof -i :3000
```

---

## 📦 Backup & Restore

### Manual Backup

```bash
cd ~
tar -czf backup-$(date +%Y%m%d).tar.gz rekhas-kitchen-backend
```

### Restore from Backup

```bash
cd ~
tar -xzf backup-20251029.tar.gz
cd rekhas-kitchen-backend
npm install
pm2 restart rekhas-kitchen
```

---

## 🔗 Important URLs

- **API Base**: http://13.62.20.88/api/v1
- **Health Check**: http://13.62.20.88/health
- **AWS Console**: https://console.aws.amazon.com/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Connect to server | `ssh -i rekhas-kitchen-key.pem ubuntu@13.62.20.88` |
| View logs | `pm2 logs rekhas-kitchen` |
| Restart app | `pm2 restart rekhas-kitchen` |
| Update code | `cd ~/rekhas-kitchen-backend && git pull && pm2 restart rekhas-kitchen` |
| Check status | `pm2 status` |
| Test API | `curl http://13.62.20.88/health` |

---

## 🎯 Next Steps

1. ✅ Deploy application
2. ⏳ Point domain to 13.62.20.88
3. ⏳ Set up SSL certificate
4. ⏳ Update mobile app with API URL
5. ⏳ Set up monitoring alerts
6. ⏳ Configure automated backups

---

**Need detailed instructions?** See `AWS_DEPLOYMENT_GUIDE.md`

**Need help?** Check logs: `pm2 logs rekhas-kitchen`
