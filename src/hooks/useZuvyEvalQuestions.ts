'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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
    difficulty?: string
    enabled?: boolean
}

export function useZuvyEvalQuestions(options: UseZuvyEvalQuestionsOptions = {}) {
    const { page = 1, limit = 20, difficulty, enabled = false } = options

    const [questions, setQuestions] = useState<ZuvyEvalQuestion[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const latestRequestId = useRef(0)


    const fetchQuestions = useCallback(async () => {
        const requestId = ++latestRequestId.current

        try {
            setLoading(true)
            setError(null)

            const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
            const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20
            const normalizedDifficulty =
                typeof difficulty === 'string'
                    ? difficulty.trim().toLowerCase()
                    : ''
            const shouldApplyDifficulty =
                normalizedDifficulty.length > 0 &&
                normalizedDifficulty !== 'all' &&
                normalizedDifficulty !== 'none'

            const params = new URLSearchParams({
                page: String(safePage),
                limit: String(safeLimit),
            })

            if (shouldApplyDifficulty) {
                params.set('difficulty', normalizedDifficulty)
            }

            const baseUrl =
                process.env.NEXT_PUBLIC_LOCAL_URL?.trim() || 'http://localhost:5000'
            const requestUrl = `${baseUrl.replace(/\/$/, '')}/questions?${params.toString()}`

            const accessToken =
                typeof window !== 'undefined'
                    ? localStorage.getItem('access_token')
                    : null

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            }

            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`
            }

            const response = await fetch(
                requestUrl,
                {
                    method: 'GET',
                    headers,
                }
            )

            if (!response.ok) {
                let message = 'Failed to fetch Zuvy Eval questions'
                try {
                    const errorPayload = await response.json()
                    if (typeof errorPayload?.message === 'string' && errorPayload.message.trim()) {
                        message = errorPayload.message
                    }
                } catch {
                    // ignore invalid error payload
                }
                throw new Error(message)
            }

            const payload = await response.json()
            const data = Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.questions)
                    ? payload.questions
                    : []

            const mappedData: ZuvyEvalQuestion[] = data.map((item: any) => ({
                id: item.id,
                domainName: item.domainName || 'No Domain',
                topicName: item.topicName || 'No Topic',
                question: item.question || '',
                difficulty: item.difficulty || 'N/A',
            }))

            if (requestId !== latestRequestId.current) {
                return
            }

            setQuestions(mappedData)
            const safeTotalCount = Number(payload?.totalCount ?? payload?.totalRows ?? 0)
            const fallbackTotalCount = Number.isFinite(safeTotalCount) ? safeTotalCount : mappedData.length
            setTotalCount(fallbackTotalCount)
            const safeTotalPages = Number(payload?.totalPages)
            setTotalPages(
                Number.isFinite(safeTotalPages)
                    ? safeTotalPages
                    : Math.ceil(fallbackTotalCount / safeLimit)
            )
        } catch (err: any) {
            if (requestId !== latestRequestId.current) {
                return
            }
            setQuestions([])
            setError(err?.message || 'Failed to fetch Zuvy Eval questions')
        } finally {
            if (requestId === latestRequestId.current) {
                setLoading(false)
            }
        }
    }, [page, limit, difficulty])

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
