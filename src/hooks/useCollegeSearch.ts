import { useEffect, useState } from 'react';
import { api } from '@/utils/axios.config';

const COLLEGES_API_URL = '/basic/colleges-name';

export interface CollegeOption {
  name: string;
  state: string;
}

export const useCollegeSearch = (searchTerm: string, debounceMs = 400) => {
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      setColleges([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await api.get(COLLEGES_API_URL, {
          params: { name: keyword },
        });

        const payload = response.data;
        const collegesFromApi = Array.isArray(payload?.data)
          ? payload.data
              .map((college: { name?: string; 'state-province'?: string }) => ({
                name: String(college.name || '').trim(),
                state: String(college['state-province'] || 'India').trim() || 'India',
              }))
              .filter((college: CollegeOption) => Boolean(college.name))
          : [];

        const uniqueColleges = collegesFromApi.filter(
          (college: CollegeOption, index: number, list: CollegeOption[]) =>
            index === list.findIndex((item) => item.name.toLowerCase() === college.name.toLowerCase())
        );

        const filtered = uniqueColleges.filter((college: CollegeOption) => {
          const name = college.name.toLowerCase();
          const state = college.state.toLowerCase();
          return name.includes(keyword) || state.includes(keyword);
        });

        setColleges(filtered);
      } catch (error) {
        console.error('Failed to fetch colleges:', error);
        setColleges([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return {
    colleges,
    isLoading,
  };
};

export default useCollegeSearch;
