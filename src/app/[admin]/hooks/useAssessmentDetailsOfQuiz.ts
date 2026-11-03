import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import { AssessmentDetailsOfQuizData, UseAssessmentDetailsOfQuizReturn, QuizSubmissionData, QuizMcqDetail } from './hookType';

const useAssessmentDetailsOfQuiz = (
    assessmentId: string | number | null,
    studentId?: string | number | null
): UseAssessmentDetailsOfQuizReturn => {
    const [quizDetails, setQuizDetails] = useState<AssessmentDetailsOfQuizData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAssessmentDetailsOfQuiz = useCallback(async () => {
        if (!assessmentId) return;

        setLoading(true);
        setError(null);

        try {
            const url = studentId
                ? `/Content/assessmentDetailsOfQuiz/${assessmentId}?studentId=${studentId}`
                : `/Content/assessmentDetailsOfQuiz/${assessmentId}`;

            const response = await api.get(url);
            setQuizDetails(response.data?.data ?? null);
        } catch (err: any) {
            console.error('Error fetching assessment quiz details:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to fetch assessment quiz details'
            );
        } finally {
            setLoading(false);
        }
    }, [assessmentId, studentId]);

    useEffect(() => {
        fetchAssessmentDetailsOfQuiz();
    }, [fetchAssessmentDetailsOfQuiz]);

    return {
        quizDetails,
        loading,
        error,
        refetch: fetchAssessmentDetailsOfQuiz,
    };
};

export default useAssessmentDetailsOfQuiz;
