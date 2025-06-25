import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';

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
}

interface UpcomingEventsData {
  events: Event[];
  totalEvents: number;
  totalPages: number;
}

interface UseUpcomingEventsReturn {
  upcomingEventsData: UpcomingEventsData | null;
  loading: boolean;
  error: string | null;
}

export const useUpcomingEvents = (): UseUpcomingEventsReturn => {
  const [upcomingEventsData, setUpcomingEventsData] = useState<UpcomingEventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/student/UpcomingEvents');
        
        if (response.data && response.data.isSuccess) {
          setUpcomingEventsData(response.data.data);
        } else {
          setUpcomingEventsData(null);
          setError(response.data.message || 'Failed to fetch upcoming events');
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