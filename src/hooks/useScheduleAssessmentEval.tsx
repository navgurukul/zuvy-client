import { useCallback, useState } from 'react';
import { api } from '@/utils/axios.config';
import {
    PublishAssessmentApiResponse,
    ScheduleAssessmentRequestBody,
} from './hookType';

interface UseScheduleAssessmentResult {
    scheduleAssessment: (
        assessmentId: string | number,
        body: ScheduleAssessmentRequestBody
    ) => Promise<PublishAssessmentApiResponse | null>;
    isScheduling: boolean;
    scheduleError: string | null;
    scheduledResult: PublishAssessmentApiResponse | null;
}

export function useScheduleAssessment(): UseScheduleAssessmentResult {
    const [scheduledResult, setScheduledResult] =
        useState<PublishAssessmentApiResponse | null>(null);
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleError, setScheduleError] = useState<string | null>(null);

    const scheduleAssessment = useCallback(
        async (
            assessmentId: string | number,
            body: ScheduleAssessmentRequestBody
        ): Promise<PublishAssessmentApiResponse | null> => {
            setIsScheduling(true);
            setScheduleError(null);
            try {
                const response = await api.post<PublishAssessmentApiResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/${assessmentId}/schedule`,
                    body
                );
                setScheduledResult(response.data);
                return response.data;
            } catch (err) {
                setScheduleError(
                    err instanceof Error ? err.message : 'Failed to schedule assessment'
                );
                return null;
            } finally {
                setIsScheduling(false);
            }
        },
        []
    );

    return { scheduleAssessment, isScheduling, scheduleError, scheduledResult };
}