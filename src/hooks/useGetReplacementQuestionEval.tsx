import { useState, useCallback } from "react";
import {
    GetReplacementQuestionsApiResponse,
    GetReplacementQuestionsParams,
} from "./hookType";
import { api } from "@/utils/axios.config";

interface UseGetReplacementQuestionsResult {
    getReplacementQuestions: (
        params: GetReplacementQuestionsParams
    ) => Promise<GetReplacementQuestionsApiResponse | null>;
    isFetching: boolean;
    fetchError: string | null;
    replacementQuestions: GetReplacementQuestionsApiResponse | null;
}

export function useGetReplacementQuestions(): UseGetReplacementQuestionsResult {
    const [replacementQuestions, setReplacementQuestions] =
        useState<GetReplacementQuestionsApiResponse | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const getReplacementQuestions = useCallback(
        async (
            params: GetReplacementQuestionsParams
        ): Promise<GetReplacementQuestionsApiResponse | null> => {
            setIsFetching(true);
            setFetchError(null);
            try {
                const response = await api.get<GetReplacementQuestionsApiResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/questions/replace`,
                    { params }
                );
                setReplacementQuestions(response.data);
                return response.data;
            } catch (err) {
                setFetchError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch replacement questions"
                );
                return null;
            } finally {
                setIsFetching(false);
            }
        },
        []
    );

    return {
        getReplacementQuestions,
        isFetching,
        fetchError,
        replacementQuestions,
    };
}