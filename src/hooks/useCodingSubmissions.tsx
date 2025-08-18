import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';
import{CodingSubmissionsResponse,UseCodingSubmissionsParams,} from '@/hooks/hookType'

export const useCodingSubmissions = ({
  codingOutsourseId,
  assessmentSubmissionId,
  questionId,
  enabled = true,
}: UseCodingSubmissionsParams) => {
  const [data, setData] = useState<CodingSubmissionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCodingSubmissions = async () => {
    if (!codingOutsourseId || !assessmentSubmissionId || !questionId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `codingPlatform/submissions/questionId=${questionId}?assessmentSubmissionId=${assessmentSubmissionId}&codingOutsourseId=${codingOutsourseId}`
      );
      setData(response.data);
    } catch (err) {
      console.error('Error fetching coding submissions data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch coding submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled && codingOutsourseId && assessmentSubmissionId && questionId) {
      fetchCodingSubmissions();
    }
  }, [codingOutsourseId, assessmentSubmissionId, questionId, enabled]);

  const refetch = () => {
    if (codingOutsourseId && assessmentSubmissionId && questionId) {
      fetchCodingSubmissions();
    }
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};

export default useCodingSubmissions;
