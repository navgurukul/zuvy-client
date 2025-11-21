import { useCallback, useEffect, useState } from 'react';
import { api } from '@/utils/axios.config';
import type { ChapterPermissions } from '@/store/store';

type ModuleChaptersResponse = {
    chapterWithTopic: any[];
    moduleName: string;
    permissions: ChapterPermissions;
};

const moduleCache: Record<string, ModuleChaptersResponse> = {};

export function useModuleChapters(moduleId: string | number | undefined) {
    const cacheKey = moduleId ? String(moduleId) : '';

    const [data, setData] = useState<ModuleChaptersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!moduleId) {
            setLoading(false);
            setData(null);
            return;
        }

        setLoading(true); 
        try {
            const res = await api.get(`/Content/allChaptersOfModule/${moduleId}`);

            const normalized: ModuleChaptersResponse = {
                chapterWithTopic: res.data.chapterWithTopic ?? [],
                moduleName: res.data.moduleName ?? '',
                permissions: res.data.permissions ?? {},
            };

            moduleCache[cacheKey] = normalized;
            setData(normalized);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false); 
        }
    }, [moduleId, cacheKey]);


    useEffect(() => {
        if (!moduleId) return;

        if (moduleCache[cacheKey]) {
            setData(moduleCache[cacheKey]);  
            fetchData();                     
            return;
        }

        fetchData();
    }, [moduleId, cacheKey, fetchData]);


    return {
        moduleName: data?.moduleName ?? '',
        chapters: data?.chapterWithTopic ?? [],
        permissions: data?.permissions ?? {},
        loading,
        error,
        refetch: fetchData,
    };
}
