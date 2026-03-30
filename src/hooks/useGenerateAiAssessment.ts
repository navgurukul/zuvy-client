'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type GenerateAiAssessmentPayload = {
    bootcampId: number
    scope: 'domain'
    chapterId: number
    domainId: number
    title: string
    description: string
    audience: string
    totalNumberOfQuestions: number
}

export type AiAssessmentData = {
    id: number
    bootcampId: number
    scope: string
    domainId: number
    title: string
    description: string
    audience: string
    totalNumberOfQuestions: number
    totalQuestionsWithBuffer?: number
    startDatetime?: string | null
    endDatetime?: string | null
    publishedAt?: string | null
    createdAt?: string
    updatedAt?: string
    [key: string]: unknown
}

export type GenerateAiAssessmentResponse = {
    message: string
    data: AiAssessmentData
    totalAssignedStudents?: number
    [key: string]: unknown
}

export type MapQuestionsPayload = {
    aiAssessmentId: number
}

export type MapQuestionsResponse = {
    aiAssessmentId: number
    isBaseline: boolean
    setsCreated: number
    totalQuestionsPerSet: number
    commonPerSet: number
    uniquePerSet: number
    message?: string
    [key: string]: unknown
}

export type GenerateAndMapAssessmentResponse = {
    createResponse: GenerateAiAssessmentResponse
    mapResponse: MapQuestionsResponse
}

export type AiGenerationPhase =
    | 'idle'
    | 'creating-assessment'
    | 'mapping-questions'

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
                    'http://localhost:5000/ai-assessment',
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
                    'http://localhost:5000/ai-assessment/map-questions',
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
