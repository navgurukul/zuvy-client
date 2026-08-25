'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type GradeLevel = {
  grade: string
  meaning: string
  hardship: string
}

export type QuestionResult = {
  questionId: number
  correctOption: number
  selectedOption: number | null
  isCorrect: boolean
}

export type StudentAiAssessmentResult = {
  score: number
  totalQuestions: number
  percentage: number
  level: GradeLevel
  questions: QuestionResult[]
}

export function useGetStudentAiAssessmentResult() {
  const [result, setResult] = useState<StudentAiAssessmentResult | null>(null)
  const [isFetchingResult, setIsFetchingResult] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchResult = useCallback(async (assessmentId: number) => {
    if (!assessmentId || assessmentId <= 0) {
      setResult(null)
      setError(null)
      setIsFetchingResult(false)
      return null
    }

    try {
      setIsFetchingResult(true)
      setError(null)

      const response = await api.get<StudentAiAssessmentResult>(
        `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/result`,
        {
          params: {
            assessmentId,
          },
        }
      )

      const data = response.data

      // Validate response structure
      if (!data || typeof data.score !== 'number' || !Array.isArray(data.questions)) {
        throw new Error('Invalid result format received from server')
      }

      setResult(data)
      return data
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch assessment result'

      setError(errorMessage)
      setResult(null)
      return null
    } finally {
      setIsFetchingResult(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setIsFetchingResult(false)
  }, [])

  return {
    result,
    isFetchingResult,
    error,
    fetchResult,
    reset,
  }
}
