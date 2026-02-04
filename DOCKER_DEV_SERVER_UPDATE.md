# Docker Development Server Update

## Summary

Updated the expense-tracker-web Docker configuration to run as a **Vite development server** instead of serving static files with Nginx.

## Changes Made

### 1. expense-tracker-web/Dockerfile

**Before:** Multi-stage build with Nginx serving static files
**After:** Single-stage build running Vite dev server

Key changes:
- Removed Nginx stage
- Removed build step (`npm run build`)
- Changed CMD to run `npm run dev` with `--host 0.0.0.0`
- Changed exposed port from 80 to 5173
- Updated health check to use port 5173

### 2. docker-compose.yml

**Web Service Updates:**
- Changed port mapping from `80:80` to `5173:5173`
- Added volume mounts for hot-reload:
  - `./expense-tracker-web:/app` - Source code sync
  - `/app/node_modules` - Preserve node_modules in container
- Added environment variable `VITE_API_URL=http://localhost:3001/api`
- Updated health check to use port 5173

**API Service Updates:**
- Changed `CORS_ORIGIN` from `http://localhost:80` to `http://localhost:5173`

### 3. expense-tracker-api/Dockerfile

**Memory Fix:**
- Added `ENV NODE_OPTIONS="--max-old-space-size=4096"` to fix TypeScript build memory issues

## Benefits

✅ **Hot Module Replacement (HMR)** - Changes to source code are reflected immediately
✅ **Faster Development** - No need to rebuild for every change
✅ **Source Maps** - Better debugging experience
✅ **Volume Mounting** - Code changes on host sync to container
✅ **Development Features** - Full Vite dev server capabilities

## Usage

### Start the development environment:

```bash
docker-compose up -d
```

### Access the application:

- **Frontend (Vite Dev Server):** http://localhost:5173
- **Backend API:** http://localhost:3001
- **MongoDB:** localhost:27017

### View logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f api
```

### Stop the environment:

```bash
docker-compose down
```

## Development Workflow

1. Make changes to your code in `expense-tracker-web/src/`
2. Changes are automatically synced to the container
3. Vite dev server detects changes and hot-reloads the browser
4. No need to rebuild or restart containers

## Notes

- The web service now runs on port **5173** (Vite default) instead of port 80
- Source code is mounted as a volume, so changes are reflected immediately
- `node_modules` is preserved in the container to avoid conflicts with host
- The API CORS is configured to allow requests from `http://localhost:5173`

## Production Deployment

For production, you would want to:
1. Create a separate `Dockerfile.prod` with Nginx and static build
2. Use `docker-compose.prod.yml` for production configuration
3. Build optimized static assets with `npm run build`
4. Serve with Nginx for better performance

The existing `docker-compose.prod.yml` file can be updated similarly if needed for production use.

