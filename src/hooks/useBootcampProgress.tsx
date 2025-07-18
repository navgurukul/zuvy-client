import { useState, useEffect } from 'react';
import { api } from "@/utils/axios.config";
import {BootcampTracking,InstructorDetails,BatchInfo,BootcampProgressData,BootcampProgressResponse} from '@/hooks/type'


export const useBootcampProgress = (courseId: string) => {
  const [progressData, setProgressData] = useState<BootcampProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBootcampProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/tracking/bootcampProgress/${courseId}`);
      setProgressData(response.data);
    } catch (err) {
      console.error('Error fetching bootcamp progress:', err);
      setError('Failed to load bootcamp progress');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchBootcampProgress();
  };

  useEffect(() => {
    if (courseId) {
      fetchBootcampProgress();
    }
  }, [courseId]);

  return {
    progressData,
    loading,
    error,
    refetch
  };
}; 