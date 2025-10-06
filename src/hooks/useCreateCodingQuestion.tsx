import { useState } from 'react';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { UseCreateCodingQuestionReturn, CreateCodingQuestionData } from './hookType';

export const useCreateCodingQuestion = (): UseCreateCodingQuestionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuestion = async (data: CreateCodingQuestionData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('codingPlatform/create-question', data);

      toast.success({
        title: 'Success',
        description: 'Question Created Successfully',
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
    createQuestion,
    loading,
    error,
  };
};