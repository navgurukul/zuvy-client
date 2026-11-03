import { useState, useCallback } from "react";
import { GenerateQuestionsApiResponse, GenerateQuestionsRequestBody } from "./hookType";
import { api } from "@/utils/axios.config";
import { useParams } from "next/navigation";
import { getUser } from "@/store/store";
import { toast } from "@/components/ui/use-toast";


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
                
                setGeneratedResult(response.data);
                toast({
                    title: "Questions will be generated check after a few minutes",
                    description: "Your AI questions were queued successfully.",
                    variant: "success",
                });
                return response.data;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to generate questions";
                setGenerateError(message);
                toast({
                    title: "Question generation failed",
                    description: message,
                    variant: "error",
                });
                return null;
            } finally {
                setIsGenerating(false);
            }
        },
        [orgId]
    );

    return { generateQuestions, isGenerating, generateError, generatedResult };
}