import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';

interface ChapterDetails {
  id: number;
  title: string;
  description: string | null;
  topicId: number;
  moduleId: number;
  file: string | null;
  links: string | null;
  articleContent: string | null;
  quizQuestions: any | null;
  codingQuestions: any | null;
  formQuestions: any | null;
  assessmentId: number | null;
  completionDate: string | null;
  order: number;
  version: string | null;
  chapterTrackingDetails: any[];
  status: string;
}

interface UseChapterDetailsResponse {
  chapterDetails: ChapterDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useChapterDetails = (chapterId: string | null): UseChapterDetailsResponse => {
  const [chapterDetails, setChapterDetails] = useState<ChapterDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChapterDetails = async () => {
    if (!chapterId) {
      setChapterDetails(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/tracking/getChapterDetailsWithStatus/${chapterId}`);
      
      if (response.data.status === 'success') {
        setChapterDetails(response.data.trackingData);
      } else {
        throw new Error('Failed to fetch chapter details');
      }
    } catch (err: any) {
      console.error('Error fetching chapter details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch chapter details');
      setChapterDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapterDetails();
  }, [chapterId]);

  const refetch = () => {
    fetchChapterDetails();
  };

  return {
    chapterDetails,
    loading,
    error,
    refetch
  };
};

export default useChapterDetails; 