import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import { UseQuizResultsParams, QuizResultsResponse } from '@/hooks/hookType'

export const useQuizResults = ({
  submissionId,
  enabled = true,
}: UseQuizResultsParams) => {
  const [data, setData] = useState<QuizResultsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizResults = useCallback(async () => {
    if (!submissionId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `Content/assessmentDetailsOfQuiz/${submissionId}`
      );
      setData(response?.data?.data);
    } catch (err) {
      console.error('Error fetching quiz results:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz results');
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    if (enabled && submissionId) {
      fetchQuizResults();
    }
  }, [submissionId, enabled, fetchQuizResults]);

  const refetch = () => {
    if (submissionId) {
      fetchQuizResults();
    }
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};

export default useQuizResults;
