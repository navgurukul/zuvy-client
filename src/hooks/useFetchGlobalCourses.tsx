import { useState, useEffect } from 'react';
import { api } from "@/utils/axios.config";
import { UseFetchGlobalCoursesReturn, GlobalCourseData } from '@/hooks/hookType';

export const useFetchGlobalCourses = () => {
  const [globalCourses, setGlobalCourses] = useState<GlobalCourseData[]>([]); // Changed to array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Updated API endpoint
      const response = await api.get('/student/bootcamp/global');
      
      console.log('Global Courses API Response:', response.data);
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        // Direct array response
        setGlobalCourses(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Wrapped in data property
        setGlobalCourses(response.data.data);
      } else if (response.data?.isSuccess && response.data?.data) {
        // Standard API wrapper
        setGlobalCourses(Array.isArray(response.data.data) ? response.data.data : [response.data.data]);
      } else {
        // Single course or unknown structure
        setGlobalCourses([]);
        console.warn('Unexpected API response structure:', response.data);
      }
      
    } catch (err: any) {
      console.error('Error fetching global courses:', err);
      setError(err?.response?.data?.message || 'Failed to load global courses');
      setGlobalCourses([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchGlobalCourses();
  };

  useEffect(() => {
    fetchGlobalCourses();
  }, []);

  return {
    globalCourses, // Changed from globalCourse to globalCourses
    loading,
    error,
    refetch
  } as UseFetchGlobalCoursesReturn;
};