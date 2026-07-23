import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
import { UseQuizQuestionsProps, UseQuizQuestionsReturn } from './hookType'

export default function useQuizQuestions({
    orgId,
    selectedTopics = [],
    selectedDifficulties = [],
    searchTerm = '',
    initialFetch = true,
}: UseQuizQuestionsProps): UseQuizQuestionsReturn {
    const [quizQuestions, setQuizQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<any>(null)

    const lastSignatureRef = useRef<string>('')

    const buildQuery = useCallback(
        (opts?: {
            topics?: Array<{ id?: number; value?: string }>
            difficulties?: string[]
            search?: string
        }) => {
            const topics = opts?.topics ?? selectedTopics
            const difficulties = opts?.difficulties ?? selectedDifficulties
            const search = opts?.search ?? searchTerm
            const params: string[] = []

            topics?.forEach((topic: any) => {
                const id = topic?.id ?? (topic?.value ? Number(topic.value) : undefined)
                if (id !== undefined && id !== -1 && id !== 0) {
                    params.push(`tagId=${id}`)
                }
            })

            difficulties?.forEach((difficulty: any) => {
                if (difficulty && difficulty !== 'Any Difficulty') {
                    params.push(`difficulty=${encodeURIComponent(difficulty)}`)
                }
            })

            if (search && search.trim()) {
                params.push(`searchTerm=${encodeURIComponent(search.trim())}`)
            }

            return params.length > 0 ? params.join('&') : ''
        },
        [selectedTopics, selectedDifficulties, searchTerm]
    )

    const getSignature = useCallback(
        (queryString: string) => `${orgId}::${queryString}`,
        [orgId]
    )

    const fetchQuizQuestions = useCallback(
        async (opts?: {
            topics?: Array<{ id?: number; value?: string }>
            difficulties?: string[]
            search?: string
        }) => {
            const qs = buildQuery(opts)
            const signature = getSignature(qs)

            if (signature === lastSignatureRef.current) {
                return { data: quizQuestions }
            }

            try {
                setLoading(true)
                setError(null)

                const url = `/Content/${orgId}/allQuizQuestions${qs ? `?${qs}` : ''}`
                const res = await api.get(url)
                const data = res?.data?.data || []
                setQuizQuestions(data)
                lastSignatureRef.current = signature
                return { data }
            } catch (err) {
                setError(err)
                return { data: [], error: err }
            } finally {
                setLoading(false)
            }
        },
        [buildQuery, getSignature, orgId, quizQuestions]
    )

    const refetch = useCallback(() => fetchQuizQuestions(), [fetchQuizQuestions])

    useEffect(() => {
        if (!initialFetch) return
        fetchQuizQuestions()
    }, [fetchQuizQuestions, initialFetch])

    return useMemo(
        () => ({ quizQuestions, loading, error, fetchQuizQuestions, refetch }),
        [quizQuestions, loading, error, fetchQuizQuestions, refetch]
    )
}
