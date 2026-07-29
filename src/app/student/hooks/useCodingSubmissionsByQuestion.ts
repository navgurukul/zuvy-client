import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import {
  UseCodingSubmissionsByQuestionParams,
  UseCodingSubmissionsByQuestionReturn,
  CodingSubmissionByQuestionData,
} from './hookTypes';

export const useCodingSubmissionsByQuestion = ({
  questionId,
  enabled = true,
}: UseCodingSubmissionsByQuestionParams): UseCodingSubmissionsByQuestionReturn => {
  const [submissionData, setSubmissionData] = useState<CodingSubmissionByQuestionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmission = useCallback(async () => {
    if (!questionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/codingPlatform/submissions/questionId=${questionId}`
      );
      if (response.data.isSuccess) {
        setSubmissionData(response.data.data);
      } else {
        setSubmissionData(null);
      }
    } catch (err) {
      console.error(`Error fetching submission for question ${questionId}:`, err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch coding submission'
      );
      setSubmissionData(null);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    if (enabled && questionId) {
      fetchSubmission();
    }
  }, [questionId, enabled, fetchSubmission]);

  const refetch = useCallback(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  return {
    submissionData,
    loading,
    error,
    refetch,
  };
};

export default useCodingSubmissionsByQuestion;
