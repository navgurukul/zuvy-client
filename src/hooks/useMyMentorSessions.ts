'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
    // Mentor side only (GET /instructor/mentor-sessions/my)
    student?: MentorSessionStudent | null
    studentCredits?: MentorSessionCredits | null
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

/** displayState on GET /instructor/mentor-sessions/my (mentor's card). */
export type MentorSessionDisplayState =
    | 'UPCOMING'
    | 'STARTING_SOON'
    | 'IN_PROGRESS'
    | 'ACTION_NEEDED' // a student's reschedule request waits for the mentor
    | 'COMPLETED'
    | 'MISSED'
    | 'CANCELLED'

/**
 * Actions on a mentor's session card (GET /instructor/mentor-sessions/my).
 * The join link comes from GET .../bookings/:bookingId/join-link, not from here.
 */
export interface MentorSessionCardActions {
    join: SessionCardAction
    cancel: SessionCardAction
    acceptReschedule: SessionCardAction
    declineReschedule: SessionCardAction
    viewRecording: SessionCardAction & { url: string | null }
    giveFeedback: SessionCardAction
}

/** The student on a mentor's session, e.g. "React Bootcamp · Batch A". */
export interface MentorSessionStudent {
    userId: number | string
    name: string | null
    bootcampName: string | null
    batchName: string | null
}

/**
 * The student's credits: sent once with GET /student/mentor-sessions/my, and
 * per session as `studentCredits` with GET /instructor/mentor-sessions/my.
 */
export interface MentorSessionCredits {
    creditsAssigned: number
    creditsUsed: number
    creditsLeft: number
    nextEligibleDate: string | null
    canBook: boolean
    blockReason: string | null
}

/** Booking rules, sent with GET /student|instructor/mentor-sessions/my, e.g. { noticeHours: 72, joinOpenMinutes: 10 } */
export interface MentorSessionRules {
    noticeHours?: number
    joinOpenMinutes?: number
    maxAcceptedReschedules?: number
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
    actionNeeded?: string | number
    missed?: string | number
}

type MyMentorSessionsResponse =
    | MyMentorSessionsPayload
    | {
          data: MyMentorSessionsPayload
          counts?: SessionCounts
          credits?: MentorSessionCredits
          rules?: MentorSessionRules
          serverTime?: string
      }

