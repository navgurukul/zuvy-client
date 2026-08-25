'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { QuestionExplanation, useExplanationStore } from '@/store/useExplanationStore'

export function useGetQuestionExplanation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addExplanation, getExplanation } = useExplanationStore()

  const fetchExplanation = useCallback(
    async (assessmentId: number, questionId: number): Promise<QuestionExplanation | null> => {
      // Check if explanation is already cached
      const cached = getExplanation(assessmentId, questionId)
      if (cached) {
        return cached
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await api.post<QuestionExplanation>(
          `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/questions/explain`,
          {
            assessmentId,
            questionId,
          }
        )

        const explanation = response.data

        // Store in Zustand
        addExplanation(assessmentId, explanation)

        return explanation
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch explanation'

        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [getExplanation, addExplanation]
  )

  return {
    fetchExplanation,
    isLoading,
    error,
  }
}
