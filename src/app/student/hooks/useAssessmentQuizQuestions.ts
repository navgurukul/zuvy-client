import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import { UseAssessmentQuizQuestionsReturn } from './hookTypes';

const useAssessmentQuizQuestions = (
  assessmentId: number | null
): UseAssessmentQuizQuestionsReturn => {
  const [quizQuestions, setQuizQuestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizQuestions = useCallback(async () => {
    if (!assessmentId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Content/assessmentDetailsOfQuiz/${assessmentId}`);
      setQuizQuestions(res.data);
    } catch (err: any) {
      console.error('Error fetching quiz questions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch quiz questions');
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    fetchQuizQuestions();
  }, [fetchQuizQuestions]);

  return { quizQuestions, loading, error, refetch: fetchQuizQuestions };
};

export default useAssessmentQuizQuestions;
