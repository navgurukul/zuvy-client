'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export type StudentAiAssessment = {
  id: number
  bootcampId: number
  chapterId: number
  domainId: number
  title: string
  description: string
  totalNumberOfQuestions: number
  startDatetime: string | null
  endDatetime: string | null
  assessmentStatus: string
  studentStatus: number
  questionSetId: number
}

export function useGetStudentAiAssessments(
  bootcampId: number | null,
  chapterId: number | null,
  domainId: number | null
) {
  const [assessments, setAssessments] = useState<StudentAiAssessment[]>([])
  const [isFetchingAssessments, setIsFetchingAssessments] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAssessments = useCallback(async () => {
    if (!bootcampId || !chapterId || !domainId) {
      setAssessments([])
      setError(null)
      setIsFetchingAssessments(false)
      return []
    }

    try {
      setIsFetchingAssessments(true)
      setError(null)

      const response = await api.get<StudentAiAssessment[]>(
        `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/by/studentId`,
        {
          params: {
            bootcampId,
            chapterId,
            domainId,
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
        'Failed to fetch student AI assessments'

      setError(errorMessage)
      setAssessments([])
      return []
    } finally {
      setIsFetchingAssessments(false)
    }
  }, [bootcampId, chapterId, domainId])

  useEffect(() => {
    fetchAssessments()
  }, [fetchAssessments])

  return {
    assessments,
    isFetchingAssessments,
    error,
    refetchAssessments: fetchAssessments,
  }
}
