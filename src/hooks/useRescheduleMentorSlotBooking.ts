'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'

interface RescheduleBookingResponse {
    message?: string
    rescheduleStatus?: string
    sessionLifecycleState?: string
    slotAvailabilityId?: number
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to propose reschedule'
}

export function useRescheduleMentorSlotBooking() {
    const [isRescheduling, setIsRescheduling] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [responseData, setResponseData] =
        useState<RescheduleBookingResponse | null>(null)

    const runRescheduleAction = async (
        endpoint: string,
        payload?: Record<string, unknown>
    ): Promise<boolean> => {
        try {
            setIsRescheduling(true)
            setError(null)
            setResponseData(null)

            const response = await api.post<RescheduleBookingResponse>(
                endpoint,
                payload || {}
            )

            setResponseData(response.data || null)
            return true
        } catch (error) {
            console.error('Error updating reschedule state:', error)
            setError(getErrorMessage(error))
            return false
        } finally {
            setIsRescheduling(false)
        }
    }

    const proposeReschedule = async (
        bookingId: number,
        newSlotId: number,
        reason: string
    ): Promise<boolean> => {
        return runRescheduleAction(
            `/mentor-slots/${bookingId}/reschedule?slotId=${newSlotId}`,
            {
            reason,
            }
        )
    }

    const acceptReschedule = async (bookingId: number): Promise<boolean> => {
        return runRescheduleAction(
            `/mentor-slots/${bookingId}/reschedule/accept`
        )
    }

    const declineReschedule = async (bookingId: number): Promise<boolean> => {
        return runRescheduleAction(
            `/mentor-slots/${bookingId}/reschedule/decline`
        )
    }

    return {
        isRescheduling,
        error,
        responseData,
        proposeReschedule,
        acceptReschedule,
        declineReschedule,
    }
}