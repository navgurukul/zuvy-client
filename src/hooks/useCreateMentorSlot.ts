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
    | {
          data?: MentorAvailabilitySlot | MentorAvailabilitySlot[]
          slot?: MentorAvailabilitySlot
      }

interface CreateMentorSlotResult {
    success: boolean
    slot: MentorAvailabilitySlot | null
}

const hasSlotId = (value: unknown): value is MentorAvailabilitySlot => {
    return !!value && typeof value === 'object' && 'id' in value
}

const parseCreateSlotResponse = (
    response: CreateMentorSlotApiResponse
): MentorAvailabilitySlot | null => {
    if (hasSlotId(response)) {
        return response
    }

    if (!response || typeof response !== 'object') {
        return null
    }

    if ('slot' in response && hasSlotId(response.slot)) {
        return response.slot
    }

    if ('data' in response) {
        const responseData = response.data

        if (hasSlotId(responseData)) {
            return responseData
        }

        if (Array.isArray(responseData)) {
            return responseData.find(hasSlotId) || null
        }
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
    ): Promise<CreateMentorSlotResult> => {
        try {
            setIsCreating(true)
            setError(null)

            const response = await api.post<CreateMentorSlotApiResponse>(
                '/mentor-slots/create',
                payload
            )

            const slot = parseCreateSlotResponse(response.data)
            setCreatedSlot(slot)
            return {
                success: true,
                slot,
            }
        } catch (error) {
            console.error('Error creating mentor slot:', error)
            setError(getErrorMessage(error))
            return {
                success: false,
                slot: null,
            }
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