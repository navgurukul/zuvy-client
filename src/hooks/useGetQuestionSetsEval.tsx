import { useState, useCallback } from "react";
import { GetQuestionSetsApiResponse } from "./hookType";
import { api } from "@/utils/axios.config";

interface UseGetQuestionSetsResult {
    getQuestionSets: (
        aiAssessmentId: string | number
    ) => Promise<GetQuestionSetsApiResponse | null>;
    isFetching: boolean;
    fetchError: string | null;
    questionSets: GetQuestionSetsApiResponse | null;
}

export function useGetQuestionSets(): UseGetQuestionSetsResult {
    const [questionSets, setQuestionSets] =
        useState<GetQuestionSetsApiResponse | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const getQuestionSets = useCallback(
        async (
            aiAssessmentId: string | number
        ): Promise<GetQuestionSetsApiResponse | null> => {
            setIsFetching(true);
            setFetchError(null);
            try {
                const response = await api.get<GetQuestionSetsApiResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/${aiAssessmentId}/question-sets`
                );
                setQuestionSets(response.data);
                return response.data;
            } catch (err) {
                setFetchError(
                    err instanceof Error ? err.message : "Failed to fetch question sets"
                );
                return null;
            } finally {
                setIsFetching(false);
            }
        },
        []
    );

    return { getQuestionSets, isFetching, fetchError, questionSets };
}