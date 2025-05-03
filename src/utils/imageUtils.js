import { SERVER_URL } from './constants';

// Debug flag - set to true to see image URL processing in console
const DEBUG_IMAGES = true;

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
    
    // For S3 URLs that might be relative paths
    if (imageUrl.includes('s3.amazonaws.com') || imageUrl.includes('amazonaws.com')) {
      // Fix potential URL formatting issues with S3
      if (!imageUrl.startsWith('https://')) {
        const fixedUrl = `https://${imageUrl.replace(/^\/+/, '')}`;
        if (DEBUG_IMAGES) console.log('Fixed S3 URL:', fixedUrl);
        return fixedUrl;
      }
      if (DEBUG_IMAGES) console.log('Using S3 URL as-is:', imageUrl);
      return imageUrl;
    }
    
    // Check if image path starts with "/media" which is common in Django
    if (imageUrl.startsWith('/media')) {
      const finalUrl = `${SERVER_URL}${imageUrl}`;
      if (DEBUG_IMAGES) console.log('Media URL combined with SERVER_URL:', finalUrl);
      return finalUrl;
    }
    
    // Otherwise, prepend the server URL, ensuring no double slashes
    const finalUrl = `${SERVER_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    if (DEBUG_IMAGES) console.log('Combined with SERVER_URL:', finalUrl);
    return finalUrl;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return 'https://via.placeholder.com/400?text=Image+Error';
  }
}; 