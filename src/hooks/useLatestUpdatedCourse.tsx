import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';
import { LatestUpdatedCourseResponse, LatestUpdatedCourseData } from '@/hooks/hookType'

export const useLatestUpdatedCourse = (courseId: string) => {
  const [latestCourseData, setLatestCourseData] = useState<LatestUpdatedCourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestUpdatedCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<LatestUpdatedCourseResponse>(`/tracking/latestUpdatedCourse?bootcampId=${courseId}`);

        if (response.data.isSuccess) {
          setLatestCourseData(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch latest updated course');
        }
      } catch (err: any) {
        console.error('Error fetching latest updated course:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch latest updated course');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestUpdatedCourse();
  }, [courseId]);

  return {
    latestCourseData,
    loading,
    error
  };
}; 