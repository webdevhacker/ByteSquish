#!/bin/bash

# ByteSquish VPS Deployment Script
# Usage: ./deploy.sh
# Ensure you have Node.js, npm, and PM2 installed on your VPS.

echo "==================================="
echo "🚀 Starting ByteSquish Deployment..."
echo "==================================="

# Exit immediately if a command exits with a non-zero status
set -e

# 1. Update repository (Uncomment if using Git)
# echo "📦 Pulling latest changes from Git..."
# git pull origin main

# 2. Deploy Backend
echo "⚙️  Setting up Backend..."
cd backend
echo "Installing backend dependencies..."
npm install

echo "Syncing Prisma Database & Generating Client..."
npx prisma db push
npx prisma generate

# Restart Backend with PM2
# Assuming the PM2 process is named 'bytesquish-backend'
echo "🔄 Restarting Backend with PM2..."
if pm2 show bytesquish-backend > /dev/null; then
    pm2 restart bytesquish-backend
else
    pm2 start index.js --name "bytesquish-backend"
fi
cd ..

# 3. Deploy Frontend
echo "🌐 Setting up Frontend..."
cd frontend
echo "Installing frontend dependencies..."
npm install

echo "Building frontend for production..."
npm run build

echo "✅ Frontend built successfully! (Files are in frontend/dist)"
cd ..

# Optional: If you are using Nginx to serve the frontend, uncomment the following line
# to automatically copy the build to your web server root. (Adjust paths as needed)
# echo "🚚 Copying frontend files to Nginx web root..."
# sudo cp -r frontend/dist/* /var/www/html/

echo "==================================="
echo "🎉 Deployment Complete!"
echo "==================================="
echo "Make sure Nginx is configured to serve frontend/dist and proxy /api to localhost:5000"
