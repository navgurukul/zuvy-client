'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface MentorAvailabilitySlot {
    id: number
    slotStartDateTime: string
    slotEndDateTime: string
    durationMinutes: number
    maxCapacity: number
    currentBookedCount: number
    topic: string | null
    status: string
}

type MentorAvailabilityApiResponse =
    | MentorAvailabilitySlot[]
    | { data: MentorAvailabilitySlot[] }

const parseMentorAvailabilityResponse = (
    response: MentorAvailabilityApiResponse
): MentorAvailabilitySlot[] => {
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

    return message || 'Failed to fetch mentor availability'
}

export function useMentorAvailability(mentorId?: string, initialFetch = true) {
    const [availability, setAvailability] = useState<MentorAvailabilitySlot[]>(
        []
    )
    const [loading, setLoading] = useState<boolean>(!!initialFetch && !!mentorId)
    const [error, setError] = useState<string | null>(null)

    const getMentorAvailability = useCallback(async () => {
        if (!mentorId) {
            setLoading(false)
            setAvailability([])
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await api.get<MentorAvailabilityApiResponse>(
                `/mentors/${mentorId}/availability`
            )
            setAvailability(parseMentorAvailabilityResponse(response.data))
        } catch (error) {
            console.error('Error fetching mentor availability:', error)
            setAvailability([])
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [mentorId])

    useEffect(() => {
        if (initialFetch) getMentorAvailability()
    }, [initialFetch, getMentorAvailability])

    return {
        availability,
        loading,
        error,
        refetchMentorAvailability: getMentorAvailability,
    }
}