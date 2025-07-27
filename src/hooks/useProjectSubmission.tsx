import { useState } from 'react';
import { api } from '@/utils/axios.config';

interface ProjectSubmissionResponse {
  message: string;
  status: string;
  data?: any;
}

interface UseProjectSubmissionReturn {
  submitProject: (projectLink: string, projectId: string, moduleId: string, courseId: string) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
}

const useProjectSubmission = (): UseProjectSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitProject = async (projectLink: string, projectId: string, moduleId: string, courseId: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.post<ProjectSubmissionResponse>(`/tracking/updateProject/${projectId}?moduleId=${moduleId}&bootcampId=${courseId}`, {
        projectLink
      });

      if (response.data.status == 'success') {
        return true;
      } else {
        setError(response.data.message || 'Failed to submit project');
        return false;
      }
    } catch (err: any) {
      console.error('Error submitting project:', err);
      setError(err.response?.data?.message || 'Failed to submit project');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitProject,
    isSubmitting,
    error,
  };
};

export default useProjectSubmission; 