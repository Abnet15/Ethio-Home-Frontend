import React, { useState } from 'react';
import { ImageIcon, Upload, Trash2, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { getFallbackImage } from '../utils/imageUtils';
import '../styles/property-image-manager.css';

const PropertyImageDemo = () => {
  const [demoProperty] = useState({
    _id: 'demo-property-123',
    title: 'Demo Property',
    location: 'Demo Location',
    images: [],
    imagesUrl: []
  });

  const [imageCount, setImageCount] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const addImage = () => {
    if (imageCount < 6) {
      setImageCount(prev => prev + 1);
    }
  };

  const removeImage = () => {
    if (imageCount > 0) {
      setImageCount(prev => prev - 1);
    }
  };

  const resetImages = () => {
    setImageCount(0);
  };

  // Generate demo image URLs to show the backend format
  const generateDemoImageUrl = (index) => {
    const timestamp = Date.now() + index * 1000; // Different timestamp for each image
    return `http://127.0.0.1:5000/img/properties/demo-property-123-demo-user-${timestamp}.jpeg`;
  };

  return (
    <div className="property-image-demo">
      <div className="demo-header">
        <h2>Property Image Management Demo</h2>
        <p>This demo shows how the enhanced property image system works with automatic cleanup</p>
      </div>

      <div className="demo-controls">
        <div className="control-group">
          <label>Current Images: {imageCount}/6</label>
          <div className="control-buttons">
            <button 
              onClick={addImage} 
              disabled={imageCount >= 6}
              className="btn btn-primary"
            >
              <Upload size={16} />
              Add Image
            </button>
            <button 
              onClick={removeImage} 
              disabled={imageCount <= 0}
              className="btn btn-secondary"
            >
              <Trash2 size={16} />
              Remove Image
            </button>
            <button 
              onClick={resetImages} 
              className="btn btn-outline"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="demo-info">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="info-toggle"
          >
            <Info size={16} />
            {showInfo ? 'Hide' : 'Show'} System Info
          </button>
          
          {showInfo && (
            <div className="system-info">
              <h4>System Features:</h4>
              <ul>
                <li>✅ Maximum 6 images per property</li>
                <li>✅ Automatic cleanup of oldest images when limit exceeded</li>
                <li>✅ Timestamp-based sorting for accurate cleanup</li>
                <li>✅ File naming: {`{propertyId}-{userId}-{timestamp}.{extension}`}</li>
                <li>✅ Support for JPG, PNG, GIF formats</li>
                <li>✅ 5MB file size limit per image</li>
                <li>✅ Ownership verification and role-based access</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="demo-visualization">
        <div className="image-slots">
          {Array.from({ length: 6 }, (_, index) => (
            <div 
              key={index} 
              className={`image-slot ${index < imageCount ? 'filled' : 'empty'}`}
            >
              {index < imageCount ? (
                <div className="demo-image">
                  <ImageIcon size={24} />
                  <span>Image {index + 1}</span>
                </div>
              ) : (
                <div className="empty-slot">
                  <ImageIcon size={20} />
                  <span>Empty</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="demo-status">
          {imageCount === 0 && (
            <div className="status-message info">
              <Info size={16} />
              <span>No images uploaded. You can upload up to 6 images.</span>
            </div>
          )}
          
          {imageCount > 0 && imageCount < 6 && (
            <div className="status-message success">
              <ImageIcon size={16} />
              <span>{imageCount} image(s) uploaded. You can add {6 - imageCount} more.</span>
            </div>
          )}
          
          {imageCount === 6 && (
            <div className="status-message warning">
              <AlertCircle size={16} />
              <span>Maximum 6 images reached. Adding more will automatically remove the oldest images.</span>
            </div>
          )}
        </div>
      </div>

      <div className="demo-scenarios">
        <h3>Demo Scenarios</h3>
        
        <div className="scenario">
          <h4>Scenario 1: Normal Upload</h4>
          <p>Upload images one by one until you reach 6. Each upload will work normally.</p>
        </div>
        
        <div className="scenario">
          <h4>Scenario 2: Auto-Cleanup</h4>
          <p>When you have 6 images and try to add more, the system will automatically remove the oldest images to maintain the limit.</p>
        </div>
        
        <div className="scenario">
          <h4>Scenario 3: Timestamp Ordering</h4>
          <p>The system uses timestamps in filenames to determine which images are oldest and should be removed first.</p>
        </div>
      </div>

      <div className="demo-code">
        <h3>Backend Implementation</h3>
        <div className="code-block">
          <pre>
{`// Enhanced upload logic with auto-cleanup
if (totalImagesAfterUpload > 6) {
  const imagesToRemove = totalImagesAfterUpload - 6;
  
  // Sort by timestamp and remove oldest
  const sortedImages = property.images
    .map(filename => {
      const parts = filename.split('-');
      const timestamp = parseInt(parts[2].split('.')[0]);
      return { filename, timestamp };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
  
  // Remove oldest images
  for (let i = 0; i < imagesToRemove; i++) {
    removePropertyImageFile(sortedImages[i].filename, propertyId);
  }
  
  // Keep newest images
  property.images = sortedImages
    .slice(imagesToRemove)
    .map(img => img.filename);
}`}
          </pre>
        </div>
      </div>

      <div className="demo-code">
        <h3>Frontend Image URL Handling</h3>
        <div className="code-block">
          <pre>
{`// Backend returns imagesUrl array with full URLs
const property = {
  _id: '68b049f2478d75ca65390a27',
  imagesUrl: [
    'http://127.0.0.1:5000/img/properties/68b049f2478d75ca65390a27-6883760104e8e3e28e986511-1756389490423.jpeg',
    'http://127.0.0.1:5000/img/properties/68b049f2478d75ca65390a27-6883760104e8e3e28e986511-1756389490424.png'
  ]
};

// Frontend uses imagesUrl directly
const images = getPropertyImagesFromResponse(property);
// Returns: ['http://127.0.0.1:5000/img/properties/...', ...]

// For user photos
const user = {
  _id: '688376ec04e8e3e28e986519',
  imagesUrl: 'http://127.0.0.1:5000/img/users/688376ec04e8e3e28e986519-1756383395536.png'
};

const userPhoto = getUserPhotoFromResponse(user);
// Returns: 'http://127.0.0.1:5000/img/users/...'`}
          </pre>
        </div>
      </div>

      <div className="demo-code">
        <h3>Image URL Examples</h3>
        <div className="code-block">
          <pre>
{`// Property Image URLs (from backend)
Property: 68b049f2478d75ca65390a27
User: 6883760104e8e3e28e986511
Timestamp: 1756389490423
Extension: jpeg

Result: http://127.0.0.1:5000/img/properties/68b049f2478d75ca65390a27-6883760104e8e3e28e986511-1756389490423.jpeg

// User Photo URLs (from backend)
User: 688376ec04e8e3e28e986519
Timestamp: 1756383395536
Extension: png

Result: http://127.0.0.1:5000/img/users/688376ec04e8e3e28e986519-1756383395536.png`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PropertyImageDemo;
