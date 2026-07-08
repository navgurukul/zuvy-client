import { useState } from 'react';
import { api } from '@/utils/axios.config';
import {
  UseSubmitQuizAndAssignmentParams,
  UseSubmitQuizAndAssignmentReturn,
  SubmitAssignmentPayload,
  SubmitQuizPayload,
} from '@/hooks/hookType';

const useSubmitQuizAndAssignment = ({
  courseId,
  moduleId,
  chapterId,
}: UseSubmitQuizAndAssignmentParams): UseSubmitQuizAndAssignmentReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUrl = () =>
    `/tracking/updateQuizAndAssignmentStatus/${courseId}/${moduleId}?chapterId=${chapterId}`;

  const submitAssignment = async (payload: SubmitAssignmentPayload): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(getUrl(), payload);
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Failed to submit assignment.';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitQuiz = async (payload: SubmitQuizPayload): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(getUrl(), payload);
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Failed to submit quiz.';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitAssignment,
    submitQuiz,
    isSubmitting,
    error,
  };
};

export default useSubmitQuizAndAssignment;
