import { useState, useEffect } from 'react';
import { api } from "@/utils/axios.config";
import { UseFetchGlobalCoursesReturn, GlobalCourseData } from '@/hooks/hookType';

export const useFetchGlobalCourses = () => {
  const [globalCourse, setGlobalCourse] = useState<GlobalCourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/student/fetchGlobalCourses');
      setGlobalCourse(response.data.data);
    } catch (err) {
      console.error('Error fetching global courses:', err);
      setError('Failed to load global courses');
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
    globalCourse,
    loading,
    error,
    refetch
  } as UseFetchGlobalCoursesReturn;
};
