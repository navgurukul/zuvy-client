'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface RescheduleSlot {
    id: number
    slotStartDateTime: string
    slotEndDateTime: string
    durationMinutes: number
    maxCapacity: number
    currentBookedCount: number
    topic: string | null
    status: string
}

type RescheduleSlotApiResponse =
    | RescheduleSlot[]
    | { data: RescheduleSlot[] }

const parseRescheduleSlotResponse = (
    response: RescheduleSlotApiResponse
): RescheduleSlot[] => {
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

    return message || 'Failed to fetch reschedule slots'
}

export function useGetRescheduleSlots(
    bookingId?: number,
    initialFetch = true
) {
    const [slots, setSlots] = useState<RescheduleSlot[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch && !!bookingId)
    const [error, setError] = useState<string | null>(null)

    const getRescheduleSlots = useCallback(async () => {
        if (!bookingId) {
            setLoading(false)
            setSlots([])
            return
        }

        try {
            setLoading(true)
            setError(null)

            const url = `/student/mentor-slots/bookings/${bookingId}/reschedule/slots`
            const response = await api.get<RescheduleSlotApiResponse>(url)
            setSlots(parseRescheduleSlotResponse(response.data))
        } catch (error) {
            console.error('Error fetching reschedule slots:', error)
            setSlots([])
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [bookingId])

    useEffect(() => {
        if (initialFetch) getRescheduleSlots()
    }, [initialFetch, getRescheduleSlots])

    return {
        slots,
        loading,
        error,
        refetchSlots: getRescheduleSlots,
    }
}
