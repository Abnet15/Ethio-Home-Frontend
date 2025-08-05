import { SERVER_BASE_URL } from '../config/api';
import { useState, useEffect } from 'react';

/**
 * Utility functions for handling images (users and properties)
 */

// ===== USER PHOTO UTILITIES =====

/**
 * Get the full URL for a user's profile photo
 * @param {string} photoFilename - The photo filename from user.photo
 * @returns {string} The complete URL to access the photo
 */
export const getUserPhotoUrl = (photoFilename) => {
  if (!photoFilename || photoFilename === 'default.png') {
    return null;
  }
  console.log(photoFilename)
  // If it's already a full URL, return as is
  if (photoFilename.startsWith('http://') || photoFilename.startsWith('https://')) {
    return photoFilename;
  }
  
  const photoUrl = `${SERVER_BASE_URL}/img/users/${photoFilename}`;
  console.log('Photo filename:', photoFilename);
  console.log('Server base URL:', SERVER_BASE_URL);
  console.log('Generated photo URL:', photoUrl);
  return photoUrl;
};

/**
 * Check if a user has a valid profile photo
 * @param {string} photoFilename - The photo filename from user.photo
 * @returns {boolean} True if user has a valid photo
 */
export const hasUserPhoto = (photoFilename) => {
  return photoFilename && photoFilename !== 'default.png';
};

/**
 * Get a default avatar icon if no photo is available
 * @param {string} photoFilename - The photo filename from user.photo
 * @returns {string|null} The photo URL or null if no photo
 */
export const getUserPhotoOrDefault = (photoFilename) => {
  if (!photoFilename || photoFilename === 'default.png') {
    return `${SERVER_BASE_URL}/img/users/default.png`;
  }
  return getUserPhotoUrl(photoFilename);
};

/**
 * Get user photo URL from backend response (handles both photo and imagesUrl fields)
 * @param {Object} user - User object from backend
 * @returns {string|null} The photo URL or null if no photo
 */
export const getUserPhotoFromResponse = (user) => {
  if (!user) return null;
  
  // Backend returns imagesUrl for single user queries
  if (user.imagesUrl) {
    // If imagesUrl is an array, take the first one
    if (Array.isArray(user.imagesUrl)) {
      const firstImage = user.imagesUrl[0];
      if (firstImage && firstImage !== 'default.png') {
        // If it's already a full URL, return as is
        if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
          return firstImage;
        }
        // Otherwise, construct the full URL
        return `${SERVER_BASE_URL}/img/users/${firstImage}`;
      }
    }
    // If it's a string, return it directly
    if (typeof user.imagesUrl === 'string' && user.imagesUrl !== 'default.png') {
      if (user.imagesUrl.startsWith('http://') || user.imagesUrl.startsWith('https://')) {
        return user.imagesUrl;
      }
      return `${SERVER_BASE_URL}/img/users/${user.imagesUrl}`;
    }
  }
  
  // Fallback to photo field
  if (user.photo && user.photo !== 'default.png') {
    return getUserPhotoUrl(user.photo);
  }
  
  return null;
};

/**
 * Comprehensive diagnostic function for image loading issues
 * @param {string} imageUrl - The image URL to test
 * @param {string} type - Type of image ('user' or 'property')
 * @returns {Promise<Object>} Diagnostic results
 */
