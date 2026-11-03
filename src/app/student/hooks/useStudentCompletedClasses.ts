import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';
import {
  StudentCompletedClassesData,
  UseStudentCompletedClassesReturn,
} from './hookTypes';

export const useStudentCompletedClasses = (
  bootcampId?: string | number
): UseStudentCompletedClassesReturn => {
  const [completedClassesData, setCompletedClassesData] =
    useState<StudentCompletedClassesData | null>(null);
  const [loading, setLoading] = useState(Boolean(bootcampId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bootcampId) return;

    const fetchCompletedClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(
          `/student/bootcamp/${bootcampId}/completed-classes/me`
        );
        // API returns { isSuccess, message, data: { batchId, classes, ... } }
        setCompletedClassesData(response.data?.data ?? null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || 'Failed to load completed classes'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedClasses();
  }, [bootcampId]);

  return { completedClassesData, loading, error };
};

export default useStudentCompletedClasses;
