import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';

const useAssessmentResult = (submissionId: string | number | undefined) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = useCallback(async () => {
    if (!submissionId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`tracking/assessment/submissionId=${submissionId}`);
      setData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to fetch assessment result.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  return { data, loading, error, refetch: fetchResult };
};

export default useAssessmentResult; 