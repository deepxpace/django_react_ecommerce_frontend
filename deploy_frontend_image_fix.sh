#!/bin/bash

echo "Deploying frontend image fix to Vercel..."

# Build the project
echo "Building the project..."
yarn build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "Frontend deployment completed!"
echo ""
echo "The improved imageUtils.js now handles both S3 and local media URLs properly."
echo "It will automatically route requests through the backend proxy to avoid CORS issues."
echo ""
echo "If you see any image issues in the frontend, try clearing your browser cache or use the ImageDebug component for troubleshooting."
echo "" 