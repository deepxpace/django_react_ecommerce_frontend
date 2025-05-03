import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils';

/**
 * A component for displaying product images with fallback support
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for image
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 * @returns {JSX.Element} - The image component
 */
const ProductImage = ({ src, alt = 'Product Image', className = '', style = {}, ...props }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  
  // Format the S3 URL for public access
  const formatS3Url = (url) => {
    if (!url) return null;
    
    // If it's already a proper URL, return it
    if (url.startsWith('http')) return url;
    
    // Handle S3 URL patterns
    if (url.includes('s3.amazonaws.com') || url.includes('amazonaws.com')) {
      // Make sure it's a proper URL
      return url.startsWith('https://') ? url : `https://${url}`;
    }
    
    // For koshimart-media bucket specifically
    if (url.includes('/media/') || 
        url.includes('product/') || 
        url.includes('category/') ||
        url.includes('gallery/')) {
      
      // Extract the media path
      let mediaPath = url;
      if (url.includes('/media/')) {
        mediaPath = url.split('/media/')[1];
      } else if (url.startsWith('/')) {
        mediaPath = url.substring(1);
      }
      
      // Construct direct S3 URL
      return `https://koshimart-media.s3.amazonaws.com/${mediaPath}`;
    }
    
    return url;
  };
  
  // Generate the correct image URL whenever the src changes
  useEffect(() => {
    if (src) {
      try {
        // Format the S3 URL directly without using proxies
        const directS3Url = formatS3Url(src);
        
        console.log(`[${alt}] Direct S3 URL:`, directS3Url);
        setImageUrl(directS3Url);
        
        // Reset states when source changes
        setError(false);
        setLoaded(false);
        setRetryCount(0);
      } catch (e) {
        console.error("Error processing image URL:", e);
        setError(true);
      }
    } else {
      setImageUrl('https://via.placeholder.com/400?text=No+Image');
    }
  }, [src, alt]);
  
  const fallbackUrl = 'https://via.placeholder.com/400?text=No+Image';
  
  const handleError = () => {
    console.warn(`[${alt}] Failed to load image: ${imageUrl}, retry count: ${retryCount}`);
    
    // Try different URLs if loading fails
    if (retryCount < 2) {
      setRetryCount(prevCount => prevCount + 1);
      
      if (retryCount === 0) {
        // First retry: Try with a different S3 URL format
        try {
          const originalUrl = src || '';
          let retryUrl;
          
          if (originalUrl.includes('/media/')) {
            // Try direct S3 object URL
            const key = originalUrl.split('/media/')[1];
            retryUrl = `https://koshimart-media.s3.amazonaws.com/${key}`;
          } else if (originalUrl.includes('s3.amazonaws.com')) {
            // Fix potential S3 URL issues
            retryUrl = originalUrl
              .replace(/^\//, 'https://')
              .replace(/([^:]\/)\/+/g, '$1');
          } else {
            // Try using a direct URL to Heroku's staticfiles
            const backendUrl = 'https://koshimart-api-6973a89b9858.herokuapp.com';
            retryUrl = `${backendUrl}/media/${originalUrl.split('/').pop()}`;
          }
          
          console.log(`[${alt}] Retry 1: Using alternative URL:`, retryUrl);
          setTimeout(() => setImageUrl(retryUrl), 800);
        } catch (e) {
          console.error(`[${alt}] Error constructing retry URL:`, e);
          setError(true);
        }
      } else {
        // Final attempt: Try the Django backend's staticfiles directory
        const filename = imageUrl.split('/').pop();
        const backendUrl = 'https://koshimart-api-6973a89b9858.herokuapp.com';
        const lastAttemptUrl = `${backendUrl}/staticfiles/media/${filename}`;
        
        console.log(`[${alt}] Retry 2: Last attempt with Django staticfiles:`, lastAttemptUrl);
        setTimeout(() => setImageUrl(lastAttemptUrl), 800);
      }
    } else {
      console.error(`[${alt}] All image loading attempts failed`);
      setError(true);
    }
  };
  
  const handleLoad = () => {
    console.log(`[${alt}] Image loaded successfully: ${imageUrl}`);
    setLoaded(true);
  };
  
  return (
    <div className={`position-relative ${className}`} style={{ ...style }}>
      {!loaded && !error && (
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light"
        >
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light"
        >
          <div className="text-center">
            <i className="fas fa-image text-muted fs-1"></i>
            <p className="small text-muted mt-2">Image not available</p>
          </div>
        </div>
      )}
      
      <img
        src={error ? fallbackUrl : imageUrl}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`${className} ${error ? 'opacity-0' : ''}`}
        style={{
          objectFit: 'contain',
          transition: 'opacity 0.3s ease',
          opacity: loaded && !error ? 1 : 0,
          ...style
        }}
        {...props}
      />
    </div>
  );
};

export default ProductImage; 