import { useState, useCallback } from "react";
import { GenerateQuestionsApiResponse, GenerateQuestionsRequestBody } from "./hookType";
import { api } from "@/utils/axios.config";
import { useParams } from "next/navigation";
import { getSocketConnectionStore, getUser } from "@/store/store";


interface UseGenerateQuestionsResult {
    generateQuestions: (
        body: GenerateQuestionsRequestBody
    ) => Promise<GenerateQuestionsApiResponse | null>;
    isGenerating: boolean;
    generateError: string | null;
    generatedResult: GenerateQuestionsApiResponse | null;
}

export function useGenerateQuestions(): UseGenerateQuestionsResult {
    const [generatedResult, setGeneratedResult] =
        useState<GenerateQuestionsApiResponse | null>(null);
    const { organizationId } = useParams()
    const { user } = getUser()
    const orgId = Number(organizationId) || user?.orgId;

    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const { startGeneratingQuestions, stopGeneratingQuestions } = getSocketConnectionStore();

    const generateQuestions = useCallback(
        async (
            body: GenerateQuestionsRequestBody
        ): Promise<GenerateQuestionsApiResponse | null> => {
            setIsGenerating(true);
            setGenerateError(null);
            try {
                const response = await api.post<GenerateQuestionsApiResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/questions/generate?orgId=${orgId}`,
                    body
                );
                
                const data: any = response.data;
                startGeneratingQuestions({
                    message: data?.message || '',
                    totalJobs: data?.totalJobs || 1,
                    jobIds: Array.isArray(data?.jobIds) ? data.jobIds : [],
                });

                setGeneratedResult(response.data);
                return response.data;
            } catch (err) {
                stopGeneratingQuestions();
                setGenerateError(
                    err instanceof Error ? err.message : "Failed to generate questions"
                );
                return null;
            } finally {
                setIsGenerating(false);
            }
        },
        []
    );

    return { generateQuestions, isGenerating, generateError, generatedResult };
}