import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'

interface UseCodingQuestionsProps {
    orgId: number | string
    selectedTopics?: Array<{ id?: number; value?: string }>
    selectedDifficulties?: string[]
    searchTerm?: string
    offset?: number
    position?: string | number
    initialFetch?: boolean
}

export default function useCodingQuestions({
    orgId,
    selectedTopics = [],
    selectedDifficulties = [],
    searchTerm = '',
    offset = 0,
    position,
    initialFetch = true,
}: UseCodingQuestionsProps) {
    const [codingQuestions, setCodingQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<any>(null)

    const lastSignatureRef = useRef<string>('')
    const inFlightSignatureRef = useRef<string>('')
    const latestResultRef = useRef<{ data: any[] }>({ data: [] })

    const buildQuery = useCallback(
        (ov?: {
            topics?: typeof selectedTopics
            difficulties?: typeof selectedDifficulties
            search?: string
            off?: number
            pos?: string | number
        }) => {
            const topics = ov?.topics ?? selectedTopics
            const difficulties = ov?.difficulties ?? selectedDifficulties
            const search = ov?.search ?? searchTerm
            const off = ov?.off ?? offset
            const pos = ov?.pos ?? position

            const params: string[] = []

            topics?.forEach((t: any) => {
                const id = t?.id ?? (t?.value ? Number(t.value) : undefined)
                if (id !== undefined && id !== -1 && id !== 0) {
                    params.push(`tagId=${id}`)
                }
            })

            difficulties?.forEach((d: any) => {
                if (d && d !== 'Any Difficulty') {
                    params.push(`difficulty=${encodeURIComponent(d)}`)
                }
            })

            if (search && search.trim()) {
                params.push(`searchTerm=${encodeURIComponent(search.trim())}`)
            }

            if (typeof pos !== 'undefined') {
                params.unshift(`limit=${pos}`)
            }
            if (typeof off !== 'undefined') {
                params.unshift(`offset=${off}`)
            }

            return params.length > 0 ? params.join('&') : ''
        },
        [selectedTopics, selectedDifficulties, searchTerm, offset, position]
    )

    const getSignature = useCallback(
        (queryString: string) => `${orgId}::${queryString}`,
        [orgId]
    )

    const fetchCodingQuestions = useCallback(
        async (opts?: {
            topics?: typeof selectedTopics
            difficulties?: typeof selectedDifficulties
            search?: string
            off?: number
            pos?: string | number
        }) => {
            const qs = buildQuery(opts)
            const signature = getSignature(qs)

            if (
                signature === lastSignatureRef.current ||
                signature === inFlightSignatureRef.current
            ) {
                // duplicate request, skip
                return latestResultRef.current
            }

            try {
                inFlightSignatureRef.current = signature
                setLoading(true)
                setError(null)

                const url = `/Content/${orgId}/allCodingQuestions${qs ? `?${qs}` : ''}`
                const res = await api.get(url)
                const data = res?.data?.data || []
                setCodingQuestions(data)
                lastSignatureRef.current = signature
                latestResultRef.current = { data }
                return { data }
            } catch (err) {
                setError(err)
                return { error: err }
            } finally {
                inFlightSignatureRef.current = ''
                setLoading(false)
            }
        },
        [buildQuery, getSignature, orgId]
    )

    const refetch = useCallback(() => fetchCodingQuestions(), [fetchCodingQuestions])

    useEffect(() => {
        if (!initialFetch) return
        // run initial fetch using current params
        fetchCodingQuestions()
    }, [fetchCodingQuestions, initialFetch])

    const memoized = useMemo(
        () => ({ codingQuestions, loading, error, fetchCodingQuestions, refetch }),
        [codingQuestions, loading, error, fetchCodingQuestions, refetch]
    )

    return memoized
}
