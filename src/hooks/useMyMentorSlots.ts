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

type UpsertMySlotPayload = Omit<MentorCreatedSlot, 'mentorSlotManagementId'> & {
    mentorSlotManagementId?: number
}

type MyMentorSlotsApiResponse = MentorCreatedSlot[] | { data: MentorCreatedSlot[] }

export interface MyMentorSlotsFilters {
    startDateTime?: string
    endDateTime?: string
}

const parseMySlotsResponse = (
    response: MyMentorSlotsApiResponse
): MentorCreatedSlot[] => {
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

    return message || 'Failed to fetch slots'
}

export function useMyMentorSlots(
    initialFetch = true,
    filters?: MyMentorSlotsFilters
) {
    const [slots, setSlots] = useState<MentorCreatedSlot[]>([])
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
                        ...(filters?.startDateTime
                            ? { startDateTime: filters.startDateTime }
                            : {}),
                        ...(filters?.endDateTime
                            ? { endDateTime: filters.endDateTime }
                            : {}),
                    },
                }
            )

            setSlots(parseMySlotsResponse(response.data))
        } catch (error) {
            console.error('Error fetching my mentor slots:', error)
            setSlots([])
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [filters?.endDateTime, filters?.startDateTime])

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
        loading,
        error,
        refetchMySlots: getMySlots,
        upsertMySlot,
    }
}