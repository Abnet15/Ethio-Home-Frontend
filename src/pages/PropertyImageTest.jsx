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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white">
        <div className="container mx-auto">
          <h1 className="text-4xl font-black mb-2">Property Image Management Test</h1>
          <p className="text-white/90 text-lg">Test and demonstrate the enhanced property image system with automatic cleanup</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-xl border shadow-lg p-6 mb-6">
          <h3 className="text-2xl font-black text-foreground mb-4">Test Property Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">ID:</span>
              <p className="font-semibold text-foreground">{testProperty._id}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Title:</span>
              <p className="font-semibold text-foreground">{testProperty.title}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Location:</span>
              <p className="font-semibold text-foreground">{testProperty.location}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Price:</span>
              <p className="font-semibold text-foreground">${testProperty.price.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Current Images:</span>
              <p className="font-semibold text-foreground">{testProperty.imagesUrl.length}/6</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'demo'
                  ? 'bg-ethiopian-green text-white border-b-2 border-ethiopian-green'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('demo')}
            >
              <ImageIcon size={16} />
              Demo
            </button>
            <button
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'manager'
                  ? 'bg-ethiopian-green text-white border-b-2 border-ethiopian-green'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('manager')}
            >
              <Upload size={16} />
              Image Manager
            </button>
            <button
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'examples'
                  ? 'bg-ethiopian-green text-white border-b-2 border-ethiopian-green'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('examples')}
            >
              <BookOpen size={16} />
              Usage Examples
            </button>
            <button
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'info'
                  ? 'bg-ethiopian-green text-white border-b-2 border-ethiopian-green'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('info')}
            >
              <Info size={16} />
              System Info
            </button>
          </div>

          <div className="p-6">
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
