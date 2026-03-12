'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface MentorSlotDetailsSlot {
    id: number
    slotStartDateTime: string
    [key: string]: unknown
}

export interface MentorSlotDetailsBooking {
    id: number
    studentUserId: number
    status: string
    [key: string]: unknown
}

export interface MentorSlotDetailsData {
    slot: MentorSlotDetailsSlot | null
    bookings: MentorSlotDetailsBooking[]
}

type MentorSlotDetailsApiResponse =
    | MentorSlotDetailsData
    | { data: MentorSlotDetailsData }

const parseSlotDetailsResponse = (
    response: MentorSlotDetailsApiResponse
): MentorSlotDetailsData => {
    if (
        response &&
        'slot' in response &&
        'bookings' in response &&
        Array.isArray(response.bookings)
    ) {
        return {
            slot: response.slot || null,
            bookings: response.bookings,
        }
    }

    if (
        response &&
        'data' in response &&
        response.data &&
        Array.isArray(response.data.bookings)
    ) {
        return {
            slot: response.data.slot || null,
            bookings: response.data.bookings,
        }
    }

    return {
        slot: null,
        bookings: [],
    }
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch slot details'
}

export function useMentorSlotDetails(
    slotId?: number | string,
    initialFetch = true
) {
    const [details, setDetails] = useState<MentorSlotDetailsData | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch && !!slotId)
    const [error, setError] = useState<string | null>(null)

    const getSlotDetails = useCallback(
        async (targetSlotId?: number | string) => {
            const id = targetSlotId ?? slotId

            if (id === undefined || id === null || id === '') {
                setDetails(null)
                setLoading(false)
                return null
            }

            try {
                setLoading(true)
                setError(null)

                const response = await api.get<MentorSlotDetailsApiResponse>(
                    `/mentor-slots/${id}/details`
                )

                const parsedData = parseSlotDetailsResponse(response.data)
                setDetails(parsedData)
                return parsedData
            } catch (error) {
                console.error('Error fetching mentor slot details:', error)
                setDetails(null)
                setError(getErrorMessage(error))
                return null
            } finally {
                setLoading(false)
            }
        },
        [slotId]
    )

    useEffect(() => {
        if (initialFetch) getSlotDetails()
    }, [initialFetch, getSlotDetails])

    return {
        details,
        loading,
        error,
        refetchSlotDetails: getSlotDetails,
    }
}