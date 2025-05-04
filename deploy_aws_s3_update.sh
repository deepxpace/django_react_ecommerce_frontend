#!/bin/bash

echo "Deploying frontend update for new AWS S3 bucket to Vercel..."

# Add the modified files to git
git add src/utils/imageUtils.js

# Commit the changes
git commit -m "Updated imageUtils.js to use koshimart-api S3 bucket"

# Build the project
echo "Building the project..."
yarn build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "Frontend deployment completed!"
echo ""
echo "The frontend now uses the following S3 configuration:"
echo "- New bucket name: koshimart-api"
echo "- Backward compatibility with old bucket name: koshimart-media"
echo "- Enhanced media proxy support for all URL patterns"
echo ""
echo "Remember to test image loading on various pages to ensure it's working correctly."
echo "If you see any issues, you can use the ImageDebug component for troubleshooting."
echo "" 