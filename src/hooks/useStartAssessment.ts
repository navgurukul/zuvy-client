import { useState, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import { AssessmentData } from '@/app/student/course/[courseId]/org/[orgId]/studentAssessment/_studentAssessmentComponents/projectStudentAssessmentUtilsType';

export interface StartAssessmentResponse {
  data: AssessmentData & {
    submission: {
      id: number;
      startedAt: string;
    };
  };
}

export interface UseStartAssessmentReturn {
  assessmentData: (AssessmentData & { submission: { id: number; startedAt: string } }) | null;
  loading: boolean;
  error: string | null;
  startAssessment: (
    assessmentOutSourceId: number,
    isNewStart?: boolean
  ) => Promise<(AssessmentData & { submission: { id: number; startedAt: string } }) | null>;
}

const useStartAssessment = (): UseStartAssessmentReturn => {
  const [assessmentData, setAssessmentData] = useState<
    (AssessmentData & { submission: { id: number; startedAt: string } }) | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAssessment = useCallback(
    async (
      assessmentOutSourceId: number,
      isNewStart: boolean = false
    ): Promise<(AssessmentData & { submission: { id: number; startedAt: string } }) | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<StartAssessmentResponse>(
          `/Content/startAssessmentForStudent/assessmentOutsourseId=${assessmentOutSourceId}/newStart=${isNewStart}`
        );
        setAssessmentData(res.data.data);
        return res.data.data;
      } catch (err: any) {
        console.error('Error starting assessment:', err);
        setError(err.response?.data?.message || err.message || 'Failed to start assessment');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { assessmentData, loading, error, startAssessment };
};

export default useStartAssessment;
