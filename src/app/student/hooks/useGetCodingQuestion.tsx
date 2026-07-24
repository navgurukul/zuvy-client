import { useState, useCallback, useEffect } from 'react';
import { api } from '@/utils/axios.config';
import { UseGetCodingQuestionParams, UseGetCodingQuestionReturn, CodingQuestionDetails } from './hookTypes';

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
            const orgIdStr = Array.isArray(orgId) ? orgId[0] : orgId;
            const response = await api.get(
                `/codingPlatform/${orgIdStr}/get-coding-question/${questionId}`
            );

            const data = response?.data?.data;
            setQuestionDetails(data);
            setTestCases(data?.testCases ?? []);
            setTemplates(data?.templates ?? {});
            setExamples(data?.examples ?? []);
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
