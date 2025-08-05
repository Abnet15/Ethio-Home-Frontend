import { ImageIcon, Upload, Trash2, AlertCircle, Info, CheckCircle, Server, Code, Database, BookOpen } from 'lucide-react';
import React, { useState } from 'react';

import ImageUsageExamples from '../components/ImageUsageExamples';
import PropertyImageDemo from '../components/PropertyImageDemo';
import PropertyImageManager from '../components/PropertyImageManager';
import '../styles/property-image-manager.css';

const PropertyImageTest = () => {
  const [testProperty] = useState({
    _id: 'test-property-123',
    title: 'Test Property for Image Management',
    location: 'Test Location, Addis Ababa',
    price: 2500000,
    images: [],
    imagesUrl: []
  });

  const [activeTab, setActiveTab] = useState('demo');

  return (
    <div className="property-image-test-page">
      <div className="page-header">
        <h1>Property Image Management Test</h1>
        <p>Test and demonstrate the enhanced property image system with automatic cleanup</p>
      </div>

      <div className="test-property-info">
        <h3>Test Property Information</h3>
        <p><strong>ID:</strong> {testProperty._id}</p>
        <p><strong>Title:</strong> {testProperty.title}</p>
        <p><strong>Location:</strong> {testProperty.location}</p>
        <p><strong>Price:</strong> ${testProperty.price.toLocaleString()}</p>
        <p><strong>Current Images:</strong> {testProperty.imagesUrl.length}/6</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
        >
          <ImageIcon size={16} />
          Demo
        </button>
        <button
          className={`tab-btn ${activeTab === 'manager' ? 'active' : ''}`}
          onClick={() => setActiveTab('manager')}
        >
          <Upload size={16} />
          Image Manager
        </button>
        <button
          className={`tab-btn ${activeTab === 'examples' ? 'active' : ''}`}
          onClick={() => setActiveTab('examples')}
        >
          <BookOpen size={16} />
          Usage Examples
        </button>
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <Info size={16} />
          System Info
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'demo' && (
          <div className="demo-tab">
            <PropertyImageDemo />
          </div>
        )}

        {activeTab === 'manager' && (
          <div className="manager-tab">
            <PropertyImageManager 
              property={testProperty}
              onPropertyUpdate={(updatedProperty) => {
                console.log('Property updated:', updatedProperty);
                // In a real app, you would update the state here
              }}
              isEditable={true}
            />
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="examples-tab">
            <ImageUsageExamples />
          </div>
        )}

        {activeTab === 'info' && (
          <div className="info-tab">
            <div className="system-overview">
              <h3>Enhanced Property Image System Overview</h3>
              
              <div className="feature-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <Server size={32} />
                  </div>
                  <h4>Backend Integration</h4>
                  <p>Seamlessly integrated with backend image endpoints, using the correct URL format returned by the server.</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <ImageIcon size={32} />
                  </div>
                  <h4>6-Image Limit</h4>
                  <p>Enforces maximum 6 images per property with automatic cleanup of oldest images when limit exceeded.</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <CheckCircle size={32} />
                  </div>
                  <h4>Auto-Cleanup</h4>
                  <p>Automatically removes oldest images based on timestamp when new uploads exceed the limit.</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <Code size={32} />
                  </div>
                  <h4>Smart URL Handling</h4>
                  <p>Frontend automatically uses backend-provided image URLs, ensuring correct image display.</p>
                </div>
              </div>

              <div className="technical-details">
                <h4>Technical Implementation</h4>
                <ul>
                  <li><strong>Backend URLs:</strong> Server returns complete image URLs in the correct format</li>
                  <li><strong>Frontend Handling:</strong> Uses imagesUrl array directly from backend response</li>
                  <li><strong>Fallback Support:</strong> Graceful handling when images fail to load</li>
                  <li><strong>Error Handling:</strong> Comprehensive error handling for upload, delete, and display operations</li>
                  <li><strong>Auto-Cleanup:</strong> Timestamp-based sorting ensures accurate cleanup of oldest images</li>
                  <li><strong>File Validation:</strong> Client-side validation for file types, sizes, and counts</li>
                </ul>
              </div>

              <div className="api-endpoints">
                <h4>Backend API Endpoints</h4>
                <div className="endpoint-list">
                  <div className="endpoint">
                    <code>POST /api/v1/properties/:id/upload-images</code>
                    <span>Upload property images with automatic cleanup</span>
                  </div>
                  <div className="endpoint">
                    <code>DELETE /api/v1/properties/:id/remove-image</code>
                    <span>Remove specific property image by index</span>
                  </div>
                  <div className="endpoint">
                    <code>POST /api/v1/properties/cleanup-orphaned-images</code>
                    <span>Admin-only cleanup of orphaned image files</span>
                  </div>
                </div>
              </div>

              <div className="test-notes">
                <h3>Testing Notes</h3>
                <div className="notes-content">
                  <p><strong>Demo Tab:</strong> Interactive demonstration of the 6-image limit system</p>
                  <p><strong>Image Manager Tab:</strong> Full-featured image management interface</p>
                  <p><strong>Usage Examples Tab:</strong> Code examples and best practices for using image utilities</p>
                  <p><strong>System Info Tab:</strong> Technical details and API documentation</p>
                  <p><strong>Backend Integration:</strong> All image URLs are correctly formatted and returned by the backend</p>
                  <p><strong>Auto-Cleanup:</strong> Test by uploading more than 6 images to see automatic removal</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyImageTest;
