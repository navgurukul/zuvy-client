import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';

interface NewChapter {
  id: number;
  title: string;
  topicId: number;
  chapterTrackingDetails: any[];
}

interface LatestUpdatedCourseData {
  moduleId: number;
  moduleName: string;
  typeId: number;
  bootcampId: number;
  bootcampName: string;
  newChapter: NewChapter;
}

interface LatestUpdatedCourseResponse {
  message: string;
  code: number;
  isSuccess: boolean;
  data: LatestUpdatedCourseData;
}

export const useLatestUpdatedCourse = () => {
  const [latestCourseData, setLatestCourseData] = useState<LatestUpdatedCourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestUpdatedCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get<LatestUpdatedCourseResponse>('/tracking/latestUpdatedCourse');
        
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
  }, []);

  return {
    latestCourseData,
    loading,
    error
  };
}; 