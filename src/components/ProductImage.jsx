import React, { useState } from 'react';
import { SERVER_URL } from '../utils/constants';

/**
 * ProductImage component for displaying product images
 * Uses a reliable fallback system for image loading
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
  
  // Get the image URL with fallback
  const getImageUrl = (originalUrl) => {
    if (!originalUrl) return 'https://via.placeholder.com/400?text=No+Image';
    
    // If it's already a full URL, use it directly
    if (originalUrl.startsWith('http')) {
      return originalUrl;
    }
    
    // For relative URLs, use the server URL
    return `${SERVER_URL}${originalUrl}`;
  };
  
  const imageUrl = getImageUrl(src);
  
  const handleImageError = () => {
    if (imgError) return;
    setImgError(true);
  };
  
  // If there's an error, show placeholder
  if (imgError) {
    return (
      <img
        src="https://via.placeholder.com/400?text=Product+Image"
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={style}
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