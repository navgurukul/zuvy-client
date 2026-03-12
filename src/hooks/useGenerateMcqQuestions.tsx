import { useSearchParams } from 'next/navigation';
import { use, useState } from 'react';

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
  const accessToken = localStorage.getItem('access_token') || '';
  console.log(accessToken)

  const generateQuestions = async (payload: GenerateMcqPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/questions/generate?orgId=${organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateQuestions,
    isLoading,
    error,  organizationId,
  };
};
