'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import { StudentMentorMetrics } from './hookTypes'

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch student mentor metrics'
}

export function useStudentMentorMetrics(initialFetch = true) {
    const [metrics, setMetrics] = useState<StudentMentorMetrics | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getStudentMentorMetrics = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get<StudentMentorMetrics>(
                '/student/mentor-slots/metrics'
            )

            setMetrics(response.data)
        } catch (error) {
            console.error('Error fetching student mentor metrics:', error)
            setMetrics(null)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) getStudentMentorMetrics()
    }, [initialFetch, getStudentMentorMetrics])

    return {
        metrics,
        loading,
        error,
        refetchStudentMentorMetrics: getStudentMentorMetrics,
    }
}
