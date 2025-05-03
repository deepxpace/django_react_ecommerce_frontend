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
      const processedUrl = getImageUrl(src);
      setImageUrl(processedUrl);
      // Reset states when source changes
      setError(false);
      setLoaded(false);
    } else {
      setImageUrl('https://via.placeholder.com/400?text=No+Image');
    }
  }, [src]);
  
  const fallbackUrl = 'https://via.placeholder.com/400?text=No+Image';
  
  const handleError = () => {
    console.warn(`Failed to load image: ${imageUrl}, retry count: ${retryCount}`);
    
    // Try to reload the image a few times before giving up
    if (retryCount < 2 && imageUrl.includes('herokuapp.com')) {
      setRetryCount(prevCount => prevCount + 1);
      
      // Force a reload of the image
      setTimeout(() => {
        setImageUrl(`${imageUrl}?retry=${retryCount + 1}`);
      }, 1000);
    } else {
      setError(true);
    }
  };
  
  const handleLoad = () => {
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