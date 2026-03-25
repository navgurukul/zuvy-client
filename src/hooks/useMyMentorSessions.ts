'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface MyMentorSession {
    id: number
    slotAvailabilityId: number
    mentorUserId: number | string
    studentUserId?: number | string | null
    status: string
    sessionLifecycleState: string
    meetingLink?: string | null
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
    mentorName?: string | null
}

type WrappedMyMentorSession = {
    booking: MyMentorSession
    mentorName?: string | null
    studentName?: string | null
}

type MyMentorSessionsPayload = MyMentorSession[] | WrappedMyMentorSession[]

type MyMentorSessionsResponse =
    | MyMentorSessionsPayload
    | { data: MyMentorSessionsPayload }

const isWrappedSession = (
    value: MyMentorSession | WrappedMyMentorSession
): value is WrappedMyMentorSession => {
    return !!value && typeof value === 'object' && 'booking' in value
}

const normalizeSession = (
    value: MyMentorSession | WrappedMyMentorSession
): MyMentorSession => {
    if (isWrappedSession(value)) {
        return {
            ...value.booking,
            mentorName: value.mentorName ?? value.booking.mentorName ?? null,
            studentName: value.studentName ?? value.booking.studentName ?? null,
        }
    }

    return value
}

const parseSessionsResponse = (
    response: MyMentorSessionsResponse
): MyMentorSession[] => {
    if (Array.isArray(response)) {
        return response.map(normalizeSession)
    }

    if (response && Array.isArray(response.data)) {
        return response.data.map(normalizeSession)
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

export type SessionFilter =
    | 'all'
    | 'upcoming'
    | 'completed'
    | 'cancelled'
    | 'reschedule'

export function useMyMentorSessions(
    initialFetch: boolean,
    endpoint: MyMentorSessionsEndpoint,
    filter?: SessionFilter
) {
    const [sessions, setSessions] = useState<MyMentorSession[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getMySessions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const query = filter ? `?filter=${encodeURIComponent(filter)}` : ''
            const response = await api.get<MyMentorSessionsResponse>(`${endpoint}${query}`)

            setSessions(parseSessionsResponse(response.data))
        } catch (error) {
            console.error('Error fetching my mentor sessions:', error)
            setSessions([])
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [endpoint, filter])

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