import { useState } from 'react';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { UseCreateOpenEndedQuestionReturn, CreateOpenEndedQuestionData } from './hookType';

export const useCreateOpenEndedQuestion = (): UseCreateOpenEndedQuestionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOpenEndedQuestion = async (data: CreateOpenEndedQuestionData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('Content/createOpenEndedQuestion', data);

      toast.success({
        title: 'Success',
        description: 'Open-Ended Question Created Successfully',
      });

      return true; // Success
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      
      toast.error({
        title: 'Error',
        description: errorMessage,
      });

      return false; // Failure
    } finally {
      setLoading(false);
    }
  };

  return {
    createOpenEndedQuestion,
    loading,
    error,
  };
};