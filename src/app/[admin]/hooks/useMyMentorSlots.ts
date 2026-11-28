'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import { MentorSlotMetrics } from './hookType'

export interface MentorCreatedSlot {
    id: number
    mentorSlotManagementId: number
    slotStartDateTime: string
    slotEndDateTime: string
    durationMinutes: number
    maxCapacity: number
    currentBookedCount: number
    status: string
    // NEW (MT2), worked out by the backend per slot
    state?: MentorSlotState
    /** Students can book this slot until then (noticeHours before it starts). */
    bookableUntil?: string | null
    canRemove?: boolean
    removeBlockedReason?: 'SLOT_BOOKED' | 'SLOT_PAST' | null
    /** The line for the Slot Details panel, e.g. "Students can book this slot until ..." */
    message?: string | null
    students?: MentorSlotStudent[]
}

export type MentorSlotState = 'open' | 'tooSoonToBook' | 'booked' | 'held' | 'past'

export interface MentorSlotStudent {
    bookingId: number
    userId: string | number
    name: string | null
    /** e.g. "Karan P." */
    shortName: string | null
}

/** "5 slots this week · 2 open · 2 booked" */
export interface MentorSlotsSummary {
    slots: number
    open: number
    tooSoonToBook: number
    booked: number
    held: number
    past: number
}

/** Every rule number from the backend's config (the same set on every mentorship response) */
export interface MentorSlotsRules {
    totalCredits?: number
    gapDays?: number
    noticeHours?: number
    joinOpenMinutes?: number
    maxAcceptedReschedules?: number
    minSlotLeadDays?: number
    creditsCountedFrom?: string
    /** Cancel and reschedule reasons need at least this many characters */
    reasonMinLength?: number
}

type UpsertMySlotPayload = Omit<MentorCreatedSlot, 'mentorSlotManagementId'> & {
    mentorSlotManagementId?: number
}

type MyMentorSlotsApiResponse =
    | MentorCreatedSlot[]
    | {
          data?: MentorCreatedSlot[]
          slots?: MentorCreatedSlot[]
          weekStart?: string
          weekEnd?: string
          metrics?: MentorSlotMetrics
          summary?: MentorSlotsSummary
          rules?: MentorSlotsRules
          earliestNewSlotStart?: string
      }

export interface MyMentorSlotsFilters {
    weekOffset?: number
}

export interface MyMentorSlotsResponse {
    slots: MentorCreatedSlot[]
    metrics: MentorSlotMetrics | null
    weekStart: string | null
    weekEnd: string | null
    summary: MentorSlotsSummary | null
    rules: MentorSlotsRules | null
    earliestNewSlotStart: string | null
}

const parseMySlotsResponse = (
    response: MyMentorSlotsApiResponse
): MentorCreatedSlot[] => {
    if (Array.isArray(response)) {
        return response
    }

    if (response && Array.isArray(response.slots)) {
        return response.slots
    }

    if (response && Array.isArray(response.data)) {
        return response.data
    }

    return []
}

const parseMyMentorSlotsPayload = (
    response: MyMentorSlotsApiResponse
): MyMentorSlotsResponse => {
    if (Array.isArray(response)) {
        return {
            slots: response,
            metrics: null,
            weekStart: null,
            weekEnd: null,
            summary: null,
            rules: null,
            earliestNewSlotStart: null,
        }
    }

    return {
        slots: parseMySlotsResponse(response),
        metrics: response?.metrics ?? null,
        weekStart: response?.weekStart ?? null,
        weekEnd: response?.weekEnd ?? null,
        summary: response?.summary ?? null,
        rules: response?.rules ?? null,
        earliestNewSlotStart: response?.earliestNewSlotStart ?? null,
    }
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch slots'
}

export function useMyMentorSlots(
    initialFetch = true,
    filters?: MyMentorSlotsFilters
) {
    const [slots, setSlots] = useState<MentorCreatedSlot[]>([])
    const [metrics, setMetrics] = useState<MentorSlotMetrics | null>(null)
    const [weekStart, setWeekStart] = useState<string | null>(null)
    const [weekEnd, setWeekEnd] = useState<string | null>(null)
    const [summary, setSummary] = useState<MentorSlotsSummary | null>(null)
    const [rules, setRules] = useState<MentorSlotsRules | null>(null)
    const [earliestNewSlotStart, setEarliestNewSlotStart] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getMySlots = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get<MyMentorSlotsApiResponse>(
                '/instructor/mentor-slots/my',
                {
                    params: {
                        ...(typeof filters?.weekOffset === 'number'
                            ? { weekOffset: filters.weekOffset }
                            : {}),
                    },
                }
            )

            const payload = parseMyMentorSlotsPayload(response.data)

            setSlots(payload.slots)
            setMetrics(payload.metrics)
            setWeekStart(payload.weekStart)
            setWeekEnd(payload.weekEnd)
            setSummary(payload.summary)
            setRules(payload.rules)
            setEarliestNewSlotStart(payload.earliestNewSlotStart)
        } catch (error) {
            console.error('Error fetching my mentor slots:', error)
            setSlots([])
            setMetrics(null)
            setWeekStart(null)
            setWeekEnd(null)
            setSummary(null)
            setRules(null)
            setEarliestNewSlotStart(null)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [filters?.weekOffset])

    const upsertMySlot = useCallback((slot: UpsertMySlotPayload) => {
        const normalizedSlot: MentorCreatedSlot = {
            ...slot,
            mentorSlotManagementId: slot.mentorSlotManagementId ?? 0,
        }

        setSlots((previousSlots) => {
            const existingIndex = previousSlots.findIndex(
                (previousSlot) => previousSlot.id === normalizedSlot.id
            )

            if (existingIndex === -1) {
                return [...previousSlots, normalizedSlot]
            }

            const updatedSlots = [...previousSlots]
            updatedSlots[existingIndex] = normalizedSlot
            return updatedSlots
        })
    }, [])

    useEffect(() => {
        if (initialFetch) getMySlots()
    }, [initialFetch, getMySlots])

    return {
        slots,
        metrics,
        weekStart,
        weekEnd,
        summary,
        rules,
        earliestNewSlotStart,
        loading,
        error,
        refetchMySlots: getMySlots,
        upsertMySlot,
    }
}