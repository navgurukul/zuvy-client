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
    errorMessage?: string
    statusCode?: number
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

const getErrorStatusCode = (error: unknown): number | undefined => {
    const status = (error as { response?: { status?: number } })?.response?.status
    return typeof status === 'number' ? status : undefined
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
                '/instructor/mentor-slots/create',
                payload,
                {
                    validateStatus: (status) => status < 500,
                }
            )

            if (response.status >= 400) {
                const errorMessage =
                    (response.data as { message?: string })?.message ||
                    'Failed to create slot'

                setError(errorMessage)
                return {
                    success: false,
                    slot: null,
                    errorMessage,
                    statusCode: response.status,
                }
            }

            const slot = parseCreateSlotResponse(response.data)
            setCreatedSlot(slot)
            return {
                success: true,
                slot,
                errorMessage: undefined,
                statusCode: undefined,
            }
        } catch (error) {
            console.error('Error creating mentor slot:', error)
            const errorMessage = getErrorMessage(error)
            const statusCode = getErrorStatusCode(error)

            setError(errorMessage)
            return {
                success: false,
                slot: null,
                errorMessage,
                statusCode,
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