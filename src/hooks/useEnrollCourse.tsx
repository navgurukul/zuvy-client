import { useRef, useState } from 'react';
import { api } from '@/utils/axios.config';
import { UseEnrollCourseReturn, EnrollCourseResponse, EnrollCourseResult } from '@/hooks/hookType';

const useEnrollCourse = (): UseEnrollCourseReturn => {
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const enrollCourse = async (bootcampId: number): Promise<EnrollCourseResult> => {
    if (inFlightRef.current) {
      return { success: false, message: 'Enrollment already in progress.' };
    }

    inFlightRef.current = true;
    setIsEnrolling(true);
    setError(null);

    try {
      const response = await api.post<EnrollCourseResponse>('/student/bootcamp/enroll', { bootcampId });
      const data = response.data;

      const normalizedStatus = (data?.status || '').toLowerCase();
      const httpOk = response.status >= 200 && response.status < 300;

      // Explicit error markers first
      const hasExplicitError =
        data?.isSuccess === false ||
        normalizedStatus === 'error' ||
        (typeof data?.code === 'number' && data.code >= 400);

      const success =
        !hasExplicitError &&
        (
          data?.isSuccess === true ||
          normalizedStatus === 'success' ||
          data?.code === 200 ||
          data?.code === 201 ||
          httpOk
        );

      if (success) {
        return {
          success: true,
          message: data?.message || 'Enrolled successfully.',
          code: data?.code,
        };
      }

      const message = data?.message || 'Failed to enroll in bootcamp';
      setError(message);
      return { success: false, message, code: data?.code };
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to enroll in bootcamp';
      const code = err?.response?.status;
      setError(message);
      return { success: false, message, code };
    } finally {
      inFlightRef.current = false;
      setIsEnrolling(false);
    }
  };

  return { enrollCourse, isEnrolling, error };
};

export default useEnrollCourse;