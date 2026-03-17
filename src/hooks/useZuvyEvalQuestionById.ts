'use client'

import { useCallback, useEffect, useState } from 'react'

export interface ZuvyEvalQuestionDetail {
    id: number
    domainName: string
    topicName: string
    question: string
    difficulty: string
    options: Record<string, string>
    correctOption: number
}

interface UseZuvyEvalQuestionByIdOptions {
    questionId: number
    enabled?: boolean
}

export function useZuvyEvalQuestionById({
    questionId,
    enabled = false,
}: UseZuvyEvalQuestionByIdOptions) {
    const [question, setQuestion] = useState<ZuvyEvalQuestionDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchQuestionById = useCallback(async () => {
        if (!questionId) {
            setQuestion(null)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const accessToken =
                typeof window !== 'undefined'
                    ? localStorage.getItem('access_token')
                    : null

            const response = await fetch(`http://localhost:5000/questions/${questionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
            })

            if (!response.ok) {
                throw new Error('Failed to fetch Zuvy Eval question details')
            }

            const payload = await response.json()

            setQuestion({
                id: payload?.id,
                domainName: payload?.domainName || 'No Domain',
                topicName: payload?.topicName || 'No Topic',
                question: payload?.question || '',
                difficulty: payload?.difficulty || 'N/A',
                options: payload?.options || {},
                correctOption: payload?.correctOption || 0,
            })
        } catch (err: any) {
            setQuestion(null)
            setError(err?.message || 'Failed to fetch Zuvy Eval question details')
        } finally {
            setLoading(false)
        }
    }, [questionId])

    useEffect(() => {
        if (enabled) {
            fetchQuestionById()
        }
    }, [enabled, fetchQuestionById])

    return {
        question,
        loading,
        error,
        refetch: fetchQuestionById,
    }
}
