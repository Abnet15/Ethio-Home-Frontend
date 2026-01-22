import { useState } from 'react';
import { 
  usePropertiesQuery, 
  usePropertyQuery, 
  useUpdateProperty, 
  useDeleteProperty 
} from './usePropertiesQuery';

// Legacy hook wrapper - now uses React Query under the hood
export const useProperties = (initialParams = {}) => {
  const [filters, setFilters] = useState(initialParams);
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error, refetch } = usePropertiesQuery(
    {
      ...filters,
      page,
      limit: 12,
    },
    {
      keepPreviousData: true, // Keep previous data while loading new page
    }
  );

  const properties = data?.properties || [];
  const pagination = data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 12,
  };

  const fetchProperties = async (params = {}) => {
    setFilters(prev => ({ ...prev, ...params }));
    setPage(1);
    await refetch();
  };

  const searchProperties = async (searchParams) => {
    await fetchProperties(searchParams);
  };

  const loadMore = () => {
    if (page < pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const refresh = () => {
    refetch();
  };

  return {
    properties,
    loading: isLoading,
    error: error?.message || null,
    pagination,
    fetchProperties,
    searchProperties,
    loadMore,
    refresh,
    hasMore: page < pagination.totalPages
  };
};

// Legacy hook wrapper - now uses React Query under the hood
export const useProperty = (id) => {
  const { data: property, isLoading, error, refetch } = usePropertyQuery(id);
  const updatePropertyMutation = useUpdateProperty();
  const deletePropertyMutation = useDeleteProperty();

  const updateProperty = async (propertyData) => {
    try {
      const result = await updatePropertyMutation.mutateAsync({ id, propertyData });
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteProperty = async () => {
    try {
      const result = await deletePropertyMutation.mutateAsync(id);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    property,
    loading: isLoading,
    error: error?.message || null,
    fetchProperty: refetch,
    updateProperty,
    deleteProperty,
    refresh: refetch
  };
};

