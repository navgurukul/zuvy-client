import { useCallback, useState } from 'react';
import { api } from '@/utils/axios.config';
import { PublishAssessmentApiResponse } from './hookType';

interface UseSaveAssessmentDraftResult {
    saveAssessmentDraft: (
        assessmentId: string | number
    ) => Promise<PublishAssessmentApiResponse | null>;
    isSavingDraft: boolean;
    draftError: string | null;
    draftResult: PublishAssessmentApiResponse | null;
}

export function useSaveAssessmentDraft(): UseSaveAssessmentDraftResult {
    const [draftResult, setDraftResult] =
        useState<PublishAssessmentApiResponse | null>(null);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [draftError, setDraftError] = useState<string | null>(null);

    const saveAssessmentDraft = useCallback(
        async (
            assessmentId: string | number
        ): Promise<PublishAssessmentApiResponse | null> => {
            setIsSavingDraft(true);
            setDraftError(null);
            try {
                const response = await api.post<PublishAssessmentApiResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/${assessmentId}/draft`
                );
                setDraftResult(response.data);
                return response.data;
            } catch (err) {
                setDraftError(
                    err instanceof Error ? err.message : 'Failed to save assessment draft'
                );
                return null;
            } finally {
                setIsSavingDraft(false);
            }
        },
        []
    );

    return { saveAssessmentDraft, isSavingDraft, draftError, draftResult };
}