export const diagnoseImageUrl = async (imageUrl, type = 'property') => {
  const results = {
    url: imageUrl,
    type,
    accessible: false,
    status: null,
    error: null,
    suggestions: []
  };

  if (!imageUrl) {
    results.error = 'No URL provided';
    results.suggestions.push('Check if the image data is being returned from the backend');
    return results;
  }

  try {
    // Test if the URL is accessible
    const response = await fetch(imageUrl, { method: 'HEAD' });
    results.status = response.status;
    results.accessible = response.ok;

    if (!response.ok) {
      results.error = `HTTP ${response.status}: ${response.statusText}`;
      
      if (response.status === 404) {
        results.suggestions.push('Image file not found on server');
        results.suggestions.push('Check if the file path is correct');
        results.suggestions.push('Verify the backend is serving static files from the correct directory');
      } else if (response.status === 403) {
        results.suggestions.push('Access forbidden - check file permissions');
      } else if (response.status === 500) {
        results.suggestions.push('Server error - check backend logs');
      }
    }
  } catch (error) {
    results.error = error.message;
    results.suggestions.push('Network error - check if backend server is running');
    results.suggestions.push('Check CORS configuration on backend');
    results.suggestions.push('Verify the image URL is correct');
  }

  return results;
};

/**
 * Test multiple possible image URL patterns
 * @param {string} filename - The image filename
 * @param {string} type - Type of image ('user' or 'property')
 * @returns {Promise<Array>} Array of test results for different URL patterns
 */
export const testImageUrlPatterns = async (filename, type = 'property') => {
  if (!filename) return [];

  const baseUrl = SERVER_BASE_URL;
  const patterns = [
    `${baseUrl}/img/${type}s/${filename}`,
    `${baseUrl}/uploads/${type}s/${filename}`,
    `${baseUrl}/static/${type}s/${filename}`,
    `${baseUrl}/public/${type}s/${filename}`,
    `${baseUrl}/images/${type}s/${filename}`,
    `${baseUrl}/assets/${type}s/${filename}`,
    `${baseUrl}/media/${type}s/${filename}`,
    `${baseUrl}/${type}s/${filename}`,
    `${baseUrl}/img/${filename}`,
    `${baseUrl}/uploads/${filename}`,
    `${baseUrl}/static/${filename}`,
    `${baseUrl}/public/${filename}`,
    `${baseUrl}/images/${filename}`,
    `${baseUrl}/assets/${filename}`,
    `${baseUrl}/media/${filename}`
  ];

  const results = [];
  
  for (const pattern of patterns) {
    const result = await diagnoseImageUrl(pattern, type);
    results.push(result);
    
    // If we find a working URL, we can stop testing
    if (result.accessible) {
      console.log(`✅ Found working ${type} image URL:`, pattern);
      break;
    }
  }

  return results;
};

/**
 * Comprehensive diagnostic for user photo issues
 * @param {Object} user - User object from backend
 * @returns {Promise<Object>} Diagnostic results
 */
export const diagnoseUserPhoto = async (user) => {
  const results = {
    user: user ? { id: user._id, name: user.name } : null,
    hasPhoto: false,
    photoSources: [],
    workingUrl: null,
    issues: [],
    suggestions: []
  };

  if (!user) {
    results.issues.push('No user object provided');
    return results;
  }

  // Check what photo data is available
  if (user.photo && user.photo !== 'default.png') {
    results.photoSources.push({ type: 'photo', value: user.photo });
    results.hasPhoto = true;
  }

  if (user.imagesUrl) {
    if (Array.isArray(user.imagesUrl)) {
      user.imagesUrl.forEach((img, index) => {
        if (img && img !== 'default.png') {
          results.photoSources.push({ type: 'imagesUrl[array]', index, value: img });
          results.hasPhoto = true;
        }
      });
    } else if (typeof user.imagesUrl === 'string' && user.imagesUrl !== 'default.png') {
      results.photoSources.push({ type: 'imagesUrl[string]', value: user.imagesUrl });
      results.hasPhoto = true;
    }
  }

  if (!results.hasPhoto) {
    results.issues.push('No valid photo data found in user object');
    results.suggestions.push('Check if user has uploaded a photo');
    results.suggestions.push('Verify backend is returning photo data correctly');
    return results;
  }

  // Test each photo source
  for (const source of results.photoSources) {
    const filename = source.value;
    
    // If it's already a full URL, test it directly
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      const result = await diagnoseImageUrl(filename, 'user');
      if (result.accessible) {
        results.workingUrl = filename;
        break;
      }
    } else {
      // Test different URL patterns
      const patternResults = await testImageUrlPatterns(filename, 'user');
      const workingResult = patternResults.find(r => r.accessible);
      
      if (workingResult) {
        results.workingUrl = workingResult.url;
        break;
      }
    }
  }

  if (!results.workingUrl) {
    results.issues.push('No working image URL found');
    results.suggestions.push('Check backend static file serving configuration');
    results.suggestions.push('Verify image files exist in the correct directory');
    results.suggestions.push('Check file permissions on the server');
  }

  return results;
};

