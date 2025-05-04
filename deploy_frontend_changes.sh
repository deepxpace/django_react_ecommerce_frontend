#!/bin/bash

echo "Committing frontend changes for the S3 media proxy..."

# Add the files to git
git add src/utils/imageUtils.js src/components/ProductImage.jsx src/components/ImageDebug.jsx

# Commit the changes
git commit -m "Added backend proxy solution for S3 images to fix CORS issues"

# Push to your repository (assuming your main branch is named 'main')
git push origin main

echo "Frontend changes committed and pushed!"
echo ""
echo "IMPORTANT: Deploy your frontend to Vercel for changes to take effect."
echo "Your images should now load correctly without CORS issues." 