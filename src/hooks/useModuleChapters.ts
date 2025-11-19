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
    const [data, setData] = useState<ModuleChaptersResponse | null>(
        cacheKey && moduleCache[cacheKey] ? moduleCache[cacheKey] : null
    );
    const [loading, setLoading] = useState(!data && !!moduleId);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!moduleId) {
            setData(null);
            setLoading(false);
            return null;
        }

        setLoading(true);
        try {
            const response = await api.get(`/Content/allChaptersOfModule/${moduleId}`);
            const normalized: ModuleChaptersResponse = {
                chapterWithTopic: response.data.chapterWithTopic ?? [],
                moduleName: response.data.moduleName ?? '',
                permissions: response.data.permissions ?? {},
            };
            moduleCache[cacheKey] = normalized;
            setData(normalized);
            setError(null);
            return normalized;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [moduleId, cacheKey]);

    useEffect(() => {
        if (!moduleId) {
            setData(null);
            setLoading(false);
            return;
        }

        if (cacheKey && moduleCache[cacheKey]) {
            setData(moduleCache[cacheKey]);
            setLoading(false);
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
