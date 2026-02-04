# 💰 Smart Expense Tracker

A full-stack expense tracking application with AI-powered insights, built with React, Express, TypeScript, and MongoDB.

## 🌟 Features

- **User Authentication** - Secure JWT-based authentication
- **Expense & Income Tracking** - Track all your financial transactions
- **AI-Powered Insights** - Get intelligent financial advice using OpenAI or Google Gemini
- **Interactive Dashboard** - Visualize your spending patterns
- **Category Management** - Organize expenses by categories
- **Responsive Design** - Works seamlessly on desktop and mobile
- **RESTful API** - Well-documented API endpoints

## 🏗️ Architecture

```
expense-tracker/
├── expense-tracker-api/     # Backend API (Express + TypeScript + MongoDB)
├── expense-tracker-web/     # Frontend (React + Vite + TypeScript + Material-UI)
├── docker-compose.yml       # Docker Compose for development
├── docker-compose.prod.yml  # Docker Compose for production
└── Makefile                 # Convenient Docker commands
```

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)

### 1. Clone and Configure

```bash
# Clone the repository
git clone <your-repo-url>
cd expense-tracker

# Copy environment file
cp .env.docker .env

# Edit .env and add your API keys
nano .env
```

### 2. Start the Application

```bash
# Using Make (recommended)
make dev

# Or using Docker Compose directly
docker-compose up -d
```

### 3. Access the Application

- **Web Application**: http://localhost
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

### 4. View Logs

```bash
# All services
make logs

# Specific service
make logs-api
make logs-web
make logs-db
```

## 🛠️ Manual Setup (Without Docker)

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd expense-tracker-api
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd expense-tracker-web
npm install
npm run dev
```

See individual README files for detailed setup:
- [API Documentation](./expense-tracker-api/README.md)
- [Web Documentation](./expense-tracker-web/README.md)

## 📚 Documentation

- **[Docker Deployment Guide](./DOCKER_DEPLOYMENT.md)** - Complete Docker deployment instructions
- **[Setup Guide](./SETUP_COMPLETE.md)** - Manual setup instructions
- **[AI Features](./AGENTIC_AI_FEATURES.md)** - AI-powered features documentation
- **[API Endpoints](./API_ENDPOINTS_CHAT.md)** - API documentation

## 🐳 Docker Commands

```bash
# Development
make dev          # Start all services
make build        # Build Docker images
make logs         # View logs
make down         # Stop services

# Production
make prod         # Start in production mode
make prod-build   # Build production images

# Maintenance
make clean        # Remove containers and volumes
make backup-db    # Backup MongoDB database
make ps           # Show running containers
make stats        # Show resource usage
```

## 🔧 Environment Variables

### Required Variables

```env
# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key

# AI Provider (openai or gemini)
AI_PROVIDER=openai

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key

# Or Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key
```

### Optional Variables

```env
# AI Model
AI_MODEL=gpt-4

# MongoDB URI (for production with external DB)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker

# CORS Origin
CORS_ORIGIN=http://localhost

# Frontend API URL
VITE_API_URL=http://localhost:3001/api
```

## 🧪 Testing

```bash
# API tests
cd expense-tracker-api
npm test

# Web tests
cd expense-tracker-web
npm test
```

## 📦 Production Deployment

### Using Docker (Recommended)

```bash
# 1. Configure production environment
cp .env.production .env
# Edit .env with production values

# 2. Build and start
make prod-build
make prod

# 3. Monitor
make logs
make stats
```

### Manual Deployment

```bash
# Build API
cd expense-tracker-api
npm run build
npm start

# Build Web
cd expense-tracker-web
npm run build
# Serve dist/ folder with nginx or similar
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Environment variable configuration
- Non-root Docker containers
- Security headers in nginx

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with React, Express, MongoDB, and TypeScript
- AI powered by OpenAI and Google Gemini
- UI components from Material-UI

