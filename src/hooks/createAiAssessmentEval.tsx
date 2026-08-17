// hooks/useCreateAiAssessment.ts

import { useState, useCallback } from "react";
import { CreateAiAssessmentPayload, CreateAiAssessmentResponse } from "./hookType";
import { api } from "@/utils/axios.config";


interface UseCreateAiAssessmentReturn {
    createAiAssessment: (
        payload: any
    ) => Promise<CreateAiAssessmentResponse | null>;
    data: CreateAiAssessmentResponse | null;
    isLoading: boolean;
    error: string | null;
}

export const useCreateAiAssessment = (): UseCreateAiAssessmentReturn => {
    const [data, setData] = useState<CreateAiAssessmentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createAiAssessment = useCallback(
        async (
            payload: CreateAiAssessmentPayload
        ): Promise<CreateAiAssessmentResponse | null> => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await api.post<CreateAiAssessmentResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment`,
                    payload
                );
                setData(response.data);
                return response.data;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to create AI assessment";
                setError(message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return { createAiAssessment, data, isLoading, error };
};