/**
 * Try different URL patterns for user photos
 * @param {string} filename - The photo filename
 * @returns {Array} Array of possible URLs to try
 */
export const getPossibleUserPhotoUrls = (filename) => {
  if (!filename || filename === 'default.png') return [];
  
  const urls = [];
  
  // If it's already a full URL, return it
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    urls.push(filename);
    return urls;
  }
  
  // Try different URL patterns
  urls.push(`${SERVER_BASE_URL}/img/users/${filename}`);
  urls.push(`${SERVER_BASE_URL}/uploads/users/${filename}`);
  urls.push(`${SERVER_BASE_URL}/static/users/${filename}`);
  urls.push(`${SERVER_BASE_URL}/public/users/${filename}`);
  urls.push(`${SERVER_BASE_URL}/images/users/${filename}`);
  
  return urls;
};

/**
 * React hook for user photo loading with fallbacks
 * @param {Object} user - User object from backend
 * @returns {Object} { photoUrl, isLoading, error }
 */
export const useUserPhoto = (user) => {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserPhoto = async () => {
      if (!user) {
        setPhotoUrl(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get all possible photo sources
        const possibleSources = [];
        
        // Add imagesUrl array
        if (user.imagesUrl && Array.isArray(user.imagesUrl)) {
          user.imagesUrl.forEach(img => {
            if (img && img !== 'default.png') {
              possibleSources.push(...getPossibleUserPhotoUrls(img));
            }
          });
        }
        
        // Add imagesUrl string
        if (user.imagesUrl && typeof user.imagesUrl === 'string' && user.imagesUrl !== 'default.png') {
          possibleSources.push(...getPossibleUserPhotoUrls(user.imagesUrl));
        }
        
        // Add photo field
        if (user.photo && user.photo !== 'default.png') {
          possibleSources.push(...getPossibleUserPhotoUrls(user.photo));
        }
        
        // Remove duplicates
        const uniqueSources = [...new Set(possibleSources)];
        
        // Test each URL until one works
        for (const url of uniqueSources) {
          if (await testImageUrl(url)) {
            console.log('Found working user photo URL:', url);
            setPhotoUrl(url);
            setIsLoading(false);
            return;
          }
        }
        
        // No working URL found
        setPhotoUrl(null);
        setError('No working photo URL found');
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPhoto();
  }, [user]);

  return { photoUrl, isLoading, error };
};

/**
 * Check if user has a valid profile photo
 * @param {Object} user - User object from backend
 * @returns {boolean} True if user has a valid photo
 */
export const hasValidUserPhoto = (user) => {
  if (!user) return false;
  
  // Check if user has a photo that's not default
  if (user.photo && user.photo !== 'default.png') {
    return true;
  }
  
  // Check if user has imagesUrl
  if (user.imagesUrl) {
    if (Array.isArray(user.imagesUrl)) {
      return user.imagesUrl.length > 0 && user.imagesUrl[0] !== 'default.png';
    }
    return user.imagesUrl && user.imagesUrl !== 'default.png';
  }
  
  return false;
};

// ===== PROPERTY IMAGE UTILITIES =====

/**
 * Get the full URL for a property image
 * @param {string} imageFilename - The image filename from property.images array
 * @returns {string} The complete URL to access the image
 */
export const getPropertyImageUrl = (imageFilename) => {
  if (!imageFilename) {
    return null;
  }
  
  // If it's already a full URL, return as is
  if (imageFilename.startsWith('http://') || imageFilename.startsWith('https://')) {
    return imageFilename;
  }
  
  const imageUrl = `${SERVER_BASE_URL}/img/properties/${imageFilename}`;
  return imageUrl;
};

/**
 * Get property images URLs from backend response (handles both images and imagesUrl fields)
 * @param {Object} property - Property object from backend
 * @returns {Array} Array of image URLs
 */
export const getPropertyImagesFromResponse = (property) => {
  // Backend returns imagesUrl array for property queries - use this directly
  if (property.imagesUrl && Array.isArray(property.imagesUrl)) {
    return property.imagesUrl.filter(url => url && url.trim() !== '');
  }
  
  // Fallback to images field (for backward compatibility)
  if (property.images && Array.isArray(property.images)) {
    return property.images
      .filter(img => img && img.trim() !== '')
      .map(img => getPropertyImageUrl(img));
  }
  
  // Single image fallback
  if (property.image) {
    const imageUrl = getPropertyImageUrl(property.image);
    return imageUrl ? [imageUrl] : [];
  }
  
  return [];
};

/**
 * Get the first/cover image for a property
 * @param {Object} property - Property object from backend
 * @returns {string|null} The cover image URL or null if no images
 */
export const getPropertyCoverImage = (property) => {
  const images = getPropertyImagesFromResponse(property);
  return images.length > 0 ? images[0] : null;
};

/**
 * Check if a property has multiple images
 * @param {Object} property - Property object from backend
 * @returns {boolean} True if property has multiple images
 */
export const hasMultiplePropertyImages = (property) => {
  const images = getPropertyImagesFromResponse(property);
  return images.length > 1;
};

/**
 * Get the total number of images for a property
 * @param {Object} property - Property object from backend
 * @returns {number} The number of images
 */
export const getPropertyImageCount = (property) => {
  const images = getPropertyImagesFromResponse(property);
  return images.length;
};

/**
 * Comprehensive diagnostic for property image issues
 * @param {Object} property - Property object from backend
 * @returns {Promise<Object>} Diagnostic results
 */
export const diagnosePropertyImages = async (property) => {
  const results = {
    property: property ? { id: property._id, title: property.title } : null,
    hasImages: false,
    imageSources: [],
    workingUrls: [],
    issues: [],
    suggestions: []
  };

  if (!property) {
    results.issues.push('No property object provided');
    return results;
  }

  // Check what image data is available
  if (property.imagesUrl && Array.isArray(property.imagesUrl)) {
    property.imagesUrl.forEach((img, index) => {
      if (img && img.trim() !== '') {
        results.imageSources.push({ type: 'imagesUrl[array]', index, value: img });
        results.hasImages = true;
      }
    });
  }

  if (property.images && Array.isArray(property.images)) {
    property.images.forEach((img, index) => {
      if (img && img.trim() !== '') {
        results.imageSources.push({ type: 'images[array]', index, value: img });
        results.hasImages = true;
      }
    });
  }

  if (property.image && property.image.trim() !== '') {
    results.imageSources.push({ type: 'image', value: property.image });
    results.hasImages = true;
  }

  if (!results.hasImages) {
    results.issues.push('No valid image data found in property object');
    results.suggestions.push('Check if property has uploaded images');
    results.suggestions.push('Verify backend is returning image data correctly');
    return results;
  }

  // Test each image source
  for (const source of results.imageSources) {
    const filename = source.value;
    
    // If it's already a full URL, test it directly
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      const result = await diagnoseImageUrl(filename, 'property');
      if (result.accessible) {
        results.workingUrls.push(filename);
      }
    } else {
      // Test different URL patterns
      const patternResults = await testImageUrlPatterns(filename, 'property');
      const workingResult = patternResults.find(r => r.accessible);
      
      if (workingResult) {
        results.workingUrls.push(workingResult.url);
      }
    }
  }

  if (results.workingUrls.length === 0) {
    results.issues.push('No working image URLs found');
    results.suggestions.push('Check backend static file serving configuration');
    results.suggestions.push('Verify image files exist in the correct directory');
    results.suggestions.push('Check file permissions on the server');
  }

  return results;
};

