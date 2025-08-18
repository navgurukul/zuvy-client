import { useState, useEffect } from 'react';
import { api } from "@/utils/axios.config";
import{StudentData} from '@/hooks/hookType'

export const useStudentData = () => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/student');
      setStudentData(response.data);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchStudentData();
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  return {
    studentData,
    loading,
    error,
    refetch
  };
}; 