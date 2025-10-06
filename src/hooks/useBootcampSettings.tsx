import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BootcampSettingsData, UseBootcampSettingsReturn } from './hookType';

const useBootcampSettings = (courseId: string): UseBootcampSettingsReturn => {
  const [bootcampSettings, setBootcampSettings] = useState<BootcampSettingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    if (!courseId) {
      setError('Course ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/bootcamp/bootcampSetting/${courseId}`);
      const settings = response.data.bootcampSetting[0];
      
      setBootcampSettings({
        type: settings.type,
        isModuleLocked: settings.isModuleLocked || false
      });
      setError(null);
    } catch (err: any) {
      console.error('Error fetching bootcamp settings:', err);
      
      if (axios.isAxiosError(err)) {
        if (err?.response?.data.message === 'Bootcamp not found for the provided id.') {
          router.push('/admin/courses');
          toast.info({
            title: 'Caution',
            description: 'The Course has been deleted by another Admin',
          });
          return;
        }
      }
      
      setError(err.response?.data?.message || 'Failed to fetch bootcamp settings');
      setBootcampSettings(null);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (settings: BootcampSettingsData) => {
    setUpdateError(null); // Clear previous update errors
    try {
      await api.put(`/bootcamp/bootcampSetting/${courseId}`, settings);
      setBootcampSettings(settings);
    } catch (err: any) {
      console.error('Error updating bootcamp settings:', err);
      const errorMessage = 'Error updating settings. Please try again.';
      setUpdateError(errorMessage);
      throw err;
    }
  };

  const refetch = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  return {
    bootcampSettings,
    loading,
    error,
    updateError,
    updateSettings,
    refetch
  };
};

export default useBootcampSettings;