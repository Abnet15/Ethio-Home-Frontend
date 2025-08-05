import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getPropertyImagesFromResponse, 
  getPropertyImageCount, 
  hasMultiplePropertyImages,
  handleImageError,
  getFallbackImage
} from '../utils/imageUtils';
import propertyService from '../services/propertyService';
import '../styles/property-image-manager.css';

const PropertyImageManager = ({ property, onPropertyUpdate, isEditable = true }) => {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const fileInputRef = useRef(null);

  // Get property images using the utility functions
  const images = getPropertyImagesFromResponse(property);
  const imageCount = getPropertyImageCount(property);
  const hasMultipleImages = hasMultiplePropertyImages(property);
  const maxImages = 6;
  const remainingSlots = maxImages - imageCount;

  // Check if user can edit this property
  const canEdit = isEditable && (
    user?.role === 'admin' || 
    user?.role === 'employee' || 
    (user?._id === property?.owner?._id || user?._id === property?.owner)
  );

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file count
    if (files.length > remainingSlots) {
      showMessage(`You can only upload up to ${remainingSlots} more images. Maximum 6 total.`, 'error');
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} (not an image)`);
      } else if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (too large, max 5MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      showMessage(`Invalid files: ${invalidFiles.join(', ')}`, 'error');
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      
      // Create previews
      const previews = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImagePreviews(previews);
    }
  };

  const removeSelectedFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showMessage('Please select files to upload', 'error');
      return;
    }

    setUploadLoading(true);
    setMessage('');

    try {
      const result = await propertyService.uploadPropertyImages(property._id, selectedFiles);
      
      if (result.success) {
        let messageText = 'Images uploaded successfully!';
        
        // Check if any old images were automatically removed
        if (result.data?.imagesRemoved && result.data.imagesRemoved > 0) {
          messageText = `Images uploaded successfully! ${result.data.imagesRemoved} oldest image(s) were automatically removed to maintain the 6-image limit.`;
        }
        
        showMessage(messageText, 'success');
        setSelectedFiles([]);
        setImagePreviews([]);
        
        // Update parent component
        if (onPropertyUpdate && result.data?.property) {
          onPropertyUpdate(result.data.property);
        }
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        showMessage(result.error || 'Failed to upload images', 'error');
      }
    } catch (error) {
      showMessage('An error occurred while uploading images', 'error');
      console.error('Upload error:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemoveImage = async (imageIndex) => {
    if (!window.confirm('Are you sure you want to remove this image?')) {
      return;
    }

    setRemoveLoading(true);
    setMessage('');

    try {
      const result = await propertyService.removePropertyImage(property._id, imageIndex);
      
      if (result.success) {
        showMessage('Image removed successfully!', 'success');
        
        // Update parent component
        if (onPropertyUpdate && result.data?.property) {
          onPropertyUpdate(result.data.property);
        }
      } else {
        showMessage(result.error || 'Failed to remove image', 'error');
      }
    } catch (error) {
      showMessage('An error occurred while removing image', 'error');
      console.error('Remove error:', error);
    } finally {
      setRemoveLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageLoadError = (event, imageUrl) => {
    console.warn(`Property image failed to load: ${imageUrl}`);
    handleImageError(event, 'property');
  };

  return (
    <div className="property-image-manager">
      {/* Header */}
      <div className="image-manager-header">
        <h3>
          <ImageIcon size={20} />
          Property Images ({imageCount}/{maxImages})
        </h3>
        {canEdit && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={remainingSlots === 0}
          >
            <Upload size={16} />
            Add Images
          </button>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message ${messageType}`}>
          <AlertCircle size={16} />
          {message}
        </div>
      )}

      {/* Current Images */}
      <div className="current-images-section">
        <h4>Current Images</h4>
        {images.length > 0 ? (
          <div className="images-grid">
            {images.map((imageUrl, index) => (
              <div key={index} className="image-item">
                <img 
                  src={imageUrl} 
                  alt={`Property ${index + 1}`}
                  onError={(e) => handleImageLoadError(e, imageUrl)}
                />
                <div className="image-error" style={{ display: 'none' }}>
                  <ImageIcon size={24} />
                  <span>Image failed to load</span>
                </div>
                
                {canEdit && (
                  <button
                    className="remove-image-btn"
                    onClick={() => handleRemoveImage(index)}
                    disabled={removeLoading}
                    title="Remove image"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                <div className="image-index">{index + 1}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-images">
            <ImageIcon size={48} />
            <p>No images uploaded yet</p>
          </div>
        )}
      </div>

      {/* Upload Section */}
      {canEdit && (
        <div className="upload-section">
          <h4>Upload New Images</h4>
          
          {remainingSlots > 0 ? (
            <>
              <div className="upload-info">
                <p>You can upload up to {remainingSlots} more images</p>
                <p>Supported formats: JPG, PNG, GIF (max 5MB each)</p>
                {remainingSlots < 6 && (
                  <p className="auto-cleanup-info">
                    <AlertCircle size={16} />
                    <strong>Auto-cleanup:</strong> If you exceed 6 images, the oldest ones will be automatically removed to maintain the limit.
                  </p>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  <h5>Selected Files ({selectedFiles.length})</h5>
                  <div className="file-previews">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="file-preview">
                        <img src={preview.preview} alt={`Preview ${index + 1}`} />
                        <button
                          className="remove-file-btn"
                          onClick={() => removeSelectedFile(index)}
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                        <div className="file-name">{preview.file.name}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="upload-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleUpload}
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? 'Uploading...' : 'Upload Images'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={clearSelection}
                      disabled={uploadLoading}
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="max-images-reached">
              <AlertCircle size={24} />
              <p>Maximum number of images (6) reached. Remove some images to upload new ones.</p>
              <p className="auto-cleanup-info">
                <strong>Note:</strong> When you upload new images, the oldest ones will be automatically removed to maintain the 6-image limit.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image Guidelines */}
      <div className="image-guidelines">
        <h4>Image Guidelines</h4>
        <ul>
          <li>Maximum 6 images per property</li>
          <li>Supported formats: JPG, PNG, GIF</li>
          <li>Maximum file size: 5MB per image</li>
          <li>First image becomes the cover image</li>
          <li>High-quality, well-lit images recommended</li>
          <li><strong>Auto-cleanup:</strong> Oldest images are automatically removed when limit is exceeded</li>
        </ul>
      </div>
    </div>
  );
};

export default PropertyImageManager;
