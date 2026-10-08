import { useState, useCallback } from "react";
import { AddSubtopicApiResponse, AddSubtopicRequestBody } from "./hookType";
import { api } from "@/utils/axios.config";


interface UseAddSubtopicResult {
    addSubtopic: (
        topicId: string | number,
        body: AddSubtopicRequestBody
    ) => Promise<AddSubtopicApiResponse | null>;
    isAdding: boolean;
    addError: string | null;
    addedResult: AddSubtopicApiResponse | null;
}

export function useAddSubtopic(): UseAddSubtopicResult {
    const [addedResult, setAddedResult] =
        useState<AddSubtopicApiResponse | null>(null);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [addError, setAddError] = useState<string | null>(null);

    const addSubtopic = useCallback(
        async (
            topicId: string | number,
            body: AddSubtopicRequestBody
        ): Promise<AddSubtopicApiResponse | null> => {
            setIsAdding(true);
            setAddError(null);
            try {
                const response = await api.post<AddSubtopicApiResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/topic/${topicId}/subtopics`,
                    body
                );
                setAddedResult(response.data);
                return response.data;
            } catch (err) {
                setAddError(
                    err instanceof Error ? err.message : "Failed to add subtopic"
                );
                return null;
            } finally {
                setIsAdding(false);
            }
        },
        []
    );

    return { addSubtopic, isAdding, addError, addedResult };
}