'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface QuestionOption {
  [key: string]: string
}

export interface Question {
  position: number
  isCommon: boolean
  questionId: number
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  language: string
  options: QuestionOption
  correctOption: number
  levelId: string
  domainName: string
  topicName: string
  topicDescription: string
}

export interface QuestionSet {
  id: number
  setIndex: number
  label: string
  levelCode: string
  status: string
  questions: Question[]
}

export interface GetQuestionSetsResponse {
  aiAssessmentId: number
  bootcampId: number
  title: string
  description: string
  totalNumberOfQuestions: number
  scope: string
  publishedAt: string | null
  isPublished: boolean
  setCount: number
  sets: QuestionSet[]
}

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
