import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';
// import{UseCompletedClassesReturn,AttendanceStats,CompletedClassesData} from '@/hooks/hookType'

export interface CompletedClass {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  attendanceStatus: 'present' | 'absent';
  duration: number;
  s3Link: string;
  moduleId: number;
  chapterId: number;
}

export interface AttendanceStats {
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export interface CompletedClassesData {
  batchId: number;
  batchName: string;
  classes: CompletedClass[];
  totalClasses: number;
  totalPages: number;
  attendanceStats: AttendanceStats;
}

interface UseCompletedClassesReturn {
  completedClassesData: CompletedClassesData | null;
  loading: boolean;
  error: string | null;
}

export const useCompletedClasses = (bootcampId: string): UseCompletedClassesReturn => {
  const [completedClassesData, setCompletedClassesData] = useState<CompletedClassesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bootcampId) {
      setLoading(false);
      return;
    };

    const fetchCompletedClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/student/bootcamp/${bootcampId}/completed-classes`);
        
        if (response.data && response.data.isSuccess) {
          setCompletedClassesData(response.data.data);
        } else {
          setCompletedClassesData(null);
          setError(response.data.message || 'Failed to fetch completed classes');
        }
      } catch (err: any) {
        console.error('Error fetching completed classes:', err);
        setError(err.response?.data?.message || 'Failed to fetch completed classes');
        setCompletedClassesData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedClasses();
  }, [bootcampId]);

  return { completedClassesData, loading, error };
}; 