import { useState, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import { AssessmentSubmissionResponse } from '@/app/student/course/[courseId]/org/[orgId]/studentAssessment/_studentAssessmentComponents/projectStudentAssessmentUtilsType';

export interface UseAssessmentSubmissionsParams {
  assessmentId: number | null;
  moduleId: string;
  bootcampId: string;
  chapterId: string;
}

export interface UseAssessmentSubmissionsReturn {
  submissionsData: AssessmentSubmissionResponse | null;
  loading: boolean;
  error: string | null;
  fetchSubmissions: () => Promise<AssessmentSubmissionResponse | null>;
}

const useAssessmentSubmissions = ({
  assessmentId,
  moduleId,
  bootcampId,
  chapterId,
}: UseAssessmentSubmissionsParams): UseAssessmentSubmissionsReturn => {
  const [submissionsData, setSubmissionsData] = useState<AssessmentSubmissionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async (): Promise<AssessmentSubmissionResponse | null> => {
    if (!assessmentId || !moduleId || !bootcampId || !chapterId) return null;

    setLoading(true);
    setError(null);
    try {
      const res = await api.get<AssessmentSubmissionResponse>(
        `Content/students/assessmentId=${assessmentId}?moduleId=${moduleId}&bootcampId=${bootcampId}&chapterId=${chapterId}`
      );
      setSubmissionsData(res.data);
      return res.data;
    } catch (err: any) {
      console.error('Error fetching assessment submissions:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch assessment submissions'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [assessmentId, moduleId, bootcampId, chapterId]);

  return { submissionsData, loading, error, fetchSubmissions };
};

export default useAssessmentSubmissions;
