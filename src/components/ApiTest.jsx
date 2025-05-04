import { useState, useEffect } from 'react';
import apiInstance from '../utils/axios';

function ApiTest() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [corsStatus, setCorsStatus] = useState(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing API with URL:', apiInstance.defaults.baseURL);
        
        // First, check if CORS preflight is working properly
        const corsResponse = await fetch(
          'https://koshimart-api-6973a89b9858.herokuapp.com/api/v1/products/', 
          { method: 'OPTIONS' }
        );
        
        const corsHeaders = {};
        corsResponse.headers.forEach((value, key) => {
          corsHeaders[key] = value;
        });
        
        setCorsStatus({
          status: corsResponse.status,
          headers: corsHeaders
        });
        
        // Now make the actual API request
        const response = await apiInstance.get('products/');
        console.log('API response:', response);
        setApiResponse(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('API test error:', error);
        setError(error.message || 'Error testing API');
        setLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <div className="container mt-5">
      <h2>API Connection Test</h2>
      <hr />
      
      <h3>CORS Preflight Check</h3>
      {!corsStatus ? (
        <p>Checking CORS headers...</p>
      ) : (
        <div>
          <p><strong>Status:</strong> {corsStatus.status}</p>
          <p><strong>Headers:</strong></p>
          <pre className="bg-light p-3 rounded">
            {JSON.stringify(corsStatus.headers, null, 2)}
          </pre>
        </div>
      )}
      
      <hr />
      
      <h3>API Request Test</h3>
      {loading && <p>Testing API connection...</p>}
      
      {error && (
        <div className="alert alert-danger">
          <h4>Error:</h4>
          <p>{error}</p>
          <div>
            <strong>Possible causes:</strong>
            <ul className="mt-2">
              <li>CORS is not properly configured on the backend</li>
              <li>The API endpoint URL is incorrect</li>
              <li>Network connectivity issues between Vercel and Heroku</li>
              <li>Backend server is not responding</li>
            </ul>
          </div>
        </div>
      )}
      
      {apiResponse && (
        <div className="alert alert-success">
          <h4>Success! Found {apiResponse.length} products</h4>
          <p>API is working correctly!</p>
          <ul className="list-group mt-3">
            {apiResponse.slice(0, 3).map(product => (
              <li key={product.id} className="list-group-item">
                <strong>{product.title}</strong> - ${product.price}
              </li>
            ))}
            {apiResponse.length > 3 && <li className="list-group-item text-muted">...and {apiResponse.length - 3} more</li>}
          </ul>
        </div>
      )}
      
      <hr />
      
      <div className="mt-4">
        <h3>Debug Information</h3>
        <p><strong>API URL:</strong> {apiInstance.defaults.baseURL}</p>
        <p><strong>Browser:</strong> {navigator.userAgent}</p>
      </div>
    </div>
  );
}

export default ApiTest; 