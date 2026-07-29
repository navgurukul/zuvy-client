import { useState, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import {
  OpenEndedSubmissionPayload,
  OpenEndedSubmissionResponse,
  UseOpenEndedSubmissionReturn,
} from './hookTypes';

export const useOpenEndedSubmission = (
  assessmentSubmitId: number | null | undefined
): UseOpenEndedSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitOpenEnded = useCallback(
    async (
      payload: OpenEndedSubmissionPayload
    ): Promise<OpenEndedSubmissionResponse | null> => {
      if (!assessmentSubmitId) {
        setError('Assessment submission ID is required');
        return null;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const response = await api.patch<OpenEndedSubmissionResponse>(
          `/submission/openended/assessmentSubmissionId=${assessmentSubmitId}`,
          payload
        );
        return response.data;
      } catch (err) {
        console.error('Error submitting open-ended answers:', err);
        const errMessage =
          err instanceof Error
            ? err.message
            : 'Failed to submit open-ended answers';
        setError(errMessage);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [assessmentSubmitId]
  );

  return {
    submitOpenEnded,
    isSubmitting,
    error,
  };
};

export default useOpenEndedSubmission;
