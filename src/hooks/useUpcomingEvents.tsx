import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';
import { UpcomingEventsData, UseUpcomingEventsReturn, CompletedClassesResponse } from '@/hooks/hookType'



export const useUpcomingEvents = (courseId?: string): UseUpcomingEventsReturn => {
  const [upcomingEventsData, setUpcomingEventsData] = useState<UpcomingEventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        if (courseId) {

          const response = await api.get<CompletedClassesResponse>(`/student/UpcomingEvents?bootcampId=${courseId}`);

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
  }, [courseId]);

  return { upcomingEventsData, loading, error };
}; 