import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';
import {AssignmentTracking,AssignmentChapterDetails,AssignmentDetailsData,ApiResponse,UseAssignmentDetailsReturn} from "@/hooks/type"


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