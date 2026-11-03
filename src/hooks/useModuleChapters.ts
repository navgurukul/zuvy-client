import { useCallback, useEffect, useState } from 'react';
import { api } from '@/utils/axios.config';
import type { ChapterPermissions } from '@/store/store';

type ModuleChaptersResponse = {
    chapterWithTopic: any[];
    moduleName: string;
    permissions: ChapterPermissions;
};

const moduleCache: Record<string, ModuleChaptersResponse> = {};
const inFlightRequests: Record<string, Promise<ModuleChaptersResponse> | undefined> = {};

export function useModuleChapters(moduleId: string | number | undefined) {
    const cacheKey = moduleId ? String(moduleId) : '';

    const [data, setData] = useState<ModuleChaptersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async (showLoading = true, force = false) => {
        if (!moduleId) {
            setLoading(false);
            setData(null);
            return;
        }

        if (showLoading) {
            setLoading(true);
        }

        try {
            let request = !force ? inFlightRequests[cacheKey] : undefined;

            if (!request) {
                request = api
                    .get(`/Content/allChaptersOfModule/${moduleId}`)
                    .then((res) => ({
                        chapterWithTopic: res.data.chapterWithTopic ?? [],
                        moduleName: res.data.moduleName ?? '',
                        permissions: res.data.permissions ?? {},
                    }))
                    .finally(() => {
                        inFlightRequests[cacheKey] = undefined;
                    });

                inFlightRequests[cacheKey] = request;
            }

            const normalized = await request;

            moduleCache[cacheKey] = normalized;
            setData(normalized);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false); 
        }
    }, [moduleId, cacheKey]);

    const refetch = useCallback(() => fetchData(true, true), [fetchData]);


    useEffect(() => {
        if (!moduleId) return;

        if (moduleCache[cacheKey]) {
            setData(moduleCache[cacheKey]);
            setLoading(false);
            // fetchData(false);
            return; // cache hit — skip network call
        }

        fetchData();
    }, [moduleId, cacheKey, fetchData]);


    return {
        moduleName: data?.moduleName ?? '',
        chapters: data?.chapterWithTopic ?? [],
        permissions: data?.permissions ?? {},
        loading,
        error,
        refetch,
    };
}
