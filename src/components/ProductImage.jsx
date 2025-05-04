import React, { useState } from 'react';
import { SERVER_URL } from '../utils/constants';

/**
 * ProductImage component for displaying product images
 * This version uses direct Cloudinary URLs to bypass backend redirect issues
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
  
  // Get the best image URL
  const getImageUrl = (originalUrl) => {
    // Default fallback for empty URLs
    if (!originalUrl) return 'https://via.placeholder.com/400?text=No+Image';
    
    // Extract filename from the path
    const getFilename = (path) => {
      if (!path) return '';
      return path.split('/').pop();
    };
    
    const filename = getFilename(originalUrl);
    
    // If it's already a full URL like https://res.cloudinary.com, use it directly
    if (originalUrl.startsWith('http')) {
      return originalUrl;
    }
    
    // Use direct Cloudinary URL (most reliable method)
    return `https://res.cloudinary.com/deepsimage/image/upload/products/${filename}`;
  };
  
  const imageUrl = getImageUrl(src);
  
  const handleImageError = () => {
    if (imgError) return; // Prevent additional error handling
    setImgError(true);
  };
  
  // If there's an error loading the image, try alternative methods
  if (imgError) {
    // Try to get the filename
    const filename = src ? src.split('/').pop() : '';
    
    return (
      <img
        src={`${SERVER_URL}/media-proxy/${filename}`}
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={style}
        onError={(e) => {
          // If the media-proxy also fails, show a placeholder
          const img = document.createElement('img');
          img.src = 'https://via.placeholder.com/400?text=Product+Image';
          img.alt = alt;
          img.className = className;
          if (width) img.width = width;
          if (height) img.height = height;
          
          // Replace the current image with the placeholder
          if (e.target.parentNode) {
            e.target.parentNode.replaceChild(img, e.target);
          }
        }}
        {...props}
      />
    );
  }
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onError={handleImageError}
      {...props}
    />
  );
};

export default ProductImage; 