const parseServerTime = (response: MyMentorSessionsResponse): string | null => {
    if (!response || Array.isArray(response)) return null
    return response.serverTime ?? null
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
/** booked (backend default): by booking time; start: by the session's slot start (no-slot rows last) */
export type SessionSortBy = 'start' | 'booked'

/** Rows per request; the hook pages through until the list is complete (the backend default is 10) */
const PAGE_SIZE = 50
const MAX_PAGES = 20
/** Refetch a little after a time boundary so the server sees the window as open/closed */
const BOUNDARY_GRACE_MS = 2000
/** setTimeout can't take much more than 24 days; re-plan at least this often */
const MAX_TIMER_MS = 6 * 60 * 60 * 1000

/**
 * The card actions (join, cancel, reschedule, accept/decline) are computed by the server at fetch time.
 * Returns the next moment, in server time, when one of them can change.
 */
const getNextBoundaryMs = (sessions: MyMentorSession[], serverNowMs: number): number | null => {
    let next: number | null = null
    sessions.forEach((session) => {
        const candidates = [
            session.joinOpensAt,
            session.joinClosesAt,
            session.changesCloseAt,
            session.reschedule?.replyBy,
            session.slotStart,
            session.slotEnd,
        ]
        candidates.forEach((value) => {
            if (!value) return
            const at = new Date(value).getTime()
            if (Number.isNaN(at) || at <= serverNowMs) return
            if (next === null || at < next) next = at
        })
    })
    return next
}

export function useMyMentorSessions(
    initialFetch: boolean,
    endpoint: MyMentorSessionsEndpoint,
    filter?: SessionFilter,
    sort?: SessionSortOrder,
    sortBy?: SessionSortBy
) {
    const [sessions, setSessions] = useState<MyMentorSession[]>([])
    const [counts, setCounts] = useState<SessionCounts>({})
    const [credits, setCredits] = useState<MentorSessionCredits | null>(null)
    const [rules, setRules] = useState<MentorSessionRules | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)
    /** serverTime - device time, in ms, from the latest response */
    const [serverOffsetMs, setServerOffsetMs] = useState<number>(0)
    // Only the latest request may update state (tab switches can overlap)
    const latestRequestRef = useRef(0)

    /** silent: keep the current list on screen (no loading state) - used for the timed refreshes */
    const getMySessions = useCallback(async (options: { silent?: boolean } = {}) => {
        const requestId = ++latestRequestRef.current
        try {
            if (!options.silent) setLoading(true)
            setError(null)

            const allSessions: MyMentorSession[] = []
            let firstPage: MyMentorSessionsResponse | null = null
            let lastServerTime: string | null = null

            for (let page = 0; page < MAX_PAGES; page++) {
                const queryParams = new URLSearchParams()
                if (filter) {
                    queryParams.set('filter', filter)
                }
                if (sort) {
                    queryParams.set('sort', sort)
                }
                if (sortBy) {
                    queryParams.set('sortBy', sortBy)
                }
                queryParams.set('limit', String(PAGE_SIZE))
                queryParams.set('offset', String(page * PAGE_SIZE))

                const response = await api.get<MyMentorSessionsResponse>(`${endpoint}?${queryParams.toString()}`)
                if (requestId !== latestRequestRef.current) return

                if (page === 0) firstPage = response.data
                lastServerTime = parseServerTime(response.data) ?? lastServerTime
                const pageSessions = parseSessionsResponse(response.data)
                allSessions.push(...pageSessions)

                // A plain array response isn't paged; a short page is the last one
                if (Array.isArray(response.data) || pageSessions.length < PAGE_SIZE) break
            }

            // Drop duplicates if a row moved between pages while paging
            const seen = new Set<number>()
            const uniqueSessions = allSessions.filter((session) => {
                if (seen.has(session.id)) return false
                seen.add(session.id)
                return true
            })

            setSessions(uniqueSessions)
            setCounts(firstPage ? parseCountsResponse(firstPage) : {})
            setCredits(firstPage ? parseCreditsResponse(firstPage) : null)
            setRules(firstPage ? parseRulesResponse(firstPage) : null)
            if (lastServerTime) {
                const serverMs = new Date(lastServerTime).getTime()
                if (!Number.isNaN(serverMs)) setServerOffsetMs(serverMs - Date.now())
            }
        } catch (error) {
            if (requestId !== latestRequestRef.current) return
            console.error('Error fetching my mentor sessions:', error)
            if (options.silent) return // keep the list on screen; the next refresh tries again
            setSessions([])
            setCounts({})
            setCredits(null)
            setRules(null)
            setError(getErrorMessage(error))
        } finally {
            if (requestId === latestRequestRef.current && !options.silent) setLoading(false)
        }
    }, [endpoint, filter, sort, sortBy])

    useEffect(() => {
        if (initialFetch) getMySessions()
    }, [initialFetch, getMySessions])

    // Refresh quietly when the next join / cancel / reschedule window opens or closes
    useEffect(() => {
        if (!initialFetch || loading || error) return
        const serverNowMs = Date.now() + serverOffsetMs
        const nextBoundaryMs = getNextBoundaryMs(sessions, serverNowMs)
        if (nextBoundaryMs === null) return

        const delay = Math.min(nextBoundaryMs - serverNowMs + BOUNDARY_GRACE_MS, MAX_TIMER_MS)
        const timer = setTimeout(() => {
            getMySessions({ silent: true })
        }, delay)
        return () => clearTimeout(timer)
    }, [initialFetch, loading, error, sessions, serverOffsetMs, getMySessions])

    return {
        sessions,
        counts,
        credits,
        rules,
        loading,
        error,
        serverOffsetMs,
        refetchMySessions: getMySessions,
    }
}