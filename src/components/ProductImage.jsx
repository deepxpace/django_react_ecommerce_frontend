import React, { useState } from 'react';
import { SERVER_URL } from '../utils/constants';

/**
 * ProductImage component that handles image loading with proper fallbacks
 * Fixed to directly use the media-proxy endpoint which works correctly
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
  
  // Extract filename from path
  const getFilename = (imagePath) => {
    if (!imagePath) return null;
    // Handle both full URLs and relative paths
    return imagePath.split('/').pop();
  };
  
  // Function to get proper image URL
  const getProperImageUrl = (originalSrc) => {
    // Default placeholder for empty sources
    if (!originalSrc) return 'https://via.placeholder.com/400?text=No+Image';
    
    // If it's already a full URL (not relative), use it directly
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }
    
    // Get the filename to use with media-proxy
    const filename = getFilename(originalSrc);
    if (!filename) return 'https://via.placeholder.com/400?text=No+Image';
    
    // Use the backend's media-proxy endpoint which works reliably
    return `${SERVER_URL}/media-proxy/${filename}`;
  };
  
  // Get the primary image URL
  const imageUrl = getProperImageUrl(src);
  
  // Handle image loading errors with fallbacks
  const handleImageError = (e) => {
    if (imgError) return; // Prevent infinite fallback loops
    setImgError(true);
    
    try {
      const filename = getFilename(src);
      if (!filename) {
        e.target.src = `https://via.placeholder.com/${width || 400}x${height || 400}?text=Image+Not+Found`;
        return;
      }
      
      // First fallback: Try direct Cloudinary URL
      const cloudName = 'deepsimage';
      e.target.src = `https://res.cloudinary.com/${cloudName}/image/upload/products/${filename}`;
      
      // Set up fallback chain
      e.target.onload = null; // Clear any existing handlers
      e.target.onerror = () => {
        // Second fallback: Try regular media endpoint
        e.target.src = `${SERVER_URL}/media/${filename}`;
        e.target.onerror = () => {
          // Final fallback: Use placeholder
          e.target.src = `https://via.placeholder.com/${width || 400}x${height || 400}?text=Image+Not+Found`;
          e.target.onerror = null; // End the chain
        };
      };
    } catch (err) {
      console.error('Image fallback error:', err);
      // If all else fails, use a placeholder
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