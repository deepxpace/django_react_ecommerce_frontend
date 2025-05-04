#!/bin/bash
echo "Deploying API helper fix to prevent undefined product ID errors..."
git add src/utils/apiHelpers.js
git commit -m "Added safe API helpers to prevent undefined ID errors"
vercel --prod
