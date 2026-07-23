import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import type {
  OpenEndedSubmissionData,
  UseOpenEndedSolutionForStudentsReturn,
} from './hookType';

const useOpenEndedSolutionForStudents = (
  assessmentSubmissionId: string | number | undefined
): UseOpenEndedSolutionForStudentsReturn => {
  const [data, setData] = useState<OpenEndedSubmissionData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!assessmentSubmissionId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `admin/getOpenEndedSolutionForStudents/assessmentSubmissionId?assessmentSubmissionId=${assessmentSubmissionId}`
      );
      setData(response?.data?.data ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Failed to fetch open ended solution data.'
      );
    } finally {
      setLoading(false);
    }
  }, [assessmentSubmissionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useOpenEndedSolutionForStudents;
