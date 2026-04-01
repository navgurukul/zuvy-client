'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'

interface PublishAssessmentPayload {
  endDatetime: string
}

interface PublishAssessmentResponse {
  message?: string
  success?: boolean
  [key: string]: any
}

interface UsePublishAssessmentReturn {
  publishAssessment: (assessmentId: number, payload: PublishAssessmentPayload) => Promise<PublishAssessmentResponse>
  isLoading: boolean
  error: string | null
}

export const usePublishAssessment = (): UsePublishAssessmentReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const publishAssessment = async (
    assessmentId: number,
    payload: PublishAssessmentPayload
  ): Promise<PublishAssessmentResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post<PublishAssessmentResponse>(
        `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/${assessmentId}/publish`,
        payload 
      )

      console.log('✅ Assessment published successfully:', response.data)
      return response.data
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to publish assessment'
      setError(errorMessage)
      console.error('❌ Failed to publish assessment:', errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    publishAssessment,
    isLoading,
    error,
  }
}
