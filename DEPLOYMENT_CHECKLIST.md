# 🚀 Deployment Checklist

Use this checklist to ensure a smooth deployment of the Expense Tracker application.

## Pre-Deployment

### 1. Environment Setup
- [ ] Copy `.env.production` to `.env`
- [ ] Generate a strong `JWT_SECRET` (use: `openssl rand -base64 32`)
- [ ] Add your `OPENAI_API_KEY` or `GEMINI_API_KEY`
- [ ] Set `AI_PROVIDER` to either `openai` or `gemini`
- [ ] Configure `MONGODB_URI` (MongoDB Atlas or external MongoDB)
- [ ] Set `CORS_ORIGIN` to your frontend domain
- [ ] Set `VITE_API_URL` to your backend API URL

### 2. Security Review
- [ ] Ensure `.env` is in `.gitignore`
- [ ] Verify JWT_SECRET is strong and unique
- [ ] Review CORS settings
- [ ] Check that API keys are valid
- [ ] Ensure MongoDB connection uses authentication
- [ ] Review nginx security headers

### 3. Code Review
- [ ] All tests passing
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] API rate limiting configured (if needed)
- [ ] Database indexes created

## Docker Deployment

### 4. Build Images
```bash
# Development
make build

# Production
make prod-build
```

- [ ] API image builds successfully
- [ ] Web image builds successfully
- [ ] No build errors or warnings

### 5. Test Locally
```bash
make dev
```

- [ ] All containers start successfully
- [ ] Health checks pass
- [ ] Can access web application
- [ ] Can access API
- [ ] Can register a new user
- [ ] Can login
- [ ] Can create expenses/income
- [ ] AI features work correctly

### 6. Database Setup
- [ ] MongoDB is accessible
- [ ] Database connection string is correct
- [ ] Database user has proper permissions
- [ ] Backup strategy in place

## Production Deployment

### 7. Server Setup
- [ ] Docker installed on server
- [ ] Docker Compose installed
- [ ] Firewall configured (ports 80, 443, 3001)
- [ ] SSL certificates obtained (Let's Encrypt recommended)
- [ ] Domain DNS configured

### 8. Deploy Application
```bash
# On production server
git clone <repository>
cd expense-tracker
cp .env.production .env
# Edit .env with production values
make prod
```

- [ ] All services started
- [ ] Health checks passing
- [ ] Logs show no errors

### 9. SSL/HTTPS Setup (Recommended)
- [ ] Install nginx or traefik as reverse proxy
- [ ] Configure SSL certificates
- [ ] Redirect HTTP to HTTPS
- [ ] Update CORS_ORIGIN to use https://
- [ ] Update VITE_API_URL to use https://

### 10. Monitoring Setup
```bash
make stats
make logs
```

- [ ] Set up log aggregation (optional)
- [ ] Configure monitoring alerts (optional)
- [ ] Set up uptime monitoring
- [ ] Configure backup automation

## Post-Deployment

### 11. Verification
- [ ] Web application loads correctly
- [ ] Can register new users
- [ ] Can login
- [ ] Can create/edit/delete expenses
- [ ] Can create/edit/delete income
- [ ] Dashboard displays correctly
- [ ] AI chat works
- [ ] All API endpoints respond correctly

### 12. Performance Testing
- [ ] Page load times acceptable
- [ ] API response times acceptable
- [ ] Database queries optimized
- [ ] Images and assets cached properly

### 13. Backup & Recovery
```bash
make backup-db
```

- [ ] Database backup tested
- [ ] Backup restoration tested
- [ ] Backup schedule configured
- [ ] Backup storage configured

### 14. Documentation
- [ ] Update README with production URL
- [ ] Document deployment process
- [ ] Document rollback procedure
- [ ] Document monitoring setup

## Maintenance

### Regular Tasks
- [ ] Monitor logs weekly
- [ ] Review security updates monthly
- [ ] Update dependencies quarterly
- [ ] Test backups monthly
- [ ] Review and rotate API keys as needed

### Scaling Considerations
- [ ] Monitor resource usage
- [ ] Plan for horizontal scaling if needed
- [ ] Consider CDN for static assets
- [ ] Consider database replication
- [ ] Consider load balancing

## Rollback Plan

If deployment fails:

```bash
# Stop current deployment
make prod-down

# Restore previous version
git checkout <previous-tag>
make prod-build
make prod

# Restore database backup if needed
docker-compose exec mongodb mongorestore /data/backup
```

## Common Issues

### Port Already in Use
```bash
# Check what's using the port
lsof -i :80
lsof -i :3001

# Kill the process or change port in docker-compose.yml
```

### Database Connection Failed
```bash
# Check MongoDB logs
make logs-db

# Test connection
docker-compose exec api sh
# Inside container: test MongoDB connection
```

### Container Won't Start
```bash
# Check logs
make logs-api
make logs-web

# Rebuild
make clean
make build
make up
```

## Support

For issues or questions:
1. Check logs: `make logs`
2. Review documentation
3. Check GitHub issues
4. Contact support team

---

**Last Updated**: 2026-02-04
**Version**: 1.0.0

