import { useState, useEffect, useCallback } from "react";
import { Topic, TopicListResponse } from "./hookType";
import { api } from "@/utils/axios.config";


interface UseTopicsReturn {
    data: Topic[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useTopics(): UseTopicsReturn {
    const [data, setData] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTopics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<TopicListResponse>(`${process.env.NEXT_PUBLIC_EVAL_URL}/topic`);
            setData(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch topics");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    return { data, isLoading, error, refetch: fetchTopics };
}