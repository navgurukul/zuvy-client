import { useState, useEffect } from 'react';
import { api } from "@/utils/axios.config";

interface Module {
  id: number;
  name: string;
  description: string;
  typeId: number;
  order: number;
  projectId: number | null;
  isLock: boolean;
  timeAlloted: number;
  progress: number;
  ChapterId: number;
  quizCount: number;
  assignmentCount: number;
  codingProblemsCount: number;
  articlesCount: number;
  formCount: number;
}

interface UseAllModulesForStudentsReturn {
  modules: Module[];
  loading: boolean;
  error: string | null;
}

export const useAllModulesForStudents = (courseId: string): UseAllModulesForStudentsReturn => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      if (!courseId) {
        setError('Course ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/tracking/allModulesForStudents/${courseId}`);
        
        if (response.data && Array.isArray(response.data)) {
          // Sort modules by order
          const sortedModules = response.data.sort((a: Module, b: Module) => a.order - b.order);
          setModules(sortedModules);
        } else {
          setModules([]);
        }
      } catch (err: any) {
        console.error('Error fetching modules:', err);
        setError(err.response?.data?.message || 'Failed to fetch modules');
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [courseId]);

  return { modules, loading, error };
}; 