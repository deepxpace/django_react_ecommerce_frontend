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
  
  // Generate placeholder based on product details
  const generatePlaceholder = (productName) => {
    // Extract color if mentioned in the name
    let bgColor = 'f8f9fa';
    let textColor = '343a40';
    
    const colors = {
      'blue': {bg: '0d6efd', text: 'ffffff'},
      'black': {bg: '212529', text: 'ffffff'},
      'silver': {bg: 'adb5bd', text: '212529'},
      'red': {bg: 'dc3545', text: 'ffffff'},
      'green': {bg: '198754', text: 'ffffff'},
      'yellow': {bg: 'ffc107', text: '212529'},
      'pink': {bg: 'd63384', text: 'ffffff'},
      'purple': {bg: '6f42c1', text: 'ffffff'},
      'white': {bg: 'ffffff', text: '212529'},
      'gray': {bg: '6c757d', text: 'ffffff'},
      'orange': {bg: 'fd7e14', text: '212529'},
      'gold': {bg: 'ffd700', text: '212529'},
    };
    
    // Check if any color is in the product name
    Object.keys(colors).forEach(color => {
      if (productName.toLowerCase().includes(color)) {
        bgColor = colors[color].bg;
        textColor = colors[color].text;
      }
    });
    
    // Create short name for display
    let displayText = productName;
    if (displayText.length > 20) {
      // Get first few words only
      displayText = displayText.split(' ').slice(0, 2).join(' ');
    }
    
    // Use product category if we can detect it
    let category = 'Product';
    if (productName.toLowerCase().includes('watch')) category = 'Watch';
    if (productName.toLowerCase().includes('phone')) category = 'Phone';
    if (productName.toLowerCase().includes('scooter')) category = 'Scooter';
    if (productName.toLowerCase().includes('laptop')) category = 'Laptop';
    
    // Create placeholder URL
    return `https://placehold.co/400x400/${bgColor}/${textColor}?text=${encodeURIComponent(category)}`;
  };
  
  // Generate the correct image URL whenever the src changes
  useEffect(() => {
    if (src) {
      try {
        // Since S3 is having CORS issues, let's just use a placeholder based on the product name
        const placeholder = generatePlaceholder(alt);
        setImageUrl(placeholder);
        
        // For debug purposes, still log the original URLs
        const processedUrl = getImageUrl(src);
        console.log(`[${alt}] Original URL (not used due to CORS):`, processedUrl);
        
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
    
    // Try to load a different placeholder if even the first one fails
    if (retryCount < 1) {
      setRetryCount(prevCount => prevCount + 1);
      
      // Try a completely different placeholder service
      const backupUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random&size=200`;
      console.log(`[${alt}] Trying backup placeholder:`, backupUrl);
      setTimeout(() => setImageUrl(backupUrl), 500);
    } else {
      console.error(`[${alt}] All placeholder attempts failed`);
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