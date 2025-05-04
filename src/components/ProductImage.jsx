import React, { useState } from 'react';
import { SERVER_URL } from '../utils/constants';

/**
 * ProductImage component that handles various image sources and provides fallbacks
 * This implementation fixes the image loading issues by using the backend's media-proxy
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
  
  // Get the image filename from the path
  const getImageFilename = (path) => {
    if (!path) return null;
    return path.split('/').pop();
  };
  
  // Get the best image URL 
  const getImageUrl = (originalUrl) => {
    if (!originalUrl) return 'https://via.placeholder.com/400?text=No+Image';
    
    // If it's already a complete URL with a protocol, use it directly
    if (originalUrl.startsWith('http')) {
      return originalUrl;
    }
    
    // Get the filename from the path
    const filename = getImageFilename(originalUrl);
    
    // Use the media-proxy endpoint which successfully translates to the correct storage location
    return `${SERVER_URL}/media-proxy/${filename}`;
  };
  
  // Get the URL for the image
  const imageUrl = getImageUrl(src);
  
  // Handle image loading failure with fallbacks
  const handleImageError = (e) => {
    if (imgError) return; // Prevent infinite fallback loops
    setImgError(true);
    
    try {
      // Try direct backend URL as a different endpoint
      const filename = getImageFilename(src);
      
      // Try Cloudinary direct as first fallback
      if (filename) {
        const cloudName = 'deepsimage';
        e.target.src = `https://res.cloudinary.com/${cloudName}/image/upload/products/${filename}`;
        
        // Set a one-time error handler for this fallback attempt
        const cloudinaryFallbackHandler = () => {
          // If Cloudinary fails, try another backend endpoint
          e.target.src = `${SERVER_URL}/media/${filename}`;
          
          // Set a final fallback to placeholder
          e.target.onerror = () => {
            e.target.src = `https://via.placeholder.com/${width || 400}x${height || 400}?text=Image+Not+Found`;
            e.target.onerror = null; // Prevent further error handling
          };
          
          // Remove this handler
          e.target.removeEventListener('error', cloudinaryFallbackHandler);
        };
        
        // Add the one-time error handler
        e.target.addEventListener('error', cloudinaryFallbackHandler, { once: true });
        return;
      }
    } catch (err) {
      console.error("Image fallback error:", err);
    }
    
    // Final fallback if all else fails
    e.target.src = `https://via.placeholder.com/${width || 400}x${height || 400}?text=Image+Not+Found`;
    e.target.onerror = null; // Prevent further error handling
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