import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';

export interface UseAssessmentOpenEndedQuestionsReturn {
  openEndedQuestions: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useAssessmentOpenEndedQuestions = (
  assessmentId: number | null
): UseAssessmentOpenEndedQuestionsReturn => {
  const [openEndedQuestions, setOpenEndedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpenEndedQuestions = useCallback(async () => {
    if (!assessmentId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Content/assessmentDetailsOfOpenEnded/${assessmentId}`);
      setOpenEndedQuestions(res.data);
    } catch (err: any) {
      console.error('Error fetching open-ended questions:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch open-ended questions'
      );
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    fetchOpenEndedQuestions();
  }, [fetchOpenEndedQuestions]);

  return { openEndedQuestions, loading, error, refetch: fetchOpenEndedQuestions };
};

export default useAssessmentOpenEndedQuestions;
