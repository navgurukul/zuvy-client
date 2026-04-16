'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface SessionMetrics {
    total: string | number
    completed: string | number
    cancelled: string | number
    missed: string | number
    completionRate: string | number
    cancellationRate: string | number
}

export interface RatingMetrics {
    averageRating: string | number
    totalRatings: string | number
}

export interface UtilizationMetrics {
    totalSlots: string | number
    usedSlots: string | number
    utilizationRate: string | number
}

export interface MentorMetrics {
    sessions: SessionMetrics
    ratings: RatingMetrics
    upcomingSessions: string | number
    utilization: UtilizationMetrics
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch mentor metrics'
}

export function useMentorMetrics(initialFetch = true) {
    const [metrics, setMetrics] = useState<MentorMetrics | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getMetrics = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get<MentorMetrics>('/mentor-slots/metrics/me')
            setMetrics(response.data)
        } catch (error) {
            console.error('Error fetching mentor metrics:', error)
            setMetrics(null)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [])

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
