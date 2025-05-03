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
        const processedUrl = getImageUrl(src);
        console.log(`[${alt}] Processed URL:`, processedUrl);
        setImageUrl(processedUrl);
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
    if (retryCount < 3) {
      setRetryCount(prevCount => prevCount + 1);
      
      // Try a different approach with each retry
      if (retryCount === 0 && imageUrl.includes('/media/')) {
        // First retry: Try with direct media URL
        const newUrl = imageUrl.replace('/media/', '/staticfiles/media/');
        console.log(`[${alt}] Retry 1: Trying staticfiles path: ${newUrl}`);
        setTimeout(() => setImageUrl(newUrl), 800);
      } else if (retryCount === 1) {
        // Second retry: Try with cache-busting parameter
        const cacheBuster = `?t=${new Date().getTime()}`;
        console.log(`[${alt}] Retry 2: Adding cache buster: ${imageUrl}${cacheBuster}`);
        setTimeout(() => setImageUrl(`${imageUrl}${cacheBuster}`), 800);
      } else {
        // Last retry: Try with different approach based on URL
        if (imageUrl.includes('herokuapp.com')) {
          // If it's a Heroku URL, try a different path construction
          const parts = imageUrl.split('/');
          const filename = parts[parts.length - 1];
          const newUrl = `${parts.slice(0, 3).join('/')}/staticfiles/media/${filename}`;
          console.log(`[${alt}] Retry 3: Reconstructed URL: ${newUrl}`);
          setTimeout(() => setImageUrl(newUrl), 800);
        } else {
          console.log(`[${alt}] Retry 3: Final attempt with original URL`);
          setTimeout(() => setImageUrl(`${imageUrl}?retry=final`), 800);
        }
      }
    } else {
      console.error(`[${alt}] All retries failed for image: ${imageUrl}`);
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