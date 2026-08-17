import { useState, useCallback } from "react";
import {
    ReplaceQuestionApiResponse,
    ReplaceQuestionRequestBody,
} from "./hookType";
import { api } from "@/utils/axios.config";

interface UseReplaceQuestionResult {
    replaceQuestion: (
        questionId: string | number,
        body: ReplaceQuestionRequestBody
    ) => Promise<ReplaceQuestionApiResponse | null>;
    isReplacing: boolean;
    replaceError: string | null;
    replacedResult: ReplaceQuestionApiResponse | null;
}

export function useReplaceQuestion(): UseReplaceQuestionResult {
    const [replacedResult, setReplacedResult] =
        useState<ReplaceQuestionApiResponse | null>(null);
    const [isReplacing, setIsReplacing] = useState<boolean>(false);
    const [replaceError, setReplaceError] = useState<string | null>(null);

    const replaceQuestion = useCallback(
        async (
            questionId: string | number,
            body: ReplaceQuestionRequestBody
        ): Promise<ReplaceQuestionApiResponse | null> => {
            setIsReplacing(true);
            setReplaceError(null);
            try {
                const response = await api.put<ReplaceQuestionApiResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/questions/${questionId}/replace`,
                    body
                );
                setReplacedResult(response.data);
                return response.data;
            } catch (err) {
                setReplaceError(
                    err instanceof Error ? err.message : "Failed to replace question"
                );
                return null;
            } finally {
                setIsReplacing(false);
            }
        },
        []
    );

    return { replaceQuestion, isReplacing, replaceError, replacedResult };
}