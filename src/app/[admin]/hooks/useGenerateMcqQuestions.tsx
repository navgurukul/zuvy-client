import { useState } from 'react';
import { getSocketConnectionStore } from '@/store/store';
import { api } from '@/utils/axios.config';

type GenerateMcqResponse = {
  message?: string;
  totalJobs?: number;
  jobIds?: string[];
  [key: string]: any;
};

interface GenerateMcqPayload {
  domainName: string;
  topicNames: string[];
  numberOfQuestions: number;
  learningObjectives: string;
  targetAudience?: string;
  focusAreas?: string;
  bloomsLevel: string;
  questionStyle: string;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionCounts?: {
    easy: number;
    medium: number;
    hard: number;
  };
  topics: {
    [key: string]: number;
  };
  topicConfigurations?: Array<{
    topicName: string;
    topicDescription: string;
    totalQuestions: number;
    difficultyDistribution: {
      easy: number;
      medium: number;
      hard: number;
    };
    questionCounts: {
      easy: number;
      medium: number;
      hard: number;
    };
  }>;
  levelId: null;
}

interface UseGenerateMcqQuestionsReturn {
  generateQuestions: (payload: GenerateMcqPayload) => Promise<any>;
  isLoading: boolean;
  error: string | null;
  organizationId: number;
}

export const useGenerateMcqQuestions = (organizationId: number): UseGenerateMcqQuestionsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { startGeneratingQuestions, stopGeneratingQuestions } = getSocketConnectionStore();

  /**
   * Note: WebSocket connection and global generation loader are handled
   * at the app root for persistence across route changes.
   */

  const generateQuestions = async (payload: GenerateMcqPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<GenerateMcqResponse>(
        `${process.env.NEXT_PUBLIC_EVAL_URL}/questions/generate`,
        payload,
        {
          params: {
            orgId: organizationId,
          },
        }
      );
      const data = response.data;

      startGeneratingQuestions({
        message: data?.message || '',
        totalJobs: data?.totalJobs || 1,
        jobIds: Array.isArray(data?.jobIds) ? data.jobIds : [],
      });

      console.log('✅ Question generation request submitted successfully');
      console.log('Response:', data);
      
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to generate questions';
      setError(errorMessage);
      stopGeneratingQuestions();
      console.error('❌ Failed to generate questions:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateQuestions,
    isLoading,
    error,
    organizationId,
  };
};
