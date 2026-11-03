import { useState } from 'react';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { UseRequestReattemptReturn } from './hookTypes';

const useRequestReattempt = (): UseRequestReattemptReturn => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReattempt = async (
    submissionId: number | string,
    userId: number | string
  ) => {
    setIsRequesting(true);
    setError(null);

    try {
      await api.post(
        `/student/assessment/request-reattempt?assessmentSubmissionId=${submissionId}&userId=${userId}`
      );
      toast({
        title: 'Re-attempt Requested',
        description: 'Your request for a re-attempt has been sent.',
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        'Failed to request re-attempt. Please try again.';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return { requestReattempt, isRequesting, error };
};

export default useRequestReattempt;
