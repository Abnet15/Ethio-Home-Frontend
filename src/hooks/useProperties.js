import { useState, useEffect } from 'react';

import { propertyService } from '../services/propertyService';

export const useProperties = (initialParams = {}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const fetchProperties = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await propertyService.getProperties({
        ...initialParams,
        ...params,
        page: pagination.page,
        limit: pagination.limit
      });

      if (result.success) {
        // Backend shape: { status, results, pageNumber, pages, data: { data: [...] } }
        const list = result.data?.data?.data || [];
        setProperties(list);

        // Sync pagination based on backend fields
        const pageNumber = result.data?.pageNumber;
        const pages = result.data?.pages;
        const resultsCount = result.data?.results;
        setPagination(prev => ({
          ...prev,
          page: typeof pageNumber === 'number' ? pageNumber : prev.page,
          totalPages: typeof pages === 'number' ? pages : prev.totalPages,
          total: typeof resultsCount === 'number' ? resultsCount : prev.total
        }));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const searchProperties = async (searchParams) => {
    await fetchProperties(searchParams);
  };

  const loadMore = async () => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const refresh = () => {
    fetchProperties();
  };

  useEffect(() => {
    fetchProperties();
  }, [pagination.page]);

  return {
    properties,
    loading,
    error,
    pagination,
    fetchProperties,
    searchProperties,
    loadMore,
    refresh,
    hasMore: pagination.page < pagination.totalPages
  };
};

export const useProperty = (id) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProperty = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await propertyService.getProperty(id);

      if (result.success) {
        // Backend shape: { status, data: { data: { ...property } } }
        setProperty(result.data?.data?.data || null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch property');
    } finally {
      setLoading(false);
    }
  };

  const updateProperty = async (propertyData) => {
    try {
      const result = await propertyService.updateProperty(id, propertyData);
      
      if (result.success) {
        setProperty(result.data?.data?.data || null);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to update property' };
    }
  };

  const deleteProperty = async () => {
    try {
      const result = await propertyService.deleteProperty(id);
      return result;
    } catch (err) {
      return { success: false, error: 'Failed to delete property' };
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  return {
    property,
    loading,
    error,
    fetchProperty,
    updateProperty,
    deleteProperty,
    refresh: fetchProperty
  };
};

