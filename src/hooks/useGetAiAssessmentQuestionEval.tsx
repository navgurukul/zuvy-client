'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type StudentAssessmentQuestion = {
  questionId: number
  position: number
  question: string
  options: Record<string, string>
  difficulty: string
  topic: string
  language: string
}

export type StudentAiAssessmentQuestionsResponse = {
  aiAssessmentId: number
  questionSetId: number
  studentStatus: number
  questions: StudentAssessmentQuestion[]
}

export function useGetStudentAiAssessmentQuestions() {
  const [questions, setQuestions] = useState<StudentAssessmentQuestion[]>([])
  const [assessmentMeta, setAssessmentMeta] = useState<
    Omit<StudentAiAssessmentQuestionsResponse, 'questions'> | null
  >(null)
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestions = useCallback(async (assessmentId: number) => {
    if (!assessmentId) {
      setQuestions([])
      setAssessmentMeta(null)
      setError(null)
      setIsFetchingQuestions(false)
      return []
    }

    try {
      setIsFetchingQuestions(true)
      setError(null)

      const response = await api.get<StudentAiAssessmentQuestionsResponse>(
        `${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/${assessmentId}/my-questions`
      )

      const data = response.data

      const safeQuestions = Array.isArray(data?.questions)
        ? [...data.questions].sort((a, b) => a.position - b.position)
        : []

      setAssessmentMeta({
        aiAssessmentId: Number(data?.aiAssessmentId ?? assessmentId),
        questionSetId: Number(data?.questionSetId ?? 0),
        studentStatus: Number(data?.studentStatus ?? 0),
      })
      setQuestions(safeQuestions)
      return safeQuestions
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch assessment questions'

      setError(errorMessage)
      setQuestions([])
      setAssessmentMeta(null)
      return []
    } finally {
      setIsFetchingQuestions(false)
    }
  }, [])

  return {
    questions,
    assessmentMeta,
    isFetchingQuestions,
    error,
    fetchQuestions,
  }
}
