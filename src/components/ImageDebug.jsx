import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../utils/constants';
import { useParams } from 'react-router-dom';

/**
 * ImageDebug component provides visual debugging for image loading issues
 * Can be added to any page to help diagnose why images aren't loading
 */
const ImageDebug = () => {
  const { imagePath } = useParams();
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imagePath) {
      setTestResults({
        error: 'No image path provided. Use /debug/image/your-image-filename.jpg'
      });
      setIsLoading(false);
      return;
    }

    // Start testing various URL configurations
    testImageLoading();
  }, [imagePath]);

  // Extract filename from path
  const getFilename = (path) => {
    return path.split('/').pop();
  };

  // Test loading an image URL
  const testUrl = async (url, label) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({ 
        url, 
        label, 
        success: true, 
        width: img.width,
        height: img.height
      });
      img.onerror = () => resolve({ url, label, success: false });
      img.src = url;
      // Set a timeout in case the image load hangs
      setTimeout(() => resolve({ url, label, success: false, timedOut: true }), 5000);
    });
  };

  // Test all possible image paths
  const testImageLoading = async () => {
    const decodedPath = decodeURIComponent(imagePath);
    const filename = getFilename(decodedPath);
    const paths = [
      { 
        url: decodedPath.startsWith('http') ? decodedPath : `${SERVER_URL}/${decodedPath}`, 
        label: 'Original URL' 
      },
      { 
        url: `https://res.cloudinary.com/deepsimage/image/upload/products/${filename}`, 
        label: 'Direct Cloudinary with products/ prefix'
      },
      { 
        url: `https://res.cloudinary.com/deepsimage/image/upload/${filename}`, 
        label: 'Direct Cloudinary without prefix'
      },
      {
        url: `${SERVER_URL}/media-proxy/${filename}`,
        label: 'Backend Media Proxy'
      },
      {
        url: `${SERVER_URL}/media/${filename}`,
        label: 'Backend Media Redirect'
      }
    ];

    const results = await Promise.all(paths.map(path => testUrl(path.url, path.label)));
    setTestResults({
      originalPath: decodedPath,
      filename,
      results
    });
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="p-4 bg-gray-100 rounded-md">Testing image paths...</div>;
  }

  // Check if any path works
  const anySuccess = testResults.results && testResults.results.some(r => r.success);

  return (
    <div className="container mx-auto my-8 p-4">
      <h2 className="text-2xl font-bold mb-4">Image Diagnostics</h2>
      <div className="p-4 bg-gray-100 rounded-md my-4">
        {testResults.error ? (
          <div className="text-red-500">{testResults.error}</div>
        ) : (
          <>
            <div className="mb-2">
              <strong>Original path:</strong> {testResults.originalPath}
            </div>
            <div className="mb-2">
              <strong>Filename:</strong> {testResults.filename}
            </div>
            
            {anySuccess ? (
              <div className="mb-2 p-2 bg-green-100 text-green-800 rounded">
                ✅ At least one image path works! Use the working URL pattern.
              </div>
            ) : (
              <div className="mb-2 p-2 bg-red-100 text-red-800 rounded">
                ❌ None of the tested paths work. The image may not exist or there may be a permissions issue.
              </div>
            )}
            
            <div className="space-y-2">
              <h4 className="font-semibold">Test Results:</h4>
              {testResults.results && testResults.results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                >
                  <div className="flex justify-between">
                    <strong>{result.label}:</strong> 
                    <span>{result.success ? '✅ Success' : '❌ Failed'}</span>
                  </div>
                  <div className="text-xs break-all mt-1">
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {result.url}
                    </a>
                  </div>
                  {result.success && (
                    <div className="text-xs mt-1">
                      Dimensions: {result.width}×{result.height}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Solution</h3>
        <p>The ProductImage component has been updated to use direct Cloudinary URLs which will bypass the backend redirect loop that was causing image loading issues.</p>
        <p className="mt-2">If you're still experiencing issues after this fix, try:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Clearing your browser cache</li>
          <li>Making sure images are properly uploaded to Cloudinary</li>
          <li>Checking if the image filename matches what's stored in the database</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageDebug; 