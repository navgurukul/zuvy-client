import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';

interface AssessmentDetails {
  status: string;
  statusCode: number;
  assessmentState: string;
  message: string;
  id: number;
  assessmentId: number;
  bootcampId: number;
  moduleId: number;
  chapterId: number;
  codingQuestionTagId: number[];
  mcqTagId: number[];
  easyCodingQuestions: number;
  mediumCodingQuestions: number;
  hardCodingQuestions: number;
  totalCodingQuestions: number;
  totalMcqQuestions: number;
  easyMcqQuestions: number;
  mediumMcqQuestions: number;
  hardMcqQuestions: number;
  weightageCodingQuestions: number;
  weightageMcqQuestions: number;
  easyCodingMark: number;
  mediumCodingMark: number;
  hardCodingMark: number;
  easyMcqMark: number;
  mediumMcqMark: number;
  hardMcqMark: number;
  tabChange: any | null;
  webCamera: any | null;
  passPercentage: number;
  screenRecord: any | null;
  embeddedGoogleSearch: any | null;
  deadline: string | null;
  timeLimit: number;
  marks: any | null;
  copyPaste: any | null;
  order: number;
  canEyeTrack: boolean;
  canTabChange: boolean;
  canScreenExit: boolean;
  canCopyPaste: boolean;
  publishDatetime: string;
  startDatetime: string;
  endDatetime: string;
  unpublishDatetime: string | null;
  currentState: number;
  createdAt: string;
  updatedAt: string;
  version: any | null;
  submitedOutsourseAssessments: any[];
  ModuleAssessment: {
    id: number;
    title: string;
    description: string;
  };
  totalQuizzes: number;
  totalOpenEndedQuestions: number;
}

interface UseAssessmentDetailsResponse {
  assessmentDetails: AssessmentDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useAssessmentDetails = (
  assessmentId: number | null,
  moduleId: string | null,
  bootcampId: string | null,
  chapterId: string | null
): UseAssessmentDetailsResponse => {
  const [assessmentDetails, setAssessmentDetails] = useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessmentDetails = async () => {
    if (!assessmentId || !moduleId || !bootcampId || !chapterId) {
      setAssessmentDetails(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(
        `/Content/students/assessmentId=${assessmentId}?moduleId=${moduleId}&bootcampId=${bootcampId}&chapterId=${chapterId}`
      );
      
      if (response.data.status === 'success') {
        setAssessmentDetails(response.data);
      } else {
        throw new Error('Failed to fetch assessment details');
      }
    } catch (err: any) {
      console.error('Error fetching assessment details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch assessment details');
      setAssessmentDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentDetails();
  }, [assessmentId, moduleId, bootcampId, chapterId]);

  const refetch = () => {
    fetchAssessmentDetails();
  };

  return {
    assessmentDetails,
    loading,
    error,
    refetch
  };
};

export default useAssessmentDetails; 