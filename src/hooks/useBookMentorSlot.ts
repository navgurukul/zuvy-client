'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'

export interface MentorSlotBooking {
    id: number
    slotAvailabilityId: number
    studentUserId: number
    mentorUserId: number
    organizationId: number
    status: string
    sessionLifecycleState: string
    bookedAt: string
    confirmedAt: string
}

type BookMentorSlotApiResponse = MentorSlotBooking | { data: MentorSlotBooking }

const parseBookingResponse = (
    response: BookMentorSlotApiResponse
): MentorSlotBooking | null => {
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

    return message || 'Failed to book slot'
}

export function useBookMentorSlot() {
    const [booking, setBooking] = useState<MentorSlotBooking | null>(null)
    const [isBooking, setIsBooking] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const bookSlot = async (slotId: number): Promise<MentorSlotBooking | null> => {
        try {
            setIsBooking(true)
            setError(null)

            const response = await api.post<BookMentorSlotApiResponse>(
                '/mentor-slots/book',
                { slotId }
            )

            const bookingData = parseBookingResponse(response.data)
            setBooking(bookingData)
            return bookingData
        } catch (error) {
            console.error('Error booking mentor slot:', error)
            setError(getErrorMessage(error))
            return null
        } finally {
            setIsBooking(false)
        }
    }

    return {
        booking,
        isBooking,
        error,
        bookSlot,
    }
}