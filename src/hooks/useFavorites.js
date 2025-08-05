import { useState, useEffect } from 'react';

import { favoritesService } from '../services/favoritesService';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load favorites from API
  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await favoritesService.getFavorites();
      if (result.success) {
        const favoritesList = result.data.data.favorites || [];
        setFavorites(favoritesList.map(fav => fav._id));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const addToFavorites = async (propertyId) => {
    try {
      const result = await favoritesService.addToFavorites(propertyId);
      if (result.success) {
        await loadFavorites(); // Reload to get updated list
      }
    } catch (error) {
      setError('Failed to add to favorites');
    }
  };

  const removeFromFavorites = async (propertyId) => {
    try {
      const result = await favoritesService.removeFromFavorites(propertyId);
      if (result.success) {
        await loadFavorites(); // Reload to get updated list
      }
    } catch (error) {
      setError('Failed to remove from favorites');
    }
  };

  const toggleFavorite = async (propertyId) => {
    try {
      const result = await favoritesService.toggleFavorite(propertyId);
      if (result.success) {
        await loadFavorites(); // Reload to get updated list
      }
    } catch (error) {
      setError('Failed to toggle favorite');
    }
  };

  const isFavorite = (propertyId) => {
    return favorites.includes(propertyId);
  };

  const clearFavorites = async () => {
    try {
      const result = await favoritesService.clearFavorites();
      if (result.success) {
        setFavorites([]);
      }
    } catch (error) {
      setError('Failed to clear favorites');
    }
  };

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
    loadFavorites
  };
};

