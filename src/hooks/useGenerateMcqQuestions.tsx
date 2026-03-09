import { useSearchParams } from 'next/navigation';
import { use, useState } from 'react';

interface GenerateMcqPayload {
  domainName: string;
  topicNames: string[];
  topicDescription?: string;
  numberOfQuestions: number;
  learningObjectives: string;
  targetAudience?: string;
  focusAreas?: string;
  bloomsLevel: string;
  questionStyle: string;
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
  topics: {
    [key: string]: number;
  };
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

  const generateQuestions = async (payload: GenerateMcqPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/questions/generate?orgId=${organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
