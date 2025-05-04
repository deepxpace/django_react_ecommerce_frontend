import React, { useState } from 'react';
import { SERVER_URL } from '../utils/constants';

/**
 * ProductImage component that directly uses Cloudinary URLs
 * This version bypasses the backend proxy for improved performance
 */
const ProductImage = ({ 
  src, 
  alt = 'Product Image', 
  className = '', 
  width, 
  height, 
  style = {}, 
  ...props 
}) => {
  const [imgError, setImgError] = useState(false);
  
  // Function to get proper Cloudinary URL
  const getCloudinaryUrl = (originalUrl) => {
    if (!originalUrl) return 'https://via.placeholder.com/400?text=No+Image';
    
    // If already a Cloudinary URL, use it directly
    if (originalUrl.includes('res.cloudinary.com')) {
      return originalUrl;
    }
    
    // Handle media URLs by converting to direct Cloudinary links
    const cloudName = 'deepsimage'; // Your Cloudinary cloud name
    
    if (originalUrl.includes('/media/')) {
      // Extract path after /media/
      const path = originalUrl.split('/media/')[1];
      return `https://res.cloudinary.com/${cloudName}/image/upload/${path}`;
    }
    
    // Handle relative paths
    if (!originalUrl.startsWith('http')) {
      let path = originalUrl;
      // Remove leading slashes
      path = path.replace(/^\/+/, '');
      
      // If it's already in the products folder
      if (path.startsWith('products/')) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/${path}`;
      }
      
      // Otherwise, assume it should be in products folder
      return `https://res.cloudinary.com/${cloudName}/image/upload/products/${path}`;
    }
    
    // Otherwise, use the original URL as a fallback
    return originalUrl;
  };
  
  // Get Cloudinary URL
  const imageUrl = getCloudinaryUrl(src);
  
  // Handle image loading failure
  const handleImageError = (e) => {
    setImgError(true);
    // Try direct backend URL as backup
    if (!imageUrl.includes(SERVER_URL)) {
      e.target.src = `${SERVER_URL}/media/${src.split('/').pop()}`;
    } else {
      // Last resort placeholder
      e.target.src = `https://via.placeholder.com/${width || 400}x${height || 400}?text=Image+Not+Found`;
    }
  };
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={{ objectFit: 'cover', ...style }}
      onError={handleImageError}
      {...props}
    />
  );
};

export default ProductImage; 