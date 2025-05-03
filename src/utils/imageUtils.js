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
    
    // Direct S3 URL formatting for koshimart-media bucket
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
      
      // Construct direct S3 URL
      const s3Url = `https://koshimart-media.s3.amazonaws.com/${mediaPath}`;
      if (DEBUG_IMAGES) console.log('Created direct S3 URL:', s3Url);
      return s3Url;
    }
    
    // For any other relative paths, try the server URL
    const backendUrl = SERVER_URL;
    if (imageUrl.startsWith('/')) {
      const fullUrl = `${backendUrl}${imageUrl}`;
      if (DEBUG_IMAGES) console.log('Combined with SERVER_URL:', fullUrl);
      return fullUrl;
    }
    
    // Try to guess if it's a media file and build an S3 URL
    if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg') || 
        imageUrl.endsWith('.png') || imageUrl.endsWith('.gif') ||
        imageUrl.endsWith('.webp')) {
      const s3Url = `https://koshimart-media.s3.amazonaws.com/${imageUrl}`;
      if (DEBUG_IMAGES) console.log('Constructed S3 URL for media file:', s3Url);
      return s3Url;
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