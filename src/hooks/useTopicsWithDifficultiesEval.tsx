// hooks/useTopicsWithDifficultyLevels.ts

import { useState, useCallback } from "react";
import { TopicWithDifficultyLevel } from "./hookType";
import { api } from "@/utils/axios.config";


interface UseTopicsWithDifficultyLevelsReturn {
    fetchTopics: (search?: string) => Promise<TopicWithDifficultyLevel[] | null>;
    data: TopicWithDifficultyLevel[];
    isLoading: boolean;
    error: string | null;
}

export const useTopicsWithDifficultyLevels =
    (): UseTopicsWithDifficultyLevelsReturn => {
        const [data, setData] = useState<TopicWithDifficultyLevel[]>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);

        const fetchTopics = useCallback(
            async (search?: string): Promise<TopicWithDifficultyLevel[] | null> => {
                setIsLoading(true);
                setError(null);

                try {
                    const response = await api.get<TopicWithDifficultyLevel[]>(
                        `${process.env.NEXT_PUBLIC_EVAL_URL}/topic/with-difficulty-levels`,
                        {
                            params: search ? { search } : undefined,
                        }
                    );
                    setData(response.data);
                    return response.data;
                } catch (err) {
                    const message =
                        err instanceof Error ? err.message : "Failed to fetch topics";
                    setError(message);
                    return null;
                } finally {
                    setIsLoading(false);
                }
            },
            []
        );

        return { fetchTopics, data, isLoading, error };
    };