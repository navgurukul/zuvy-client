import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import { CodingSubmissionsResponse, UseCodingSubmissionsParams } from './hookTypes';

export const useCodingSubmissions = ({
  codingOutsourseId,
  assessmentSubmissionId,
  questionId,
  enabled = true,
}: UseCodingSubmissionsParams) => {
  const [data, setData] = useState<CodingSubmissionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCodingSubmissions = useCallback(async (
    overrideCodingOutsourseId?: number | null,
    overrideAssessmentSubmissionId?: number | null,
    overrideQuestionId?: number | null,
  ): Promise<CodingSubmissionsResponse | null> => {
    const cId = overrideCodingOutsourseId ?? codingOutsourseId;
    const aId = overrideAssessmentSubmissionId ?? assessmentSubmissionId;
    const qId = overrideQuestionId ?? questionId;

    if (!cId || !aId || !qId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<CodingSubmissionsResponse>(
        `codingPlatform/submissions/questionId=${qId}?assessmentSubmissionId=${aId}&codingOutsourseId=${cId}`
      );
      setData(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching coding submissions data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch coding submissions');
      return null;
    } finally {
      setLoading(false);
    }
  }, [codingOutsourseId, assessmentSubmissionId, questionId]);

  useEffect(() => {
    if (enabled && codingOutsourseId && assessmentSubmissionId && questionId) {
      fetchCodingSubmissions();
    }
  }, [codingOutsourseId, assessmentSubmissionId, questionId, enabled, fetchCodingSubmissions]);

  const refetch = () => fetchCodingSubmissions();

  return {
    data,
    loading,
    error,
    refetch,
    fetchCodingSubmissions,
  };
};

export default useCodingSubmissions;
