import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';

interface ProjectInstruction {
  description: string;
}

interface ProjectTrackingData {
  // Add tracking data properties as needed
  projectLink: string;
}

interface ProjectData {
  id: number;
  title: string;
  instruction: ProjectInstruction;
  isLock: boolean;
  deadline: string;
  version: number | null;
  projectTrackingData: ProjectTrackingData[];
}

interface ProjectDetailsResponse {
  message: string;
  code: number;
  isSuccess: boolean;
  data: {
    moduleId: number;
    bootcampId: number;
    typeId: number;
    projectData: ProjectData[];
    status: 'Pending' | 'Completed';
  };
}

interface UseProjectDetailsReturn {
  projectData: ProjectData[];
  moduleId: number;
  bootcampId: number;
  typeId: number;
  status: 'Pending' | 'Completed';
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const useProjectDetails = (projectId: string, moduleId: string): UseProjectDetailsReturn => {
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [moduleIdData, setModuleIdData] = useState<number>(0);
  const [bootcampId, setBootcampId] = useState<number>(0);
  const [typeId, setTypeId] = useState<number>(0);
  const [status, setStatus] = useState<'Pending' | 'Completed'>('Pending');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isRefetch = false) => {
    if (!projectId || !moduleId) {
      setError('Project ID and Module ID are required');
      setLoading(false);
      return;
    }

    try {
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await api.get<ProjectDetailsResponse>(`/tracking/getProjectDetailsWithStatus/${projectId}/${moduleId}`);
      
      if (response.data.isSuccess) {
        setProjectData(response.data.data.projectData);
        setModuleIdData(response.data.data.moduleId);
        setBootcampId(response.data.data.bootcampId);
        setTypeId(response.data.data.typeId);
        setStatus(response.data.data.status);
      } else {
        setError('Failed to fetch project details');
      }
    } catch (err: any) {
      console.error('Error fetching project details:', err);
      setError(err.response?.data?.message || 'Failed to fetch project details');
    } finally {
      if (isRefetch) {
        setIsRefetching(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, moduleId]);

  const refetch = async (): Promise<void> => {
    await fetchData(true);
  };

  return {
    projectData,
    moduleId: moduleIdData,
    bootcampId,
    typeId,
    status,
    loading,
    isRefetching,
    error,
    refetch
  };
};

export default useProjectDetails; 