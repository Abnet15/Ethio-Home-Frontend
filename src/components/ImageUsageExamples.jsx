import React from 'react';
import { ImageIcon, User, Home, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  getUserPhotoFromResponse, 
  getPropertyImagesFromResponse, 
  getPropertyCoverImage,
  getPropertyImageCount,
  handleImageError,
  getFallbackImage
} from '../utils/imageUtils';

const ImageUsageExamples = () => {
  // Example data structures that match what the backend returns
  const exampleUser = {
    _id: '688376ec04e8e3e28e986519',
    name: 'John Doe',
    email: 'john@example.com',
    imagesUrl: 'http://127.0.0.1:5000/img/users/688376ec04e8e3e28e986519-1756383395536.png'
  };

  const exampleProperty = {
    _id: '68b049f2478d75ca65390a27',
    title: 'Beautiful House in Addis Ababa',
    location: 'Addis Ababa, Ethiopia',
    price: 2500000,
    imagesUrl: [
      'http://127.0.0.1:5000/img/properties/68b049f2478d75ca65390a27-6883760104e8e3e28e986511-1756389490423.jpeg',
      'http://127.0.0.1:5000/img/properties/68b049f2478d75ca65390a27-6883760104e8e3e28e986511-1756389490424.png',
      'http://127.0.0.1:5000/img/properties/68b049f2478d75ca65390a27-6883760104e8e3e28e986511-1756389490425.jpg'
    ]
  };

  const examplePropertyNoImages = {
    _id: '68b049f2478d75ca65390a28',
    title: 'Property Without Images',
    location: 'Addis Ababa, Ethiopia',
    price: 1800000,
    imagesUrl: []
  };

  // Get image data using utility functions
  const userPhoto = getUserPhotoFromResponse(exampleUser);
  const propertyImages = getPropertyImagesFromResponse(exampleProperty);
  const propertyCoverImage = getPropertyCoverImage(exampleProperty);
  const propertyImageCount = getPropertyImageCount(exampleProperty);
  const hasMultipleImages = propertyImages.length > 1;

  const propertyNoImages = getPropertyImagesFromResponse(examplePropertyNoImages);
  const propertyNoImagesCount = getPropertyImageCount(examplePropertyNoImages);

  return (
    <div className="image-usage-examples">
      <h2>Image Utility Usage Examples</h2>
      <p>This component demonstrates how to use the updated image utilities throughout the application.</p>

      {/* User Photo Example */}
      <div className="example-section">
        <h3>User Photo Handling</h3>
        <div className="example-content">
          <div className="user-photo-example">
            <h4>Example User Data:</h4>
            <pre>{JSON.stringify(exampleUser, null, 2)}</pre>
            
            <h4>Using getUserPhotoFromResponse:</h4>
            <div className="result-display">
              <p><strong>Result:</strong> {userPhoto || 'No photo available'}</p>
              {userPhoto && (
                <div className="image-preview">
                  <img 
                    src={userPhoto} 
                    alt="User photo"
                    onError={(e) => handleImageError(e, 'user')}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property Images Example */}
      <div className="example-section">
        <h3>Property Images Handling</h3>
        <div className="example-content">
          <div className="property-images-example">
            <h4>Example Property Data:</h4>
            <pre>{JSON.stringify(exampleProperty, null, 2)}</pre>
            
            <h4>Using Property Image Utilities:</h4>
            <div className="result-display">
              <p><strong>Total Images:</strong> {propertyImageCount}</p>
              <p><strong>Has Multiple Images:</strong> {hasMultipleImages ? 'Yes' : 'No'}</p>
              <p><strong>Cover Image:</strong> {propertyCoverImage || 'No cover image'}</p>
              
              <h5>All Images:</h5>
              <div className="images-grid">
                {propertyImages.map((imageUrl, index) => (
                  <div key={index} className="image-item">
                    <img 
                      src={imageUrl} 
                      alt={`Property ${index + 1}`}
                      onError={(e) => handleImageError(e, 'property')}
                      style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                    />
                    <div className="image-label">Image {index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Without Images Example */}
      <div className="example-section">
        <h3>Property Without Images</h3>
        <div className="example-content">
          <div className="property-no-images-example">
            <h4>Example Property (No Images):</h4>
            <pre>{JSON.stringify(examplePropertyNoImages, null, 2)}</pre>
            
            <h4>Using Property Image Utilities:</h4>
            <div className="result-display">
              <p><strong>Total Images:</strong> {propertyNoImagesCount}</p>
              <p><strong>Images Array:</strong> {JSON.stringify(propertyNoImages)}</p>
              
              <h5>Fallback Image:</h5>
              <div className="fallback-image">
                <img 
                  src={getFallbackImage('property')} 
                  alt="Fallback property image"
                  style={{ width: '200px', height: '150px', objectFit: 'cover' }}
                />
                <p>This is the fallback image when no property images are available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="example-section">
        <h3>Code Implementation Examples</h3>
        <div className="example-content">
          <div className="code-examples">
            <h4>1. User Profile Component</h4>
            <pre className="code-block">
{`import { getUserPhotoFromResponse, getFallbackImage } from '../utils/imageUtils';

const UserProfile = ({ user }) => {
  const userPhoto = getUserPhotoFromResponse(user);
  
  return (
    <div className="user-profile">
      <img 
        src={userPhoto || getFallbackImage('user')} 
        alt={user.name}
        onError={(e) => handleImageError(e, 'user')}
      />
      <h3>{user.name}</h3>
    </div>
  );
};`}
            </pre>

            <h4>2. Property Card Component</h4>
            <pre className="code-block">
{`import { getPropertyCoverImage, getPropertyImageCount } from '../utils/imageUtils';

const PropertyCard = ({ property }) => {
  const coverImage = getPropertyCoverImage(property);
  const imageCount = getPropertyImageCount(property);
  
  return (
    <div className="property-card">
      <img 
        src={coverImage || getFallbackImage('property')} 
        alt={property.title}
        onError={(e) => handleImageError(e, 'property')}
      />
      <h3>{property.title}</h3>
      <p>{imageCount} image{imageCount !== 1 ? 's' : ''}</p>
    </div>
  );
};`}
            </pre>

            <h4>3. Property Gallery Component</h4>
            <pre className="code-block">
{`import { getPropertyImagesFromResponse } from '../utils/imageUtils';

const PropertyGallery = ({ property }) => {
  const images = getPropertyImagesFromResponse(property);
  
  return (
    <div className="property-gallery">
      {images.length > 0 ? (
        images.map((imageUrl, index) => (
          <img 
            key={index}
            src={imageUrl} 
            alt={\`Property \${index + 1}\`}
            onError={(e) => handleImageError(e, 'property')}
          />
        ))
      ) : (
        <p>No images available</p>
      )}
    </div>
  );
};`}
            </pre>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="example-section">
        <h3>Best Practices</h3>
        <div className="example-content">
          <div className="best-practices">
            <h4>✅ Do's:</h4>
            <ul>
              <li>Always use the utility functions instead of manually constructing URLs</li>
              <li>Handle image loading errors with onError handlers</li>
              <li>Provide fallback images when no images are available</li>
              <li>Use the backend-provided imagesUrl arrays directly</li>
              <li>Validate image URLs before displaying them</li>
            </ul>

            <h4>❌ Don'ts:</h4>
            <ul>
              <li>Don't manually construct image URLs in components</li>
              <li>Don't assume images will always load successfully</li>
              <li>Don't ignore image loading errors</li>
              <li>Don't hardcode image paths or URLs</li>
              <li>Don't forget to handle cases where no images exist</li>
            </ul>

            <h4>🔧 Error Handling:</h4>
            <ul>
              <li>Always use onError handlers for img elements</li>
              <li>Provide fallback content when images fail to load</li>
              <li>Log errors for debugging purposes</li>
              <li>Show user-friendly error messages when appropriate</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUsageExamples;
