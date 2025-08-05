import React, { useState, useEffect } from 'react';
import { 
  diagnoseUserPhoto, 
  diagnosePropertyImages, 
  diagnoseImageUrl
} from '../utils/imageUtils';
import { SERVER_BASE_URL } from '../config/api';

const ImageDiagnostic = ({ user, property }) => {
  const [userDiagnostic, setUserDiagnostic] = useState(null);
  const [propertyDiagnostic, setPropertyDiagnostic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (user) {
      runUserDiagnostic();
    }
  }, [user]);

  useEffect(() => {
    if (property) {
      runPropertyDiagnostic();
    }
  }, [property]);

  const runUserDiagnostic = async () => {
    setLoading(true);
    try {
      const result = await diagnoseUserPhoto(user);
      setUserDiagnostic(result);
      console.log('User Photo Diagnostic:', result);
    } catch (error) {
      console.error('User diagnostic error:', error);
      setUserDiagnostic({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runPropertyDiagnostic = async () => {
    setLoading(true);
    try {
      const result = await diagnosePropertyImages(property);
      setPropertyDiagnostic(result);
      console.log('Property Images Diagnostic:', result);
    } catch (error) {
      console.error('Property diagnostic error:', error);
      setPropertyDiagnostic({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCustomUrl = async () => {
    if (!testUrl) return;
    
    setLoading(true);
    try {
      const result = await diagnoseImageUrl(testUrl);
      setTestResult(result);
      console.log('Custom URL Test Result:', result);
    } catch (error) {
      console.error('Custom URL test error:', error);
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderDiagnosticResult = (result, title) => {
    if (!result) return null;

    return (
      <div className="diagnostic-section">
        <h3>{title}</h3>
        
        {result.error && (
          <div className="error-message">
            <strong>Error:</strong> {result.error}
          </div>
        )}

        {result.issues && result.issues.length > 0 && (
          <div className="issues-section">
            <h4>Issues Found:</h4>
            <ul>
              {result.issues.map((issue, index) => (
                <li key={index} className="issue-item">{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {result.suggestions && result.suggestions.length > 0 && (
          <div className="suggestions-section">
            <h4>Suggestions:</h4>
            <ul>
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="suggestion-item">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {result.photoSources && result.photoSources.length > 0 && (
          <div className="sources-section">
            <h4>Photo Sources Found:</h4>
            <ul>
              {result.photoSources.map((source, index) => (
                <li key={index}>
                  <strong>{source.type}:</strong> {source.value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.imageSources && result.imageSources.length > 0 && (
          <div className="sources-section">
            <h4>Image Sources Found:</h4>
            <ul>
              {result.imageSources.map((source, index) => (
                <li key={index}>
                  <strong>{source.type}:</strong> {source.value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.workingUrl && (
          <div className="success-message">
            <h4>✅ Working URL Found:</h4>
            <p>{result.workingUrl}</p>
            <img 
              src={result.workingUrl} 
              alt="Test" 
              style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ccc' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <p style={{ display: 'none', color: 'red' }}>Image failed to load</p>
          </div>
        )}

        {result.workingUrls && result.workingUrls.length > 0 && (
          <div className="success-message">
            <h4>✅ Working URLs Found:</h4>
            <ul>
              {result.workingUrls.map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="image-diagnostic" style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0' }}>
      <h2>Image Loading Diagnostic Tool</h2>
      
      <div className="server-info">
        <h3>Server Configuration</h3>
        <p><strong>Server Base URL:</strong> {SERVER_BASE_URL}</p>
        <p><strong>Expected User Photo Path:</strong> {SERVER_BASE_URL}/img/users/</p>
        <p><strong>Expected Property Image Path:</strong> {SERVER_BASE_URL}/img/properties/</p>
      </div>

      <div className="test-url-section">
        <h3>Test Custom URL</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter image URL to test"
            style={{ flex: 1, padding: '8px' }}
          />
          <button 
            onClick={testCustomUrl}
            disabled={loading || !testUrl}
            style={{ padding: '8px 16px' }}
          >
            {loading ? 'Testing...' : 'Test URL'}
          </button>
        </div>
        {testResult && renderDiagnosticResult(testResult, 'Custom URL Test Result')}
      </div>

      {user && (
        <div className="user-diagnostic">
          <h3>User Photo Diagnostic</h3>
          <button onClick={runUserDiagnostic} disabled={loading}>
            {loading ? 'Running...' : 'Run User Diagnostic'}
          </button>
          {renderDiagnosticResult(userDiagnostic, 'User Photo Analysis')}
        </div>
      )}

      {property && (
        <div className="property-diagnostic">
          <h3>Property Images Diagnostic</h3>
          <button onClick={runPropertyDiagnostic} disabled={loading}>
            {loading ? 'Running...' : 'Run Property Diagnostic'}
          </button>
          {renderDiagnosticResult(propertyDiagnostic, 'Property Images Analysis')}
        </div>
      )}

      <div className="backend-checklist">
        <h3>Backend Checklist</h3>
        <ul>
          <li>✅ Backend server is running on {SERVER_BASE_URL}</li>
          <li>❓ Static file serving is configured</li>
          <li>❓ CORS is properly configured for image requests</li>
          <li>❓ Image upload directory exists and has correct permissions</li>
          <li>❓ Image files are actually saved to the server</li>
        </ul>
      </div>

      <div className="common-solutions">
        <h3>Common Solutions</h3>
        <div className="solution-item">
          <h4>For Node.js/Express:</h4>
          <pre>{`// Serve static files
app.use('/img/users', express.static(path.join(__dirname, 'uploads/users')));
app.use('/img/properties', express.static(path.join(__dirname, 'uploads/properties')));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));`}</pre>
        </div>

        <div className="solution-item">
          <h4>For Python/Flask:</h4>
          <pre>{`# Serve static files
@app.route('/img/users/<filename>')
def serve_user_image(filename):
    return send_from_directory('uploads/users', filename)

@app.route('/img/properties/<filename>')
def serve_property_image(filename):
    return send_from_directory('uploads/properties', filename)

# CORS configuration
CORS(app, 
     origins=['http://localhost:3000'],
     methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'],
     supports_credentials=True)`}</pre>
        </div>
      </div>
    </div>
  );
};

export default ImageDiagnostic;
