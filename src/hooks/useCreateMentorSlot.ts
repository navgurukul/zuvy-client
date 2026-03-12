'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'
import type { MentorAvailabilitySlot } from './useMentorAvailability'

export interface CreateMentorSlotPayload {
    slotStartDateTime: string
    slotEndDateTime: string
    durationMinutes: number
}

type CreateMentorSlotApiResponse =
    | MentorAvailabilitySlot
    | { data: MentorAvailabilitySlot }

const parseCreateSlotResponse = (
    response: CreateMentorSlotApiResponse
): MentorAvailabilitySlot | null => {
    if (response && 'id' in response) {
        return response
    }

    if (response && 'data' in response && response.data) {
        return response.data
    }

    return null
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to create slot'
}

export function useCreateMentorSlot() {
    const [createdSlot, setCreatedSlot] = useState<MentorAvailabilitySlot | null>(
        null
    )
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const createSlot = async (
        payload: CreateMentorSlotPayload
    ): Promise<MentorAvailabilitySlot | null> => {
        try {
            setIsCreating(true)
            setError(null)

            const response = await api.post<CreateMentorSlotApiResponse>(
                '/mentor-slots/create',
                payload
            )

            const slot = parseCreateSlotResponse(response.data)
            setCreatedSlot(slot)
            return slot
        } catch (error) {
            console.error('Error creating mentor slot:', error)
            setError(getErrorMessage(error))
            return null
        } finally {
            setIsCreating(false)
        }
    }

    return {
        createdSlot,
        isCreating,
        error,
        createSlot,
    }
}