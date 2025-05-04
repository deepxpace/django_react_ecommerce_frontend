import React, { useState } from 'react';
import { SERVER_URL } from '../utils/constants';

/**
 * ProductImage component for displaying product images
 * This version uses the media-proxy endpoint which directly serves images
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
    const getFilename = (path) => path.split('/').pop();
    const filename = getFilename(originalUrl);
    
    // If it's already a full URL like https://res.cloudinary.com, use it directly
    if (originalUrl.startsWith('http')) {
      return originalUrl;
    }
    
    // Primary method: use media-proxy endpoint (this works reliably)
    return `${SERVER_URL}/media-proxy/${filename}`;
  };
  
  const imageUrl = getImageUrl(src);
  
  const handleImageError = () => {
    // If the image fails to load, set the error state
    if (!imgError) {
      setImgError(true);
    }
  };
  
  // If there's an error loading the image, show a placeholder
  if (imgError) {
    return (
      <div 
        className={`${className} bg-gray-200 flex items-center justify-center`}
        style={{ width: width || 250, height: height || 250, ...style }}
        {...props}
      >
        <div className="text-gray-500 text-xs text-center p-2">
          Image Not Available
        </div>
      </div>
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