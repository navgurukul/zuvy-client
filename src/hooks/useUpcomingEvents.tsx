import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';
// import{UpcomingEventsData } from '@/hooks/hookType'

export interface Event {
  type: "Live Class" | "Assessment" | "Assignment";
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  bootcampId: number;
  bootcampName: string;
  batchId: number;
  eventDate: string;
  moduleId: number;
  chapterId: number;
}

export interface UpcomingEventsData {
  events: Event[];
  totalEvents: number;
  totalPages: number;
}
export interface UseUpcomingEventsReturn {
  upcomingEventsData: UpcomingEventsData | null;
  loading: boolean;
  error: string | null;
}


export const useUpcomingEvents = (courseId?: string): UseUpcomingEventsReturn => {
  const [upcomingEventsData, setUpcomingEventsData] = useState<UpcomingEventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        if(courseId) {
          
          const response = await api.get(`/student/UpcomingEvents?bootcampId=${courseId}`);
          
          if (response.data && response.data.isSuccess) {
            setUpcomingEventsData(response.data.data);
          } else {
            setUpcomingEventsData(null);
            setError(response.data.message || 'Failed to fetch upcoming events');
          }
        } else {
          const response = await api.get('/student/UpcomingEvents');
          
          if (response.data && response.data.isSuccess) {
            setUpcomingEventsData(response.data.data);
          } else {
            setUpcomingEventsData(null);
            setError(response.data.message || 'Failed to fetch upcoming events');
          }
        }
        
      } catch (err: any) {
        console.error('Error fetching upcoming events:', err);
        setError(err.response?.data?.message || 'Failed to fetch upcoming events');
        setUpcomingEventsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  return { upcomingEventsData, loading, error };
}; 