import { useState, useCallback } from "react";
import {
    PublishAssessmentApiResponse,
    PublishAssessmentRequestBody,
} from "./hookType";
import { api } from "@/utils/axios.config";

interface UsePublishAssessmentResult {
    publishAssessment: (
        aiAssessmentId: string | number,
        body: PublishAssessmentRequestBody
    ) => Promise<PublishAssessmentApiResponse | null>;
    isPublishing: boolean;
    publishError: string | null;
    publishedResult: PublishAssessmentApiResponse | null;
}

export function usePublishAssessment(): UsePublishAssessmentResult {
    const [publishedResult, setPublishedResult] =
        useState<PublishAssessmentApiResponse | null>(null);
    const [isPublishing, setIsPublishing] = useState<boolean>(false);
    const [publishError, setPublishError] = useState<string | null>(null);

    const publishAssessment = useCallback(
        async (
            aiAssessmentId: string | number,
            body: PublishAssessmentRequestBody
        ): Promise<PublishAssessmentApiResponse | null> => {
            setIsPublishing(true);
            setPublishError(null);
            try {
                const response = await api.post<PublishAssessmentApiResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/${aiAssessmentId}/publish`,
                    body
                );
                setPublishedResult(response.data);
                return response.data;
            } catch (err) {
                setPublishError(
                    err instanceof Error ? err.message : "Failed to publish assessment"
                );
                return null;
            } finally {
                setIsPublishing(false);
            }
        },
        []
    );

    return { publishAssessment, isPublishing, publishError, publishedResult };
}