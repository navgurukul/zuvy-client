import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'

interface UseOpenEndedQuestionsProps {
    orgId: number | string
    selectedTopics?: Array<{ id?: number; value?: string }>
    selectedDifficulties?: string[]
    searchTerm?: string
    offset?: number
    position?: string | number
    initialFetch?: boolean
}

interface FetchedData {
    data: any[]
    totalRows?: number
    totalPages?: number
    error?: any
}

export default function useOpenEndedQuestions({
    orgId,
    selectedTopics = [],
    selectedDifficulties = [],
    searchTerm = '',
    offset = 0,
    position,
    initialFetch = true,
}: UseOpenEndedQuestionsProps) {
    const [openEndedQuestions, setOpenEndedQuestions] = useState<any[]>([])
    const [totalRows, setTotalRows] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<any>(null)

    const lastSignatureRef = useRef<string>('')

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
                if (d && d !== 'None') {
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

    const fetchOpenEndedQuestions = useCallback(
        async (opts?: {
            topics?: typeof selectedTopics
            difficulties?: typeof selectedDifficulties
            search?: string
            off?: number
            pos?: string | number
        }): Promise<FetchedData> => {
            const qs = buildQuery(opts)
            const signature = getSignature(qs)

            if (signature === lastSignatureRef.current) {
                return { data: openEndedQuestions, totalRows, totalPages }
            }

            try {
                setLoading(true)
                setError(null)

                const url = `/content/${orgId}/openEndedQuestions${qs ? `?${qs}` : ''}`
                const res = await api.get(url)
                const data = res?.data?.data || []
                const total = res?.data?.totalRows || 0
                const pages = res?.data?.totalPages || 0

                setOpenEndedQuestions(data)
                setTotalRows(total)
                setTotalPages(pages)
                lastSignatureRef.current = signature

                return { data, totalRows: total, totalPages: pages }
            } catch (err) {
                setError(err)
                return { data: [], error: err }
            } finally {
                setLoading(false)
            }
        },
        [buildQuery, getSignature, orgId, openEndedQuestions, totalRows, totalPages]
    )

    const refetch = useCallback(() => fetchOpenEndedQuestions(), [fetchOpenEndedQuestions])

    useEffect(() => {
        if (!initialFetch) return
        fetchOpenEndedQuestions()
    }, [fetchOpenEndedQuestions, initialFetch])

    const memoized = useMemo(
        () => ({
            openEndedQuestions,
            totalRows,
            totalPages,
            loading,
            error,
            fetchOpenEndedQuestions,
            refetch,
        }),
        [openEndedQuestions, totalRows, totalPages, loading, error, fetchOpenEndedQuestions, refetch]
    )

    return memoized
}
