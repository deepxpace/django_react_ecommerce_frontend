import React from 'react';
import { getProxyImageUrl, getPlaceholderImage, handleImageError } from '../utils/imageUtils';

/**
 * ProductImage component for displaying product images with error handling
 * Automatically handles S3 URLs and CORS issues
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - CSS class name
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height
 * @param {Object} props.style - Additional inline styles
 * @returns {JSX.Element} - Image component
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
  // Get the proxied URL to avoid CORS issues
  const imageUrl = getProxyImageUrl(src);
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={{ objectFit: 'cover', ...style }}
      onError={(e) => handleImageError(e, alt)}
      {...props}
    />
  );
};

export default ProductImage; 