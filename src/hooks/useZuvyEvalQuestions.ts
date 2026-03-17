'use client'

import { useCallback, useEffect, useState } from 'react'

export interface ZuvyEvalQuestion {
    id: number
    domainName: string
    topicName: string
    question: string
    difficulty: string
}

interface UseZuvyEvalQuestionsOptions {
    page?: number
    limit?: number
    enabled?: boolean
}

export function useZuvyEvalQuestions(options: UseZuvyEvalQuestionsOptions = {}) {
    const { page = 1, limit = 20, enabled = false } = options

    const [questions, setQuestions] = useState<ZuvyEvalQuestion[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(0)
    const [totalPages, setTotalPages] = useState(0)


    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const accessToken =
                typeof window !== 'undefined'
                    ? localStorage.getItem('access_token')
                    : null

            const response = await fetch(
                `http://localhost:5000/questions?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                    
                }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch Zuvy Eval questions')
            }

            const payload = await response.json()
            console.log('Fetched Zuvy Eval questions:', payload)
            const data = Array.isArray(payload?.data) ? payload.data : []

            const mappedData: ZuvyEvalQuestion[] = data.map((item: any) => ({
                id: item.id,
                domainName: item.domainName || 'No Domain',
                topicName: item.topicName || 'No Topic',
                question: item.question || '',
                difficulty: item.difficulty || 'N/A',
            }))

            setQuestions(mappedData)
            setTotalCount(payload?.totalCount || 0)
            setTotalPages(payload?.totalPages || Math.ceil((payload?.totalCount || 0) / limit))
        } catch (err: any) {
            setQuestions([])
            setError(err?.message || 'Failed to fetch Zuvy Eval questions')
        } finally {
            setLoading(false)
        }
    }, [page, limit])

    useEffect(() => {
        if (enabled) {
            fetchQuestions()
        }
    }, [enabled, fetchQuestions])

    return {
        questions,
        loading,
        error,
        totalCount,
        totalPages,
        refetch: fetchQuestions,
    }
}
