import { useState, useCallback } from "react";
import { UpdateQuestionApiResponse, UpdateQuestionRequestBody } from "./hookType";
import { api } from "@/utils/axios.config";
import { toast } from '@/components/ui/use-toast';
interface UseUpdateQuestionResult {
    updateQuestion: (
        questionId: string | number,
        body: UpdateQuestionRequestBody
    ) => Promise<UpdateQuestionApiResponse | null>;
    isUpdating: boolean;
    updateError: string | null;
    updatedResult: UpdateQuestionApiResponse | null;
}

export function useUpdateQuestion(): UseUpdateQuestionResult {
    const [updatedResult, setUpdatedResult] =
        useState<UpdateQuestionApiResponse | null>(null);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const updateQuestion = useCallback(
        async (
            questionId: string | number,
            body: UpdateQuestionRequestBody
        ): Promise<UpdateQuestionApiResponse | null> => {
            setIsUpdating(true);
            setUpdateError(null);
            try {
                const response = await api.patch<UpdateQuestionApiResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/questions/${questionId}`,
                    body
                );
                setUpdatedResult(response.data);
                toast({ title: "Question Updated", description: "Question updated successfully", duration: 3200, variant: 'success' });
                return response.data;
            } catch (err) {
                setUpdateError(
                    err instanceof Error ? err.message : "Failed to update question"
                );
                toast({ title: "Question Update Failed", description: "Failed to update question", duration: 3200, variant: 'destructive' });
                return null;
            } finally {
                setIsUpdating(false);
            }
        },
        []
    );

    return { updateQuestion, isUpdating, updateError, updatedResult };
}