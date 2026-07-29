import { useState, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import { UseSubmitAssessmentReturn, SubmitAssessmentPayload } from './hookTypes';

const useSubmitAssessment = (): UseSubmitAssessmentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAssessment = useCallback(
    async (assessmentSubmissionId: number, payload: SubmitAssessmentPayload): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await api.patch(
          `/submission/assessment/submit?assessmentSubmissionId=${assessmentSubmissionId}`,
          payload
        );
        return true;
      } catch (err: any) {
        console.error('Error submitting assessment:', err);
        setError(err.response?.data?.message || err.message || 'Failed to submit assessment');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, submitAssessment };
};

export default useSubmitAssessment;
