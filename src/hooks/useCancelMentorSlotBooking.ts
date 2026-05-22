'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'

interface CancelBookingResponse {
    message: string
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to cancel booking'
}

export function useCancelMentorSlotBooking() {
    const [isCancelling, setIsCancelling] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const cancelBooking = async (
        bookingId: number,
        reason: string,
        cancelledBy: 'student' | 'mentor' = 'student',
        scope: 'student' | 'instructor' = 'student'
    ): Promise<boolean> => {
        try {
            setIsCancelling(true)
            setError(null)
            setMessage(null)

            const endpoint =
                scope === 'instructor'
                    ? `/instructor/mentor-slots/bookings/${bookingId}/cancel`
                    : `/student/mentor-slots/bookings/${bookingId}/cancel`

            const response = await api.post<CancelBookingResponse>(
                endpoint,
                {
                    reason,
                    cancelledBy,
                }
            )

            setMessage(response.data?.message || 'Booking cancelled successfully.')
            return true
        } catch (error) {
            console.error('Error cancelling booking:', error)
            setError(getErrorMessage(error))
            return false
        } finally {
            setIsCancelling(false)
        }
    }

    return {
        isCancelling,
        error,
        message,
        cancelBooking,
    }
}