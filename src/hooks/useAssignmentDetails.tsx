import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';

interface AssignmentTracking {
  id: number;
  projectUrl: string;
  timeLimit: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  chapterId: number;
  bootcampId: number;
  moduleId: number;
}

interface AssignmentChapterDetails {
  completionDate: string; // This is the deadline
}

interface AssignmentDetailsData {
  assignmentTracking: AssignmentTracking[];
  chapterDetails: AssignmentChapterDetails;
  status: 'Completed' | 'Pending';
  quizDetails?: any[];
}

interface ApiResponse {
  data: AssignmentDetailsData;
}

interface UseAssignmentDetailsReturn {
  assignmentData: AssignmentDetailsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useAssignmentDetails = (chapterId: string | null): UseAssignmentDetailsReturn => {
  const [assignmentData, setAssignmentData] = useState<AssignmentDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!chapterId) {
      setError('Chapter ID is required for assignments');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get<ApiResponse>(`/tracking/getQuizAndAssignmentWithStatus?chapterId=${chapterId}`);
      setAssignmentData(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching assignment details:', err);
      setError(err.response?.data?.message || 'Failed to fetch assignment details');
      setAssignmentData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [chapterId]);

  const refetch = () => {
    fetchData();
  };

  return {
    assignmentData,
    loading,
    error,
    refetch,
  };
};

export default useAssignmentDetails; 