import { useState } from 'react';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { UseEditCodingQuestionReturn, EditCodingQuestionData } from './hookType';

export const useEditCodingQuestion = (): UseEditCodingQuestionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editQuestion = async (questionId: number | null, data: EditCodingQuestionData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Validate questionId in hook
      if (!questionId || questionId === null) {
        throw new Error('Question ID is required for editing');
      }

      const response = await api.put(`codingPlatform/update-question/${questionId}`, data);

      toast.success({
        title: 'Success',
        description: 'Question Updated Successfully',
      });

      return true; // Success
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'An error occurred';
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
    editQuestion,
    loading,
    error,
  };
};