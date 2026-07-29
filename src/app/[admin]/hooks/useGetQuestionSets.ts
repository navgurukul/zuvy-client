'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { GetQuestionSetsResponse } from './hookType'

export function useGetQuestionSets() {
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questionSets, setQuestionSets] = useState<GetQuestionSetsResponse | null>(null)

  const fetchQuestionSets = useCallback(
    async (aiAssessmentId: number): Promise<GetQuestionSetsResponse> => {
      try {
        setIsFetching(true)
        setError(null)
        setQuestionSets(null)

        const response = await api.get<GetQuestionSetsResponse>(
          `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/${aiAssessmentId}/question-sets`
        )

        const data = response.data
        setQuestionSets(data)
        return data
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch question sets'
        setError(errorMessage)
        throw err
      } finally {
        setIsFetching(false)
      }
    },
    []
  )

  return {
    fetchQuestionSets,
    isFetching,
    error,
    questionSets,
  }
}
