import { useState, useCallback } from "react";
import { CreateTopicApiResponse, CreateTopicRequestBody } from "./hookType";
import { api } from "@/utils/axios.config";


interface UseCreateTopicResult {
    submitTopic: (body: CreateTopicRequestBody) => Promise<CreateTopicApiResponse | null>;
    isSubmitting: boolean;
    submitError: string | null;
    createdTopic: CreateTopicApiResponse | null;
}

export function useCreateTopic(): UseCreateTopicResult {

    const [createdTopic, setCreatedTopic] = useState<CreateTopicApiResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const submitTopic = useCallback(
        async (body: CreateTopicRequestBody): Promise<CreateTopicApiResponse | null> => {
            setIsSubmitting(true);
            setSubmitError(null);
            try {
                const response = await api.post<CreateTopicApiResponse>(`${process.env.NEXT_PUBLIC_EVAL_URL}/topic`, body);
                setCreatedTopic(response.data);
                return response.data;
            } catch (err) {
                setSubmitError(err instanceof Error ? err.message : "Failed to create topic");
                return null;
            } finally {
                setIsSubmitting(false);
            }
        },
        []
    );

    return { submitTopic, isSubmitting, submitError, createdTopic };
}