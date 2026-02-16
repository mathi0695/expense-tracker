# Nginx Configuration for expense.mathiarasan.com

This directory contains Nginx configuration files for the Expense Tracker application.

## Files

- **expense.mathiarasan.com.conf** - Full HTTPS configuration with SSL/TLS
- **expense.mathiarasan.com-http-only.conf** - HTTP-only configuration (for testing or before SSL setup)

## Installation Instructions

### Option 1: HTTP Only (Quick Setup)

```bash
# Copy the HTTP-only config to Nginx sites-available
sudo cp nginx/expense.mathiarasan.com-http-only.conf /etc/nginx/sites-available/expense.mathiarasan.com

# Create symbolic link to sites-enabled
sudo ln -s /etc/nginx/sites-available/expense.mathiarasan.com /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Option 2: HTTPS with SSL (Recommended for Production)

#### Step 1: Install Certbot (if not already installed)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### Step 2: Obtain SSL Certificate

```bash
# Get SSL certificate for your domain
sudo certbot --nginx -d expense.mathiarasan.com

# Or manually:
sudo certbot certonly --nginx -d expense.mathiarasan.com
```

#### Step 3: Install the HTTPS Configuration

```bash
# Copy the HTTPS config to Nginx sites-available
sudo cp nginx/expense.mathiarasan.com.conf /etc/nginx/sites-available/expense.mathiarasan.com

# Create symbolic link to sites-enabled
sudo ln -s /etc/nginx/sites-available/expense.mathiarasan.com /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## DNS Configuration

Make sure your DNS is configured to point to your server:

```
A Record: expense.mathiarasan.com -> YOUR_SERVER_IP
```

## Verify Setup

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check Nginx error logs if issues occur
sudo tail -f /var/log/nginx/expense.mathiarasan.com.error.log

# Check access logs
sudo tail -f /var/log/nginx/expense.mathiarasan.com.access.log
```

## Testing

```bash
# Test HTTP (if using HTTP-only config)
curl http://expense.mathiarasan.com

# Test HTTPS (if using HTTPS config)
curl https://expense.mathiarasan.com
```

## SSL Certificate Auto-Renewal

Certbot automatically sets up a cron job or systemd timer for certificate renewal. Verify it:

```bash
# Test renewal
sudo certbot renew --dry-run

# Check renewal timer (systemd)
sudo systemctl status certbot.timer
```

## Troubleshooting

### Port 5174 not accessible
Make sure your Docker container is running:
```bash
docker-compose ps
docker-compose logs web
```

### WebSocket connection issues
The configuration includes WebSocket support for Vite HMR. If you still have issues:
- Check firewall rules
- Verify proxy headers are being passed correctly

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew
```

## Notes

- The configuration includes WebSocket support for Vite's Hot Module Replacement (HMR)
- Security headers are included for better security
- Client max body size is set to 10M (adjust if needed)
- Uncomment the `/api` location block if you want to proxy API requests through the same domain

