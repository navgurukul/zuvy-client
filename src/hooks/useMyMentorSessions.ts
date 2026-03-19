'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface MyMentorSession {
    id: number
    slotAvailabilityId: number
    mentorUserId: number
    studentUserId?: number | null
    status: string
    sessionLifecycleState: string
    joinedAt: string | null
    completedAt: string | null
    cancelledAt?: string | null
    bookedAt?: string | null
    updatedAt?: string | null
    createdAt?: string | null
    studentName?: string | null
    studentUserName?: string | null
    studentFullName?: string | null
    learnerName?: string | null
}

type MyMentorSessionsResponse = MyMentorSession[] | { data: MyMentorSession[] }

const parseSessionsResponse = (
    response: MyMentorSessionsResponse
): MyMentorSession[] => {
    if (Array.isArray(response)) {
        return response
    }

    if (response && Array.isArray(response.data)) {
        return response.data
    }

    return []
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch sessions'
}

export type MyMentorSessionsEndpoint =
    | '/mentor-sessions/my'
    | '/mentor-sessions/mentor/my'

export function useMyMentorSessions(
    initialFetch: boolean,
    endpoint: MyMentorSessionsEndpoint
) {
    const [sessions, setSessions] = useState<MyMentorSession[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getMySessions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get<MyMentorSessionsResponse>(endpoint)

            setSessions(parseSessionsResponse(response.data))
        } catch (error) {
            console.error('Error fetching my mentor sessions:', error)
            setSessions([])
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [endpoint])

    useEffect(() => {
        if (initialFetch) getMySessions()
    }, [initialFetch, getMySessions])

    return {
        sessions,
        loading,
        error,
        refetchMySessions: getMySessions,
    }
}