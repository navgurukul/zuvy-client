import { useState, useCallback } from "react";

import { api } from "@/utils/axios.config";
import { MapQuestionsApiResponse, MapQuestionsRequestBody } from "./hookType";

interface UseMapQuestionsResult {
    mapQuestions: (
        body: MapQuestionsRequestBody
    ) => Promise<MapQuestionsApiResponse | null>;
    isMapping: boolean;
    mapError: string | null;
    mappedResult: MapQuestionsApiResponse | null;
}

export function useMapQuestions(): UseMapQuestionsResult {
    const [mappedResult, setMappedResult] =
        useState<MapQuestionsApiResponse | null>(null);
    const [isMapping, setIsMapping] = useState<boolean>(false);
    const [mapError, setMapError] = useState<string | null>(null);

    const mapQuestions = useCallback(
        async (
            body: MapQuestionsRequestBody
        ): Promise<MapQuestionsApiResponse | null> => {
            setIsMapping(true);
            setMapError(null);
            try {
                const response = await api.post<MapQuestionsApiResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/map-questions`,
                    body
                );
                setMappedResult(response.data);
                return response.data;
            } catch (err) {
                setMapError(
                    err instanceof Error ? err.message : "Failed to map questions"
                );
                return null;
            } finally {
                setIsMapping(false);
            }
        },
        []
    );

    return { mapQuestions, isMapping, mapError, mappedResult };
}