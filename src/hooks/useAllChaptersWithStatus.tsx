import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';

import {TrackingDataItem, ModuleDetail,AllChaptersWithStatusResponse,UseAllChaptersWithStatusReturn} from '@/hooks/type'


const useAllChaptersWithStatus = (moduleId: string): UseAllChaptersWithStatusReturn => {
  const [trackingData, setTrackingData] = useState<TrackingDataItem[]>([]);
  const [moduleDetails, setModuleDetails] = useState<ModuleDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isRefetch = false) => {
    
    if (!moduleId) {
      setError('Module ID is required');
      setLoading(false);
      return;
    }

    try {
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await api.get<AllChaptersWithStatusResponse>(`/tracking/getAllChaptersWithStatus/${moduleId}`);
      
      if (response.data.status === 'success') {
        setTrackingData(response.data.trackingData);
        setModuleDetails(response.data.moduleDetails);
      } else {
        setError('Failed to fetch tracking data');
      }
    } catch (err: any) {
      console.error('Error fetching tracking data:', err);
      setError(err.response?.data?.message || 'Failed to fetch tracking data');
    } finally {
      if (isRefetch) {
        setIsRefetching(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [moduleId]);

  const refetch = () => {
    fetchData(true);
  };

  return {
    trackingData,
    moduleDetails,
    loading,
    isRefetching,
    error,
    refetch
  };
};

export default useAllChaptersWithStatus; 