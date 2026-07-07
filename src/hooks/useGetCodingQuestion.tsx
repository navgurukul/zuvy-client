import { useState, useCallback, useEffect } from 'react';
import { api } from '@/utils/axios.config';

export interface CodingQuestionDetails {
    title: string;
    description: string;
    constraints?: string;
    examples?: { input: number[]; output: number };
    testCases?: any[];
    templates?: Record<string, { template: string }>;
}

interface UseGetCodingQuestionParams {
    questionId: string | null;
    orgId: string | string[] | null;
    enabled?: boolean;
}

interface UseGetCodingQuestionReturn {
    questionDetails: CodingQuestionDetails | null;
    testCases: any[];
    templates: Record<string, { template: string }>;
    examples: any[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useGetCodingQuestion = ({
    questionId,
    orgId,
    enabled = true,
}: UseGetCodingQuestionParams): UseGetCodingQuestionReturn => {
    const [questionDetails, setQuestionDetails] = useState<CodingQuestionDetails | null>(null);
    const [testCases, setTestCases] = useState<any[]>([]);
    const [templates, setTemplates] = useState<Record<string, { template: string }>>({});
    const [examples, setExamples] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchQuestionDetails = useCallback(async () => {
        if (!questionId || !orgId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(
                `codingPlatform/${orgId}/get-coding-question/${questionId}`
            );

            const data = response?.data?.data;
            setQuestionDetails(data);
            setTestCases(data?.testCases ?? []);
            setTemplates(data?.templates ?? {});
            setExamples(response?.data?.[0]?.examples ?? []);
        } catch (err) {
            console.error('Error fetching coding question:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch coding question');
        } finally {
            setLoading(false);
        }
    }, [questionId, orgId]);

    useEffect(() => {
        if (enabled) {
            fetchQuestionDetails();
        }
    }, [enabled, fetchQuestionDetails]);

    return {
        questionDetails,
        testCases,
        templates,
        examples,
        loading,
        error,
        refetch: fetchQuestionDetails,
    };
};

export default useGetCodingQuestion;
