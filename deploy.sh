#!/bin/bash

# Stop execution on error
set -e

echo "🚀 Starting Deployment..."

# 1. Pull latest code
echo "📥 Pulling latest changes from Git..."
git pull origin main

# 2. Stop existing containers
echo "🛑 Stopping services..."
docker-compose down

# 3. Rebuild and Start containers (Detached)
echo "🏗️ Building and Starting services..."
docker-compose up -d --build

# 4. Cleanup unused images (Optional, saves space)
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment Complete! Tycoon Game is updated."
