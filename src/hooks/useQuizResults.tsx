import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';
import {QuizOption,SubmissionData,QuizResult,QuizResultsResponse,UseQuizResultsParams}from '@/hooks/type'


export const useQuizResults = ({
  submissionId,
  enabled = true,
}: UseQuizResultsParams) => {
  const [data, setData] = useState<QuizResultsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizResults = async () => {
    if (!submissionId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{data:QuizResultsResponse}>(
        `Content/assessmentDetailsOfQuiz/${submissionId}`
      );
      setData(response?.data?.data);
    } catch (err) {
      console.error('Error fetching quiz results:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled && submissionId) {
      fetchQuizResults();
    }
  }, [submissionId, enabled]);

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
