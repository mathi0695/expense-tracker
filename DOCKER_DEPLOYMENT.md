# Docker Deployment Guide

This guide explains how to deploy the Expense Tracker application using Docker and Docker Compose.

## 📋 Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

## 🏗️ Architecture

The application consists of three services:

1. **MongoDB** - Database (port 27017)
2. **API** - Backend Express server (port 3001)
3. **Web** - Frontend React application served by Nginx (port 80)

## 🚀 Quick Start

### 1. Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.docker .env
```

Edit `.env` and set your actual values:
- `JWT_SECRET` - A secure random string for JWT signing
- `OPENAI_API_KEY` - Your OpenAI API key (if using OpenAI)
- `GEMINI_API_KEY` - Your Google Gemini API key (if using Gemini)
- `AI_PROVIDER` - Choose 'openai' or 'gemini'

### 2. Build and Start All Services

```bash
docker-compose up -d
```

This will:
- Build the API and Web Docker images
- Pull the MongoDB image
- Start all three services
- Create a Docker network for inter-service communication
- Create persistent volumes for MongoDB data

### 3. Access the Application

- **Web Application**: http://localhost
- **API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f mongodb
```

## 🛠️ Individual Service Commands

### Build Services

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build api
docker-compose build web
```

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart api
```

## 🔍 Health Checks

All services include health checks:

```bash
# Check service status
docker-compose ps

# Check health of specific service
docker inspect --format='{{json .State.Health}}' expense-tracker-api
docker inspect --format='{{json .State.Health}}' expense-tracker-web
docker inspect --format='{{json .State.Health}}' expense-tracker-mongodb
```

## 📦 Building Individual Docker Images

### API

```bash
cd expense-tracker-api
docker build -t expense-tracker-api:latest .
```

### Web

```bash
cd expense-tracker-web
docker build -t expense-tracker-web:latest \
  --build-arg VITE_API_URL=http://localhost:3001/api .
```

## 🌐 Production Deployment

### Environment Variables for Production

Update the following in your `.env` file:

```env
# Use a strong, unique JWT secret
JWT_SECRET=<generate-a-strong-random-string>

# Set your actual API keys
OPENAI_API_KEY=<your-actual-openai-key>
GEMINI_API_KEY=<your-actual-gemini-key>
```

### Custom API URL

If deploying to a server with a custom domain:

```bash
# Update docker-compose.yml web service build args
VITE_API_URL=https://api.yourdomain.com/api docker-compose up -d --build web
```

### Using External MongoDB

To use an external MongoDB instance (e.g., MongoDB Atlas):

1. Comment out the `mongodb` service in `docker-compose.yml`
2. Update the API service environment:

```yaml
api:
  environment:
    - MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
```

## 🔒 Security Best Practices

1. **Change default secrets**: Always use strong, unique values for `JWT_SECRET`
2. **Use HTTPS**: In production, use a reverse proxy (nginx/traefik) with SSL certificates
3. **Secure API keys**: Never commit `.env` files to version control
4. **Update regularly**: Keep Docker images and dependencies up to date
5. **Network isolation**: Services communicate through Docker network, not exposed ports

## 🐛 Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose logs <service-name>

# Check if port is already in use
lsof -i :3001  # API
lsof -i :80    # Web
lsof -i :27017 # MongoDB
```

### Database connection issues

```bash
# Verify MongoDB is healthy
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Test connection from API container
docker-compose exec api sh
# Inside container:
# node -e "require('mongoose').connect('mongodb://mongodb:27017/expense-tracker').then(() => console.log('Connected')).catch(e => console.error(e))"
```

### Rebuild after code changes

```bash
# Rebuild and restart specific service
docker-compose up -d --build api

# Rebuild all services
docker-compose up -d --build
```

## 📊 Monitoring

### Resource Usage

```bash
# View resource usage
docker stats

# View specific service
docker stats expense-tracker-api
```

### Database Backup

```bash
# Backup MongoDB data
docker-compose exec mongodb mongodump --out=/data/backup

# Copy backup to host
docker cp expense-tracker-mongodb:/data/backup ./mongodb-backup
```

## 🧹 Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker rmi expense-tracker-api expense-tracker-web

# Clean up unused Docker resources
docker system prune -a
```

## 📝 Notes

- MongoDB data persists in Docker volumes even after containers are stopped
- The web application is served by Nginx for optimal performance
- All services use health checks for reliability
- Services run as non-root users for security

