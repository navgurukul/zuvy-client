import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { BootcampSettingsData, UseBootcampSettingsReturn } from './hookType';
import { getUser } from '@/store/store';

const useBootcampSettings = (courseId: string): UseBootcampSettingsReturn => {
  const [bootcampSettings, setBootcampSettings] = useState<BootcampSettingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const router = useRouter();
  const { organizationId } = useParams()
  const { user } = getUser()
  const userRole = user?.rolesList?.[0]?.toLowerCase() || ''

  const fetchData = useCallback(async () => {
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
          router.push(`/${userRole}/organizations/${organizationId}/courses`);
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
  }, [courseId, organizationId, router, userRole]);

  const updateSettings = useCallback(async (settings: BootcampSettingsData) => {
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
  }, [courseId]);

  const refetch = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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