@echo off
REM Expense Tracker - Quick Start Script for Windows
REM This script helps you quickly set up and run the application with Docker

echo.
echo ================================================================================
echo   Expense Tracker - Quick Start
echo ================================================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    echo Visit: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)
echo [OK] Docker is installed

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Docker Compose is not installed.
        pause
        exit /b 1
    )
)
echo [OK] Docker Compose is installed

REM Setup environment file
if not exist .env (
    echo [INFO] Setting up environment file...
    copy .env.docker .env
    echo [OK] Created .env file from .env.docker
    echo.
    echo [WARNING] Please edit .env file and add your API keys
    echo.
    echo Required variables:
    echo   - JWT_SECRET
    echo   - OPENAI_API_KEY or GEMINI_API_KEY
    echo.
    pause
) else (
    echo [OK] .env file already exists
)

REM Build Docker images
echo.
echo [INFO] Building Docker images...
docker-compose build
if errorlevel 1 (
    echo [ERROR] Failed to build Docker images
    pause
    exit /b 1
)
echo [OK] Docker images built successfully

REM Start services
echo.
echo [INFO] Starting services...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)
echo [OK] Services started successfully

REM Wait for services
echo.
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Display success message
echo.
echo ================================================================================
echo [SUCCESS] Expense Tracker is now running!
echo ================================================================================
echo.
echo Web Application: http://localhost
echo API Server:      http://localhost:3001
echo API Health:      http://localhost:3001/health
echo.
echo Useful commands:
echo   docker-compose logs -f       - View all logs
echo   docker-compose logs -f api   - View API logs
echo   docker-compose logs -f web   - View Web logs
echo   docker-compose down          - Stop all services
echo   docker-compose restart       - Restart all services
echo.
echo ================================================================================
echo.
pause

