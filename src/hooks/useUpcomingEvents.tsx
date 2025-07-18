import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';
import {UpcomingEventsData,UseUpcomingEventsReturn,UpcomingEventResponse }from '@/hooks/type'



export const useUpcomingEvents = (): UseUpcomingEventsReturn => {
  const [upcomingEventsData, setUpcomingEventsData] = useState<UpcomingEventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get<UpcomingEventResponse>('/student/UpcomingEvents');
        
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