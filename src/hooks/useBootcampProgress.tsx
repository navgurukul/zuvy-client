import { useState, useEffect } from 'react';
import { api } from "@/utils/axios.config";

interface BootcampTracking {
  id: number;
  name: string;
  description: string | null;
  collaborator: string | null;
  coverImage: string;
  bootcampTopic: string;
  startTime: string;
  duration: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  version: string | null;
}

interface InstructorDetails {
  instructorId: number;
  instructorName: string;
  instructorProfilePicture: string | null;
}

interface BatchInfo {
  batchName: string;
  totalEnrolledStudents: number;
}

interface BootcampProgressData {
  id: number;
  userId: number;
  progress: number;
  bootcampId: number;
  createdAt: string;
  updatedAt: string;
  version: string | null;
  bootcampTracking: BootcampTracking;
}

interface BootcampProgressResponse {
  status: string;
  message: string;
  data: BootcampProgressData;
  instructorDetails: InstructorDetails;
  batchInfo: BatchInfo;
}

export const useBootcampProgress = (courseId: string) => {
  const [progressData, setProgressData] = useState<BootcampProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBootcampProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/tracking/bootcampProgress/${courseId}`);
      setProgressData(response.data);
    } catch (err) {
      console.error('Error fetching bootcamp progress:', err);
      setError('Failed to load bootcamp progress');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchBootcampProgress();
  };

  useEffect(() => {
    if (courseId) {
      fetchBootcampProgress();
    }
  }, [courseId]);

  return {
    progressData,
    loading,
    error,
    refetch
  };
}; 