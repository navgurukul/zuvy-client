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
    isZoomMeet?: boolean | null
    joinedAt: string | null
    completedAt: string | null
    cancelledAt?: string | null
    cancellationReason?: string | null
    cancelledBy?: string | null
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
    studentRating?: number | null
    studentFeedback?: string | null
    studentFeedbackSubmittedAt?: string | null
    studentFeedbackLocked?: boolean | null
    mentorTitle?: string | null
    // Card fields (student My Sessions) - computed by the backend per booking
    displayState?: SessionDisplayState
    changesCloseAt?: string | null
    joinOpensAt?: string | null
    joinClosesAt?: string | null
    actions?: SessionCardActions
    message?: string | null
    reschedule?: {
        proposedStart: string | null
        proposedEnd: string | null
        replyBy: string | null
    } | null
    cancellation?: {
        by: 'you' | 'mentor' | 'ops'
        byName: string | null
        reason: string | null
        at: string | null
        creditReturned: boolean
    } | null
    recording?: { state: RecordingState; url: string | null } | null
    usesCredit?: boolean
    rescheduleOutcome?: {
        status: 'accepted' | 'declined' | 'expired'
        message: string
    } | null
}

export type SessionDisplayState =
    | 'UPCOMING'
    | 'STARTING_SOON'
    | 'IN_PROGRESS'
    | 'RESCHEDULE_REQUESTED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'MISSED'

export type RecordingState = 'NOT_YET' | 'PROCESSING' | 'READY' | 'NONE' | 'NOT_HELD'

export interface SessionCardAction {
    allowed: boolean
    reason: string | null
}

export interface SessionCardActions {
    join: SessionCardAction & { url: string | null }
    reschedule: SessionCardAction
    cancel: SessionCardAction
    viewRecording: SessionCardAction & { url: string | null }
    giveFeedback: SessionCardAction
}

/** The student's credits, sent with GET /student/mentor-sessions/my. */
export interface MentorSessionCredits {
    creditsAssigned: number
    creditsUsed: number
    creditsLeft: number
    nextEligibleDate: string | null
    canBook: boolean
    blockReason: string | null
}

/** Booking rules, sent with GET /student/mentor-sessions/my, e.g. { noticeHours: 72, joinOpenMinutes: 10 } */
export interface MentorSessionRules {
    noticeHours?: number
    joinOpenMinutes?: number
}

type WrappedMyMentorSession = Partial<Omit<MyMentorSession, 'id'>> & {
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
    missed?: string | number
}

type MyMentorSessionsResponse =
    | MyMentorSessionsPayload
    | {
          data: MyMentorSessionsPayload
          counts?: SessionCounts
          credits?: MentorSessionCredits
          rules?: MentorSessionRules
      }

const parseCreditsResponse = (
    response: MyMentorSessionsResponse
): MentorSessionCredits | null => {
    if (!response || Array.isArray(response)) return null
    return response.credits ?? null
}

const parseRulesResponse = (
    response: MyMentorSessionsResponse
): MentorSessionRules | null => {
    if (!response || Array.isArray(response)) return null
    return response.rules ?? null
}

const isWrappedSession = (
    value: MyMentorSession | WrappedMyMentorSession
): value is WrappedMyMentorSession => {
    return !!value && typeof value === 'object' && 'booking' in value
}

const normalizeSession = (
    value: MyMentorSession | WrappedMyMentorSession
): MyMentorSession => {
    if (isWrappedSession(value)) {
        // Keep the card fields that sit beside `booking` (displayState, actions, ...)
        const { booking: _booking, ...cardFields } = value
        return {
            ...cardFields,
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
    | '/student/mentor-sessions/my'
    | '/instructor/mentor-sessions/my'

export type SessionFilter =
    | 'all'
    | 'upcoming'
    | 'completed'
    | 'cancelled'
    | 'reschedule'
    | 'missed'

export type SessionSortOrder = 'asc' | 'desc'

export function useMyMentorSessions(
    initialFetch: boolean,
    endpoint: MyMentorSessionsEndpoint,
    filter?: SessionFilter,
    sort?: SessionSortOrder
) {
    const [sessions, setSessions] = useState<MyMentorSession[]>([])
    const [counts, setCounts] = useState<SessionCounts>({})
    const [credits, setCredits] = useState<MentorSessionCredits | null>(null)
    const [rules, setRules] = useState<MentorSessionRules | null>(null)
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
            setCredits(parseCreditsResponse(response.data))
            setRules(parseRulesResponse(response.data))
        } catch (error) {
            console.error('Error fetching my mentor sessions:', error)
            setSessions([])
            setCounts({})
            setCredits(null)
            setRules(null)
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
        credits,
        rules,
        loading,
        error,
        refetchMySessions: getMySessions,
    }
}