'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type AiAssessmentSummary = {
  id: number
  bootcampId: number
  chapterId: number
  scope: string
  domainId: number
  title: string
  description: string
  audience: string
  totalNumberOfQuestions: number
  totalQuestionsWithBuffer?: number
  startDatetime: string | null
  endDatetime: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export function useGetAiAssessments() {
  const [isFetchingAssessments, setIsFetchingAssessments] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assessments, setAssessments] = useState<AiAssessmentSummary[]>([])

  const fetchAssessments = useCallback(
    async (bootcampId: number, chapterId: number): Promise<AiAssessmentSummary[]> => {
      try {
        setIsFetchingAssessments(true)
        setError(null)

        const response = await api.get<AiAssessmentSummary[]>(
          'http://localhost:5000/ai-assessment',
          {
            params: {
              bootcampId,
              chapterId,
            },
          }
        )

        const data = Array.isArray(response.data) ? response.data : []
        setAssessments(data)
        return data
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch ai assessments'
        setError(errorMessage)
        throw err
      } finally {
        setIsFetchingAssessments(false)
      }
    },
    []
  )

  return {
    fetchAssessments,
    isFetchingAssessments,
    error,
    assessments,
  }
}
