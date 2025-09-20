import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import type { UseCourseDetailsReturn, CourseDetailsData } from './hookType';

const useCourseData = (): UseCourseDetailsReturn => {
  const [courseData, setCourseData] = useState<CourseDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCourseDetails = useCallback(async (courseId: number): Promise<boolean> => {
    if (!courseId) {
      setError('Course ID is required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/bootcamp/${courseId}`);
      const data = response.data;
      
      setCourseData(data.bootcamp);
      return true;
    } catch (error: any) {
      console.error('Error fetching course details:', error);
      
      if (error?.response?.data?.message === 'Bootcamp not found!') {
        setError('Course not found or has been deleted');
        
        toast.info({
          title: 'Caution',
          description: 'The Course has been deleted by another Admin',
        });
        
        router.push('/admin/courses');
        return false;
      } else {
        const errorMessage = error?.response?.data?.message || 'Failed to fetch course details';
        setError(errorMessage);
        
        toast.error({
          title: 'Error',
          description: errorMessage,
        });
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refetch = useCallback((courseId: number) => {
    fetchCourseDetails(courseId);
  }, [fetchCourseDetails]);

  const clearData = useCallback(() => {
    setCourseData(null);
    setError(null);
  }, []);

  return {
    courseData,
    loading,
    error,
    fetchCourseDetails,
    refetch,
    clearData,
  };
};

export default useCourseData;