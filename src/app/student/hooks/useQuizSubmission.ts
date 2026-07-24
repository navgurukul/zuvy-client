import { useState, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import {
  QuizSubmissionPayload,
  QuizSubmissionResponse,
  UseQuizSubmissionReturn,
} from './hookTypes';

export const useQuizSubmission = (
  assessmentSubmitId: number | null | undefined,
  assessmentOutSourceId: string | null | undefined
): UseQuizSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitQuiz = useCallback(
    async (
      payload: QuizSubmissionPayload
    ): Promise<QuizSubmissionResponse | null> => {
      if (!assessmentSubmitId) {
        setError('Assessment submission ID is required');
        return null;
      }

      if (!assessmentOutSourceId) {
        setError('Assessment outsource ID is required');
        return null;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const response = await api.patch<QuizSubmissionResponse>(
          `/submission/quiz/assessmentSubmissionId=${assessmentSubmitId}?assessmentOutsourseId=${assessmentOutSourceId}`,
          payload
        );
        return response.data;
      } catch (err) {
        console.error('Error submitting quiz answers:', err);
        const errMessage =
          err instanceof Error
            ? err.message
            : 'Failed to submit quiz answers';
        setError(errMessage);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [assessmentSubmitId, assessmentOutSourceId]
  );

  return {
    submitQuiz,
    isSubmitting,
    error,
  };
};

export default useQuizSubmission;
