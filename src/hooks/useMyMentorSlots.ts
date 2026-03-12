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

type MyMentorSlotsApiResponse = MentorCreatedSlot[] | { data: MentorCreatedSlot[] }

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

export function useMyMentorSlots(initialFetch = true) {
    const [slots, setSlots] = useState<MentorCreatedSlot[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getMySlots = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get<MyMentorSlotsApiResponse>(
                '/mentor-slots/my'
            )

            setSlots(parseMySlotsResponse(response.data))
        } catch (error) {
            console.error('Error fetching my mentor slots:', error)
            setSlots([])
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) getMySlots()
    }, [initialFetch, getMySlots])

    return {
        slots,
        loading,
        error,
        refetchMySlots: getMySlots,
    }
}