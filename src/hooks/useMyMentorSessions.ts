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
    slotStart?: string | null
    slotEnd?: string | null
    mentorFeedback?: {
        notes?: string | null
        areasOfImprovement?: string | null
    } | null
    mentorRating?: number | null
}

type WrappedMyMentorSession = {
    booking: MyMentorSession
    mentorName?: string | null
    studentName?: string | null
    slotStart?: string | null
    slotEnd?: string | null
}

type MyMentorSessionsPayload = MyMentorSession[] | WrappedMyMentorSession[]

export interface SessionCounts {
    total?: string | number
    upcoming?: string | number
    completed?: string | number
    cancelled?: string | number
    reschedule?: string | number
}

type MyMentorSessionsResponse =
    | MyMentorSessionsPayload
    | { data: MyMentorSessionsPayload; counts?: SessionCounts }

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
            slotStart: value.slotStart ?? value.booking.slotStart ?? null,
            slotEnd: value.slotEnd ?? value.booking.slotEnd ?? null,
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

const parseCountsResponse = (
    response: MyMentorSessionsResponse
): SessionCounts => {
    if (!response || typeof response !== 'object') {
        return {}
    }

    const responseWithCounts = response as { counts?: SessionCounts }
    return responseWithCounts.counts || {}
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

export type SessionSortOrder = 'asc' | 'desc'

export function useMyMentorSessions(
    initialFetch: boolean,
    endpoint: MyMentorSessionsEndpoint,
    filter?: SessionFilter,
    sort?: SessionSortOrder
) {
    const [sessions, setSessions] = useState<MyMentorSession[]>([])
    const [counts, setCounts] = useState<SessionCounts>({})
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getMySessions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams()
            if (filter) {
                queryParams.set('filter', filter)
            }
            if (sort) {
                queryParams.set('sort', sort)
            }

            const query = queryParams.toString()
            const url = query ? `${endpoint}?${query}` : endpoint
            const response = await api.get<MyMentorSessionsResponse>(url)

            setSessions(parseSessionsResponse(response.data))
            setCounts(parseCountsResponse(response.data))
        } catch (error) {
            console.error('Error fetching my mentor sessions:', error)
            setSessions([])
            setCounts({})
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [endpoint, filter, sort])

    useEffect(() => {
        if (initialFetch) getMySessions()
    }, [initialFetch, getMySessions])

    return {
        sessions,
        counts,
        loading,
        error,
        refetchMySessions: getMySessions,
    }
}