// ===== GENERAL IMAGE UTILITIES =====

/**
 * Check if an image URL is valid
 * @param {string} imageUrl - The image URL to validate
 * @returns {boolean} True if the URL is valid
 */
export const isValidImageUrl = (imageUrl) => {
  if (!imageUrl) return false;
  
  // Check if it's a valid URL
  try {
    new URL(imageUrl);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get a fallback image URL when no image is available
 * @param {string} type - Type of fallback ('user' or 'property')
 * @returns {string} The fallback image URL
 */
export const getFallbackImage = (type = 'property') => {
  if (type === 'user') {
    return `${SERVER_BASE_URL}/img/users/default.png`;
  }
  
  // Return a placeholder image for properties
  return 'https://via.placeholder.com/600x400?text=No+Image+Available';
};

/**
 * Preload an image to check if it exists
 * @param {string} imageUrl - The image URL to preload
 * @returns {Promise<boolean>} True if image loads successfully
 */
export const preloadImage = (imageUrl) => {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
};

/**
 * Get optimized image URL with size parameters (if supported by backend)
 * @param {string} imageUrl - The original image URL
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @returns {string} The optimized image URL
 */
export const getOptimizedImageUrl = (imageUrl, width = 800, height = 600) => {
  if (!imageUrl) return null;
  
  // For now, return the original URL since backend doesn't support image optimization
  // This can be extended when backend supports image resizing
  return imageUrl;
};

/**
 * Handle image loading errors and provide fallback
 * @param {Event} event - The error event from img onError
 * @param {string} fallbackType - Type of fallback ('user' or 'property')
 * @param {Function} onError - Callback function when image fails to load
 */
export const handleImageError = (event, fallbackType = 'property', onError = null) => {
  const img = event.target;
  
  // Hide the failed image
  img.style.display = 'none';
  
  // Show fallback content if available
  const fallbackElement = img.nextElementSibling;
  if (fallbackElement && fallbackElement.classList.contains('image-error')) {
    fallbackElement.style.display = 'flex';
  }
  
  // Call error callback if provided
  if (onError && typeof onError === 'function') {
    onError(img.src, fallbackType);
  }
  
  console.warn(`Image failed to load: ${img.src}`);
};

/**
 * Handle user photo loading errors specifically
 * @param {Event} event - The error event from img onError
 * @param {Function} onError - Callback function when photo fails to load
 */
export const handleUserPhotoError = (event, onError = null) => {
  const img = event.target;
  
  // Hide the failed image
  img.style.display = 'none';
  
  // Show fallback icon if available
  const fallbackIcon = img.nextElementSibling;
  if (fallbackIcon && fallbackIcon.tagName === 'svg') {
    fallbackIcon.style.display = 'inline';
  }
  
  // Call error callback if provided
  if (onError && typeof onError === 'function') {
    onError(img.src);
  }
  
  console.warn(`User photo failed to load: ${img.src}`);
};

/**
 * Create a safe image element with error handling
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {Object} props - Additional props for the img element
 * @param {string} fallbackType - Type of fallback ('user' or 'property')
 * @returns {Object} Object with img element and error handling
 */
export const createSafeImage = (src, alt, props = {}, fallbackType = 'property') => {
  const imgProps = {
    src,
    alt,
    onError: (e) => handleImageError(e, fallbackType),
    ...props
  };
  
  return {
    imgProps,
    handleImageError: (e) => handleImageError(e, fallbackType)
  };
};
