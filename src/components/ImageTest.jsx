import React from 'react';
import { 
  getUserPhotoFromResponse, 
  getPropertyImagesFromResponse, 
  getPropertyCoverImage,
  getPropertyImageCount,
  hasMultiplePropertyImages
} from '../utils/imageUtils';

const ImageTest = () => {
  // Test data based on backend response structure
  const testUser = {
    _id: '688376ec04e8e3e28e986519',
    name: 'Test User',
    photo: '688376ec04e8e3e28e986519-1756383395536.png',
    imagesUrl: 'http://127.0.0.1:5000/img/users/688376ec04e8e3e28e986519-1756383395536.png'
  };

  const testProperty = {
    _id: '68b049f2478d75ca65390a27',
    title: 'Test Property',
    images: [
      '68b049f2478d75ca65390a27-6883760104e8e3e28e986511-1756389490423.jpeg',
      '68b049f2478d75ca65390a27-6883760104e8e3e28e986511-1756389490424.jpeg'
    ],
    imagesUrl: [
      'http://127.0.0.1:5000/img/properties/68b049f2478d75ca65390a27-6883760104e8e3e28e986511-1756389490423.jpeg',
      'http://127.0.0.1:5000/img/properties/68b049f2478d75ca65390a27-6883760104e8e3e28e986511-1756389490424.jpeg'
    ]
  };

  const userPhotoUrl = getUserPhotoFromResponse(testUser);
  const propertyImages = getPropertyImagesFromResponse(testProperty);
  const coverImage = getPropertyCoverImage(testProperty);
  const imageCount = getPropertyImageCount(testProperty);
  const hasMultiple = hasMultiplePropertyImages(testProperty);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Image Utilities Test</h2>
      
      <h3>User Photo Test</h3>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>User Data:</strong></p>
        <pre>{JSON.stringify(testUser, null, 2)}</pre>
        
        <p><strong>Generated Photo URL:</strong></p>
        <p>{userPhotoUrl}</p>
        
        {userPhotoUrl && (
          <img 
            src={userPhotoUrl} 
            alt="Test User" 
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <p style={{ display: 'none', color: 'red' }}>Image failed to load</p>
        )}
      </div>

      <h3>Property Images Test</h3>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Property Data:</strong></p>
        <pre>{JSON.stringify(testProperty, null, 2)}</pre>
        
        <p><strong>Generated Image URLs:</strong></p>
        <ul>
          {propertyImages.map((url, index) => (
            <li key={index}>{url}</li>
          ))}
        </ul>
        
        <p><strong>Cover Image:</strong> {coverImage}</p>
        <p><strong>Image Count:</strong> {imageCount}</p>
        <p><strong>Has Multiple Images:</strong> {hasMultiple ? 'Yes' : 'No'}</p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {propertyImages.map((url, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <img 
                src={url} 
                alt={`Property ${index + 1}`} 
                style={{ width: '200px', height: '150px', objectFit: 'cover', border: '1px solid #ccc' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <p style={{ display: 'none', color: 'red' }}>Image {index + 1} failed to load</p>
              <p>Image {index + 1}</p>
            </div>
          ))}
        </div>
      </div>

      <h3>Backend URL Structure</h3>
      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <p><strong>User Photo URL Format:</strong></p>
        <code>http://127.0.0.1:5000/img/users/{'{userId}-{timestamp}.{extension}'}</code>
        
        <p><strong>Property Image URL Format:</strong></p>
        <code>http://127.0.0.1:5000/img/properties/{'{propertyId}-{userId}-{timestamp}.{extension}'}</code>
        
        <p><strong>Example URLs:</strong></p>
        <ul>
          <li>User: <code>http://127.0.0.1:5000/img/users/688376ec04e8e3e28e986519-1756383395536.png</code></li>
          <li>Property: <code>http://127.0.0.1:5000/img/properties/68b049f2478d75ca65390a27-6883760104e8e3e28e986511-1756389490423.jpeg</code></li>
        </ul>
      </div>
    </div>
  );
};

export default ImageTest;
