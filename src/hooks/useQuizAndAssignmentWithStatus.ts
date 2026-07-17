import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import {
  UseQuizAndAssignmentWithStatusParams,
  UseQuizAndAssignmentWithStatusReturn,
  CodingProblem,
  QuizAndAssignmentWithStatusData,
} from '@/hooks/hookType';

export const useQuizAndAssignmentWithStatus = ({
  chapterId,
  enabled = true,
}: UseQuizAndAssignmentWithStatusParams): UseQuizAndAssignmentWithStatusReturn => {
  const [data, setData] = useState<QuizAndAssignmentWithStatusData | null>(null);
  const [codingProblems, setCodingProblems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizAndAssignmentWithStatus = useCallback(async () => {
    if (!chapterId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/tracking/getQuizAndAssignmentWithStatus?chapterId=${chapterId}`
      );
      const responseData: QuizAndAssignmentWithStatusData = response.data.data;
      setData(responseData);
      setCodingProblems(responseData?.codingProblem || []);
    } catch (err) {
      console.error('Error fetching quiz and assignment with status:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch quiz and assignment status'
      );
      setData(null);
      setCodingProblems([]);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    if (enabled && chapterId) {
      fetchQuizAndAssignmentWithStatus();
    }
  }, [chapterId, enabled, fetchQuizAndAssignmentWithStatus]);

  const refetch = useCallback(() => {
    fetchQuizAndAssignmentWithStatus();
  }, [fetchQuizAndAssignmentWithStatus]);

  return {
    codingProblems,
    data,
    loading,
    error,
    refetch,
  };
};

export default useQuizAndAssignmentWithStatus;
