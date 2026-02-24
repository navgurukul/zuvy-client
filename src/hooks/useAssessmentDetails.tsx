import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import { AssessmentDetails, UseAssessmentDetailsResponse } from '@/hooks/hookType'

const useAssessmentDetails = (
  assessmentId: number | null,
  moduleId: string | null,
  bootcampId: string | null,
  chapterId: string | null
): UseAssessmentDetailsResponse => {
  const [assessmentDetails, setAssessmentDetails] = useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessmentDetails = useCallback(async () => {
    if (!assessmentId || !moduleId || !bootcampId || !chapterId) {
      setAssessmentDetails(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `/Content/students/assessmentId=${assessmentId}?moduleId=${moduleId}&bootcampId=${bootcampId}&chapterId=${chapterId}`
      );

      if (response.data.status === 'success') {
        setAssessmentDetails(response.data);
      } else {
        throw new Error('Failed to fetch assessment details');
      }
    } catch (err: any) {
      console.error('Error fetching assessment details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch assessment details');
      setAssessmentDetails(null);
    } finally {
      setLoading(false);
    }
  }, [assessmentId, moduleId, bootcampId, chapterId]);

  useEffect(() => {
    fetchAssessmentDetails();
  }, [fetchAssessmentDetails]);

  const refetch = () => {
    fetchAssessmentDetails();
  };

  return {
    assessmentDetails,
    loading,
    error,
    refetch
  };
};

export default useAssessmentDetails; 