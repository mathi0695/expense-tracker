.PHONY: help build up down restart logs clean dev prod

# Default target
help:
	@echo "Expense Tracker - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start all services in development mode"
	@echo "  make build        - Build all Docker images"
	@echo "  make up           - Start all services"
	@echo "  make down         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View logs from all services"
	@echo "  make logs-api     - View API logs"
	@echo "  make logs-web     - View Web logs"
	@echo "  make logs-db      - View MongoDB logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start services in production mode"
	@echo "  make prod-build   - Build production images"
	@echo "  make prod-down    - Stop production services"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        - Stop services and remove volumes"
	@echo "  make clean-all    - Remove all containers, images, and volumes"
	@echo "  make backup-db    - Backup MongoDB database"
	@echo "  make shell-api    - Open shell in API container"
	@echo "  make shell-web    - Open shell in Web container"
	@echo "  make ps           - Show running containers"
	@echo "  make stats        - Show container resource usage"

# Development commands
dev:
	docker-compose up -d
	@echo "✅ Development environment started"
	@echo "🌐 Web: http://localhost"
	@echo "🔌 API: http://localhost:3001"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-web:
	docker-compose logs -f web

logs-db:
	docker-compose logs -f mongodb

# Production commands
prod:
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Production environment started"

prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-down:
	docker-compose -f docker-compose.prod.yml down

# Maintenance commands
clean:
	docker-compose down -v
	@echo "✅ Containers and volumes removed"

clean-all:
	docker-compose down -v --rmi all
	@echo "✅ All containers, images, and volumes removed"

backup-db:
	@mkdir -p ./backups
	docker-compose exec mongodb mongodump --out=/data/backup
	docker cp expense-tracker-mongodb:/data/backup ./backups/mongodb-$(shell date +%Y%m%d-%H%M%S)
	@echo "✅ Database backed up to ./backups/"

shell-api:
	docker-compose exec api sh

shell-web:
	docker-compose exec web sh

ps:
	docker-compose ps

stats:
	docker stats

