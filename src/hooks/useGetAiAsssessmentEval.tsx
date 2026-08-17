import { useState, useCallback } from "react";
import { GetAiAssessmentsByChapterApiResponse } from "./hookType";
import { api } from "@/utils/axios.config";

interface UseGetAiAssessmentsByChapterResult {
    getAiAssessmentsByChapter: (
        chapterId: string | number
    ) => Promise<GetAiAssessmentsByChapterApiResponse | null>;
    isFetching: boolean;
    fetchError: string | null;
    aiAssessments: GetAiAssessmentsByChapterApiResponse | null;
}

export function useGetAiAssessmentsByChapter(): UseGetAiAssessmentsByChapterResult {
    const [aiAssessments, setAiAssessments] =
        useState<GetAiAssessmentsByChapterApiResponse | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const getAiAssessmentsByChapter = useCallback(
        async (
            chapterId: string | number
        ): Promise<GetAiAssessmentsByChapterApiResponse | null> => {
            setIsFetching(true);
            setFetchError(null);
            try {
                const response = await api.get<GetAiAssessmentsByChapterApiResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment`,
                    { params: { chapterId } }
                );
                setAiAssessments(response.data);
                return response.data;
            } catch (err) {
                setFetchError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch ai assessments"
                );
                return null;
            } finally {
                setIsFetching(false);
            }
        },
        []
    );

    return {
        getAiAssessmentsByChapter,
        isFetching,
        fetchError,
        aiAssessments,
    };
}