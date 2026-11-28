'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import { MentorMetrics } from './hookType'

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch mentor metrics'
}

/** GET /instructor/mentor-slots/metrics?filter=all|30d|3m */
export type MentorMetricsFilter = 'all' | '30d' | '3m'

export function useMentorMetrics(initialFetch = true, filter: MentorMetricsFilter = 'all') {
    const [metrics, setMetrics] = useState<MentorMetrics | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getMetrics = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get<MentorMetrics>(`/instructor/mentor-slots/metrics?filter=${filter}`)
            setMetrics(response.data)
        } catch (error) {
            console.error('Error fetching mentor metrics:', error)
            setMetrics(null)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [filter])

    useEffect(() => {
        if (initialFetch) getMetrics()
    }, [initialFetch, getMetrics])

    return {
        metrics,
        loading,
        error,
        refetchMetrics: getMetrics,
    }
}
