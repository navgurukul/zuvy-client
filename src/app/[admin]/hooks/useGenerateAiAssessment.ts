'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { 
    AiGenerationPhase, 
    GenerateAiAssessmentResponse, 
    MapQuestionsResponse, 
    GenerateAiAssessmentPayload, 
    GenerateAndMapAssessmentResponse,
    MapQuestionsPayload
} from './hookType'

export function useGenerateAiAssessment() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationPhase, setGenerationPhase] =
        useState<AiGenerationPhase>('idle')
    const [error, setError] = useState<string | null>(null)
    const [generatedAssessment, setGeneratedAssessment] =
        useState<GenerateAiAssessmentResponse | null>(null)
    const [mappedQuestionsResponse, setMappedQuestionsResponse] =
        useState<MapQuestionsResponse | null>(null)

    const generateAssessment = useCallback(
        async (
            payload: GenerateAiAssessmentPayload
        ): Promise<GenerateAndMapAssessmentResponse> => {
            try {
                setIsGenerating(true)
                setGenerationPhase('creating-assessment')
                setError(null)
                setGeneratedAssessment(null)
                setMappedQuestionsResponse(null)

                const createResponse = await api.post<GenerateAiAssessmentResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment`,
                    payload
                )

                const createdData = createResponse.data
                setGeneratedAssessment(createdData)

                const aiAssessmentId = createdData?.data?.id

                if (!aiAssessmentId || Number.isNaN(Number(aiAssessmentId))) {
                    throw new Error(
                        'Unable to map questions: invalid ai assessment id in response'
                    )
                }

                const mapPayload: MapQuestionsPayload = {
                    aiAssessmentId: Number(aiAssessmentId),
                }

                setGenerationPhase('mapping-questions')

                const mapResponse = await api.post<MapQuestionsResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/map-questions`,
                    mapPayload
                )

                setMappedQuestionsResponse(mapResponse.data)

                return {
                    createResponse: createdData,
                    mapResponse: mapResponse.data,
                }
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to generate assessment'
                setError(errorMessage)
                throw err
            } finally {
                setIsGenerating(false)
                setGenerationPhase('idle')
            }
        },
        []
    )

    return {
        generateAssessment,
        isGenerating,
        generationPhase,
        error,
        generatedAssessment,
        mappedQuestionsResponse,
    }
}
