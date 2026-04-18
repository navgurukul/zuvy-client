'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface MentorCreatedSlot {
    id: number
    mentorSlotManagementId: number
    slotStartDateTime: string
    slotEndDateTime: string
    durationMinutes: number
    maxCapacity: number
    currentBookedCount: number
    status: string
}

export interface MentorSlotMetrics {
    totalSlots: number
    available: number
    full: number
    completed: number
    closed: number
    hours: number
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
      }

export interface MyMentorSlotsFilters {
    weekOffset?: number
}

export interface MyMentorSlotsResponse {
    slots: MentorCreatedSlot[]
    metrics: MentorSlotMetrics | null
    weekStart: string | null
    weekEnd: string | null
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
        }
    }

    return {
        slots: parseMySlotsResponse(response),
        metrics: response?.metrics ?? null,
        weekStart: response?.weekStart ?? null,
        weekEnd: response?.weekEnd ?? null,
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
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getMySlots = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get<MyMentorSlotsApiResponse>(
                '/mentor-slots/my',
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
        } catch (error) {
            console.error('Error fetching my mentor slots:', error)
            setSlots([])
            setMetrics(null)
            setWeekStart(null)
            setWeekEnd(null)
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
        loading,
        error,
        refetchMySlots: getMySlots,
        upsertMySlot,
    }
}