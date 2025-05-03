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
  
  // Generate the correct image URL whenever the src changes
  useEffect(() => {
    if (src) {
      try {
        // Get the processed URL from our utility
        const processedUrl = getImageUrl(src);
        console.log(`[${alt}] Original processed URL:`, processedUrl);
        
        // If it's an S3 URL, use an image proxy to bypass CORS
        if (processedUrl.includes('s3.amazonaws.com')) {
          // Use a CORS proxy service for Amazon S3 images
          const encodedUrl = encodeURIComponent(processedUrl);
          // Using imgproxy.net as a CORS proxy (up to 100MB per day for free)
          const proxyUrl = `https://imgproxy.netlify.app/api/image?url=${encodedUrl}`;
          console.log(`[${alt}] Using proxy URL:`, proxyUrl);
          setImageUrl(proxyUrl);
        } else {
          setImageUrl(processedUrl);
        }
        
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
    
    // Try to reload the image a few times before giving up
    if (retryCount < 2) {
      setRetryCount(prevCount => prevCount + 1);
      
      // Try different approaches
      if (retryCount === 0 && imageUrl.includes('s3.amazonaws.com')) {
        // First retry: Try a different proxy for S3 images
        const originalUrl = imageUrl.includes('imgproxy.netlify.app') 
          ? decodeURIComponent(imageUrl.split('url=')[1]) 
          : imageUrl;
        
        // Try a different proxy service
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&n=-1`;
        console.log(`[${alt}] Retry 1: Using alternative proxy:`, proxyUrl);
        setTimeout(() => setImageUrl(proxyUrl), 800);
      } else {
        // Add a cache buster
        const cacheBuster = `?t=${new Date().getTime()}`;
        console.log(`[${alt}] Retry ${retryCount+1}: Adding cache buster`);
        setTimeout(() => setImageUrl(prev => `${prev}${prev.includes('?') ? '&' : '?'}cb=${Date.now()}`), 800);
      }
    } else {
      console.error(`[${alt}] All retries failed for image`);
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
        crossOrigin="anonymous"
        {...props}
      />
    </div>
  );
};

export default ProductImage; 