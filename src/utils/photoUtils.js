import { 
  getUserPhotoUrl as getUserPhotoUrlNew,
  getUserPhotoOrDefault as getUserPhotoOrDefaultNew,
  hasUserPhoto as hasUserPhotoNew,
  getUserPhotoFromResponse as getUserPhotoFromResponseNew
} from './imageUtils';

/**
 * Utility functions for handling user photos
 * @deprecated Use imageUtils.js instead for new code
 */

/**
 * Get the full URL for a user's profile photo
 * @param {string} photoFilename - The photo filename from user.photo
 * @returns {string} The complete URL to access the photo
 * @deprecated Use getUserPhotoUrl from imageUtils.js instead
 */
export const getUserPhotoUrl = (photoFilename) => {
  return getUserPhotoUrlNew(photoFilename);
};

/**
 * Check if a user has a valid profile photo
 * @param {string} photoFilename - The photo filename from user.photo
 * @returns {boolean} True if user has a valid photo
 * @deprecated Use hasUserPhoto from imageUtils.js instead
 */
export const hasUserPhoto = (photoFilename) => {
  return hasUserPhotoNew(photoFilename);
};

/**
 * Get a default avatar icon if no photo is available
 * @param {string} photoFilename - The photo filename from user.photo
 * @returns {string|null} The photo URL or null if no photo
 * @deprecated Use getUserPhotoOrDefault from imageUtils.js instead
 */
export const getUserPhotoOrDefault = (photoFilename) => {
  return getUserPhotoOrDefaultNew(photoFilename);
};

/**
 * Get user photo URL from backend response (handles both photo and imagesUrl fields)
 * @param {Object} user - User object from backend
 * @returns {string|null} The photo URL or null if no photo
 */
export const getUserPhotoFromResponse = (user) => {
  return getUserPhotoFromResponseNew(user);
};
