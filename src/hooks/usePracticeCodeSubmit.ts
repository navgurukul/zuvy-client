import { useState, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import {
  UsePracticeCodeSubmitParams,
  PracticeCodeSubmitPayload,
  PracticeCodeSubmitResponse,
} from '@/hooks/hookType';

export const usePracticeCodeSubmit = ({
  questionId,
  assessmentSubmitId,
  selectedCodingOutsourseId,
}: UsePracticeCodeSubmitParams) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [codeResult, setCodeResult] = useState<PracticeCodeSubmitResponse['data'] | null>(null);

  const submitCode = useCallback(
    async (
      action: 'run' | 'submit',
      payload: PracticeCodeSubmitPayload,
    ): Promise<PracticeCodeSubmitResponse | null> => {
      if (!questionId) return null;

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<PracticeCodeSubmitResponse>(
          `/codingPlatform/practicecode/questionId=${questionId}?action=${action}&submissionId=${assessmentSubmitId}&codingOutsourseId=${selectedCodingOutsourseId}`,
          payload,
        );
        setCodeResult(response.data.data);
        return response.data;
      } catch (err: any) {
        const errData = err.response?.data?.data ?? null;
        setCodeResult(errData);
        setError(
          err.response?.data?.message ||
            err instanceof Error
            ? err.message
            : 'Failed to submit code',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [questionId, assessmentSubmitId, selectedCodingOutsourseId],
  );

  return {
    submitCode,
    loading,
    error,
    codeResult,
    setCodeResult,
  };
};

export default usePracticeCodeSubmit;
