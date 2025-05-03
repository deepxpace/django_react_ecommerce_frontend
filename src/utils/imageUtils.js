import { SERVER_URL } from './constants';

// Debug flag - set to true to see image URL processing in console
const DEBUG_IMAGES = true;

// S3 bucket name and region
const S3_BUCKET_NAME = 'koshimart-api';
const S3_REGION = 'eu-north-1';
const S3_PREFIX = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/`;

/**
 * Formats image URLs to ensure they work in both development and production
 * @param {string} imageUrl - The image URL from the API
 * @returns {string} - The properly formatted URL
 */
export const getImageUrl = (imageUrl) => {
  // Return a fallback image if no image URL is provided
  if (!imageUrl) {
    if (DEBUG_IMAGES) console.log('Empty image URL, using fallback');
    return 'https://via.placeholder.com/400?text=No+Image';
  }
  
  if (DEBUG_IMAGES) console.log('Original image URL:', imageUrl);
  
  try {
    // If it's already an absolute URL (starts with http or https), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      if (DEBUG_IMAGES) console.log('Using absolute URL as-is:', imageUrl);
      return imageUrl;
    }
    
    // Direct S3 URL formatting for koshimart-api bucket
    if (imageUrl.includes('s3.amazonaws.com') || imageUrl.includes('amazonaws.com')) {
      // Make sure it has the https:// prefix
      if (!imageUrl.startsWith('https://')) {
        const fixedUrl = `https://${imageUrl.replace(/^\/+/, '')}`;
        if (DEBUG_IMAGES) console.log('Fixed S3 URL:', fixedUrl);
        return fixedUrl;
      }
      
      if (DEBUG_IMAGES) console.log('Using S3 URL as-is:', imageUrl);
      return imageUrl;
    }
    
    // Handle Django media paths
    if (imageUrl.includes('/media/') || 
        imageUrl.includes('product/') || 
        imageUrl.includes('category/') ||
        imageUrl.includes('gallery/')) {
      
      // Extract the media path
      let mediaPath = imageUrl;
      if (imageUrl.includes('/media/')) {
        mediaPath = imageUrl.split('/media/')[1];
      } else if (imageUrl.startsWith('/')) {
        mediaPath = imageUrl.substring(1);
      }
      
      // Try the backend proxy URL first
      const proxyUrl = `${SERVER_URL}/media-proxy/${mediaPath}`;
      if (DEBUG_IMAGES) console.log('Using backend proxy URL:', proxyUrl);
      return proxyUrl;
    }
    
    // For any other relative paths, try the server URL
    const backendUrl = SERVER_URL;
    if (imageUrl.startsWith('/')) {
      const fullUrl = `${backendUrl}${imageUrl}`;
      if (DEBUG_IMAGES) console.log('Combined with SERVER_URL:', fullUrl);
      return fullUrl;
    }
    
    // Try to guess if it's a media file and build a proxy URL
    if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg') || 
        imageUrl.endsWith('.png') || imageUrl.endsWith('.gif') ||
        imageUrl.endsWith('.webp')) {
      const proxyUrl = `${SERVER_URL}/media-proxy/${imageUrl}`;
      if (DEBUG_IMAGES) console.log('Constructed proxy URL for media file:', proxyUrl);
      return proxyUrl;
    }
    
    // Last resort: prepend the server URL
    const finalUrl = `${backendUrl}/${imageUrl}`;
    if (DEBUG_IMAGES) console.log('Last resort URL with SERVER_URL:', finalUrl);
    return finalUrl;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return 'https://via.placeholder.com/400?text=Image+Error';
  }
};

/**
 * Utility functions for handling image URLs
 */

/**
 * Converts S3 URLs to proxy URLs to avoid CORS issues.
 * Also handles local media URLs from Django.
 * @param {string} originalUrl - The original URL (S3 or local)
 * @returns {string} - The proxied URL
 */
export const getProxyImageUrl = (originalUrl) => {
  if (!originalUrl) return ''; // Handle empty URLs
  
  // Already a local Django media URL
  if (originalUrl.startsWith('/media/')) {
    return `${SERVER_URL}${originalUrl}`;
  }
  
  // Already a full Django media URL
  if (originalUrl.startsWith(`${SERVER_URL}/media/`)) {
    return originalUrl;
  }
  
  // Already a media-proxy URL
  if (originalUrl.includes('/media-proxy/')) {
    return originalUrl;
  }
  
  // Extract the path after the S3 domain (with region)
  if (originalUrl.startsWith(S3_PREFIX)) {
    const path = originalUrl.substring(S3_PREFIX.length);
    return `${SERVER_URL}/media-proxy/${path}`;
  }
  
  // Handle old bucket name references or URLs without region
  const oldS3Prefix = 'https://koshimart-media.s3.amazonaws.com/';
  if (originalUrl.startsWith(oldS3Prefix)) {
    const path = originalUrl.substring(oldS3Prefix.length);
    return `${SERVER_URL}/media-proxy/${path}`;
  }
  
  const noRegionPrefix = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/`;
  if (originalUrl.startsWith(noRegionPrefix)) {
    const path = originalUrl.substring(noRegionPrefix.length);
    return `${SERVER_URL}/media-proxy/${path}`;
  }
  
  // If it's a relative path (without http or https prefix)
  if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
    // If it's a path that looks like a media file
    if (originalUrl.includes('/products/') || 
        originalUrl.includes('/image/') || 
        originalUrl.includes('/category/')) {
      return `${SERVER_URL}/media-proxy/${originalUrl.replace(/^\/+/, '')}`;
    }
    // Otherwise, just make it a relative path from the server
    return `${SERVER_URL}/media/${originalUrl.replace(/^\/+/, '')}`;
  }
  
  return originalUrl; // Return original if not S3 or local media
};

/**
 * Creates a placeholder image URL based on the product name
 * @param {string} productName - The name of the product
 * @param {number} width - Width of the placeholder image
 * @param {number} height - Height of the placeholder image 
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = (productName, width = 300, height = 300) => {
  if (!productName) return `https://placehold.co/${width}x${height}/EEE/999?text=No+Image`;
  
  // Create a placeholder with the first letter of the product name
  const initial = productName.charAt(0).toUpperCase();
  return `https://placehold.co/${width}x${height}/EEE/999?text=${initial}`;
};

/**
 * Handles image loading errors by replacing with placeholder
 * @param {Event} event - The error event
 */
export const handleImageError = (event, productName) => {
  event.target.src = getPlaceholderImage(productName);
  event.target.alt = productName || 'Product image';
  event.onerror = null; // Prevent infinite loop
}; 