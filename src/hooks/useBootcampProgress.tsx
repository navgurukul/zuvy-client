import { useState, useEffect, useCallback } from 'react';
import { api } from "@/utils/axios.config";
import { BootcampProgressResponse } from '@/hooks/hookType'

export const useBootcampProgress = (courseId: string) => {
  const [progressData, setProgressData] = useState<BootcampProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBootcampProgress = useCallback(async () => {
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
  }, [courseId]);

  const refetch = () => {
    fetchBootcampProgress();
  };

  useEffect(() => {
    if (courseId) {
      fetchBootcampProgress();
    }
  }, [courseId, fetchBootcampProgress]);

  return {
    progressData,
    loading,
    error,
    refetch
  };
}; 