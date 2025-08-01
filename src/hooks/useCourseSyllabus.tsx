import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';
import{UseCourseSyllabusReturn,ApiResponses,CourseSyllabusData} from '@/hooks/hookType'

const useCourseSyllabus = (courseId: string | string[] | undefined): UseCourseSyllabusReturn => {
  const [syllabusData, setSyllabusData] = useState<CourseSyllabusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSyllabus = async () => {
    if (!courseId) {
      setError('Course ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<ApiResponses>(`/student/syllabus/${courseId}`);
      
      if (response.data.isSuccess) {
        setSyllabusData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch syllabus');
      }
    } catch (err: any) {
      console.error('Error fetching course syllabus:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch course syllabus');
      setSyllabusData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, [courseId]);

  const refetch = () => {
    fetchSyllabus();
  };

  return {
    syllabusData,
    loading,
    error,
    refetch
  };
};

export default useCourseSyllabus;