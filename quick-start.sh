#!/bin/bash

# Expense Tracker - Quick Start Script
# This script helps you quickly set up and run the application with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Setup environment file
setup_env() {
    if [ ! -f .env ]; then
        print_info "Setting up environment file..."
        cp .env.docker .env
        print_success "Created .env file from .env.docker"
        print_warning "Please edit .env file and add your API keys before continuing"
        echo ""
        echo "Required variables:"
        echo "  - JWT_SECRET (generate with: openssl rand -base64 32)"
        echo "  - OPENAI_API_KEY or GEMINI_API_KEY"
        echo ""
        read -p "Press Enter after you've updated the .env file..."
    else
        print_success ".env file already exists"
    fi
}

# Validate environment file
validate_env() {
    print_info "Validating environment configuration..."
    
    if ! grep -q "JWT_SECRET=your-super-secret" .env; then
        print_success "JWT_SECRET is configured"
    else
        print_warning "JWT_SECRET is still using default value"
        print_info "Generating a random JWT_SECRET..."
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
        print_success "Generated and set JWT_SECRET"
    fi
    
    if grep -q "OPENAI_API_KEY=your-openai-api-key-here" .env && grep -q "GEMINI_API_KEY=your-gemini-api-key-here" .env; then
        print_warning "No AI API key configured. AI features will not work."
        print_info "Please add either OPENAI_API_KEY or GEMINI_API_KEY to .env"
    fi
}

# Build Docker images
build_images() {
    print_info "Building Docker images..."
    docker-compose build
    print_success "Docker images built successfully"
}

# Start services
start_services() {
    print_info "Starting services..."
    docker-compose up -d
    print_success "Services started successfully"
}

# Wait for services to be healthy
wait_for_services() {
    print_info "Waiting for services to be healthy..."
    
    # Wait for MongoDB
    print_info "Waiting for MongoDB..."
    sleep 5
    
    # Wait for API
    print_info "Waiting for API..."
    for i in {1..30}; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            print_success "API is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "API failed to start"
            docker-compose logs api
            exit 1
        fi
        sleep 2
    done
    
    # Wait for Web
    print_info "Waiting for Web application..."
    for i in {1..30}; do
        if curl -s http://localhost/health > /dev/null 2>&1; then
            print_success "Web application is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Web application failed to start"
            docker-compose logs web
            exit 1
        fi
        sleep 2
    done
}

# Display success message
show_success() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_success "Expense Tracker is now running!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Web Application: http://localhost"
    echo "🔌 API Server:      http://localhost:3001"
    echo "📊 API Health:      http://localhost:3001/health"
    echo ""
    echo "Useful commands:"
    echo "  make logs       - View all logs"
    echo "  make logs-api   - View API logs"
    echo "  make logs-web   - View Web logs"
    echo "  make down       - Stop all services"
    echo "  make restart    - Restart all services"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Main execution
main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  💰 Expense Tracker - Quick Start"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    check_docker
    check_docker_compose
    setup_env
    validate_env
    build_images
    start_services
    wait_for_services
    show_success
}

# Run main function
main

