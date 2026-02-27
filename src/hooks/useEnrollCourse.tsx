import { useState } from 'react';
import { api } from '@/utils/axios.config';
import { UseEnrollCourseReturn, EnrollCourseResponse } from '@/hooks/hookType';

const useEnrollCourse = (): UseEnrollCourseReturn => {
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const enrollCourse = async (courseId: number): Promise<boolean> => {
    setIsEnrolling(true);
    setError(null);

    try {
      const response = await api.post<EnrollCourseResponse>('/student/enroll-course', {
        courseId
      });

      if (response.data.isSuccess) {
        return true;
      } else {
        setError(response.data.message || 'Failed to enroll in course');
        return false;
      }
    } catch (err: any) {
      console.error('Error enrolling in course:', err);
      setError(err.response?.data?.message || 'Failed to enroll in course');
      return false;
    } finally {
      setIsEnrolling(false);
    }
  };

  return {
    enrollCourse,
    isEnrolling,
    error,
  };
};

export default useEnrollCourse;
