'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { BookSlotError, BookSlotErrorCode, MentorSlotBooking } from './hookTypes'

type BookMentorSlotApiResponse = MentorSlotBooking | { data: MentorSlotBooking }

type BookSlotErrorBody = {
    statusCode?: number
    code?: string
    message?: string | string[]
    data?: Record<string, unknown>
}

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

/**
 * Used only if a refusal comes back without a message (the backend always sends one,
 * with the configured numbers). No rule numbers here: they belong to the backend.
 */
const BOOK_SLOT_ERROR_MESSAGES: Record<Exclude<BookSlotErrorCode, 'SLOT_UNAVAILABLE'>, string> = {
    SLOT_TOO_SOON: 'This slot starts too soon to book. Pick a later slot.',
    NO_CREDITS: "You've used all your mentorship credits.",
    GAP_ACTIVE: "You can't book another session yet. Sessions need a gap between them.",
}

const KNOWN_CODES = Object.keys(BOOK_SLOT_ERROR_MESSAGES) as BookSlotErrorCode[]

const parseBookSlotError = (error: unknown): BookSlotError => {
    const response = (error as { response?: { status?: number; data?: BookSlotErrorBody } })?.response
    const body = response?.data
    const status = response?.status ?? body?.statusCode ?? null
    const backendMessage = Array.isArray(body?.message) ? body?.message.join(' ') : body?.message

    // 400 SLOT_TOO_SOON, 403 NO_CREDITS, 403 GAP_ACTIVE -> the backend's message (fixed text only if it sends none)
    if (KNOWN_CODES.includes(body?.code as BookSlotErrorCode)) {
        const code = body?.code as Exclude<BookSlotErrorCode, 'SLOT_UNAVAILABLE'>
        const backendMessage = Array.isArray(body?.message) ? body?.message.join(' ') : body?.message
        const message = backendMessage?.trim() || BOOK_SLOT_ERROR_MESSAGES[code]
        return { status, code, message, data: body?.data }
    }

    // 400 without a code: the backend's own text - "Slot not available." / "Slot is full." /
    // "This slot has already passed." / "This slot can't be booked right now because no
    // meeting licence is free at that time. Please pick another slot."
    if (status === 400) {
        return {
            status,
            code: 'SLOT_UNAVAILABLE',
            message: backendMessage || 'Slot not available.',
            data: body?.data,
        }
    }

    return { status, code: null, message: backendMessage || 'Failed to book slot', data: body?.data }
}

export function useBookMentorSlot() {
    const [booking, setBooking] = useState<MentorSlotBooking | null>(null)
    const [isBooking, setIsBooking] = useState<boolean>(false)
    const [errorInfo, setErrorInfo] = useState<BookSlotError | null>(null)

    const clearError = useCallback(() => setErrorInfo(null), [])

    const bookSlot = async (slotId: number): Promise<MentorSlotBooking | null> => {
        try {
            setIsBooking(true)
            setErrorInfo(null)

            const response = await api.post<BookMentorSlotApiResponse>(
                '/student/mentor-slots/book',
                { slotId }
            )

            const bookingData = parseBookingResponse(response.data)
            setBooking(bookingData)
            return bookingData
        } catch (error) {
            console.error('Error booking mentor slot:', error)
            setErrorInfo(parseBookSlotError(error))
            return null
        } finally {
            setIsBooking(false)
        }
    }

    return {
        booking,
        isBooking,
        /** The backend message, for screens that only show text */
        error: errorInfo?.message ?? null,
        /** status, code, title and message of the last refusal */
        errorInfo,
        clearError,
        bookSlot,
    }
}
