import { SERVER_URL } from './constants';

/**
 * Formats image URLs to ensure they work in both development and production
 * @param {string} imageUrl - The image URL from the API
 * @returns {string} - The properly formatted URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already an absolute URL (starts with http or https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Otherwise, prepend the server URL
  return `${SERVER_URL}${imageUrl}`;
}; 