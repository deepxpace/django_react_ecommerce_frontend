import { useState, useEffect } from 'react';
import { SERVER_URL } from '../utils/constants';

/**
 * A debugging component to test various image URL formats
 * This helps identify which URL pattern works with the backend
 */
const ImageDebug = ({ originalSrc }) => {
  const [urlVariations, setUrlVariations] = useState([]);
  const [loadStatus, setLoadStatus] = useState({});
  
  useEffect(() => {
    if (!originalSrc) return;
    
    // Generate different URL variations to test
    const variations = [];
    
    // 1. Original URL
    variations.push({
      name: 'Original',
      url: originalSrc
    });
    
    // 2. Original with server URL prepended
    if (!originalSrc.startsWith('http')) {
      const withServer = `${SERVER_URL}${originalSrc.startsWith('/') ? '' : '/'}${originalSrc}`;
      variations.push({
        name: 'With Server URL',
        url: withServer
      });
    }
    
    // 3. Media path variations
    if (originalSrc.includes('/media/') || 
        originalSrc.includes('product/') || 
        originalSrc.includes('category/')) {
      
      // Extract filename
      const parts = originalSrc.split('/');
      const filename = parts[parts.length - 1];
      
      // Various media path patterns
      variations.push({
        name: 'Direct Media Path',
        url: `${SERVER_URL}/media/${filename}`
      });
      
      variations.push({
        name: 'Staticfiles Media Path',
        url: `${SERVER_URL}/staticfiles/media/${filename}`
      });
      
      variations.push({
        name: 'Static Media Path',
        url: `${SERVER_URL}/static/media/${filename}`
      });
    }
    
    // 4. AWS S3 variations if applicable
    if (originalSrc.includes('amazonaws.com') || originalSrc.includes('s3.')) {
      const s3UrlFixed = originalSrc.replace(/^\//, 'https://');
      variations.push({
        name: 'S3 Direct',
        url: s3UrlFixed
      });
    }
    
    setUrlVariations(variations);
    
    // Initialize load status
    const initialStatus = {};
    variations.forEach(v => {
      initialStatus[v.name] = 'loading';
    });
    setLoadStatus(initialStatus);
  }, [originalSrc]);
  
  const handleImageLoad = (name) => {
    setLoadStatus(prev => ({
      ...prev,
      [name]: 'success'
    }));
  };
  
  const handleImageError = (name) => {
    setLoadStatus(prev => ({
      ...prev,
      [name]: 'failed'
    }));
  };
  
  return (
    <div className="image-debug border p-3 my-3 rounded">
      <h5>Image URL Debugging</h5>
      <p className="small text-muted">Original source: {originalSrc}</p>
      
      <div className="row">
        {urlVariations.map((variation, index) => (
          <div key={index} className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-header bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span>{variation.name}</span>
                  <span className={`badge ${
                    loadStatus[variation.name] === 'success' ? 'bg-success' : 
                    loadStatus[variation.name] === 'failed' ? 'bg-danger' : 'bg-warning'
                  }`}>
                    {loadStatus[variation.name] === 'success' ? 'Loaded' : 
                     loadStatus[variation.name] === 'failed' ? 'Failed' : 'Loading'}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <div className="mb-2" style={{ height: '150px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={variation.url}
                    alt={`${variation.name} variant`}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    onLoad={() => handleImageLoad(variation.name)}
                    onError={() => handleImageError(variation.name)}
                  />
                </div>
                <div className="small text-muted mt-2" style={{ wordBreak: 'break-all' }}>
                  {variation.url}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 alert alert-info">
        <strong>Instructions:</strong> Look for the variation with a green "Loaded" badge. 
        That URL pattern should be used in your ProductImage component.
      </div>
    </div>
  );
};

export default ImageDebug; 