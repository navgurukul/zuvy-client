'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'

/** GET /instructor/mentor-slots/bookings/:bookingId/join-link */
export interface MentorJoinLinkResponse {
    bookingId: number
    /** Fresh host link: open this */
    url: string
    /** false: Zoom couldn't be reached, so this is the saved link (it may have expired) */
    fresh: boolean
    /** The attendee link; works as host when signed in to Zoom */
    joinLink?: string | null
    joinClosesAt?: string
    serverTime?: string
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    // JOIN_NOT_OPEN / SESSION_ENDED / ALREADY_CANCELLED come with their message
    return message || 'Could not get the join link'
}

/**
 * Mentor's Join: fetch a fresh Zoom host link when the button is clicked
 * (the one saved at booking time expires a few hours after it was issued).
 */
export function useMentorJoinLink() {
    const [isFetchingJoinLink, setIsFetchingJoinLink] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const getJoinLink = async (
        bookingId: number
    ): Promise<{ data: MentorJoinLinkResponse | null; error: string | null }> => {
        try {
            setIsFetchingJoinLink(true)
            setError(null)

            const response = await api.get<MentorJoinLinkResponse>(
                `/instructor/mentor-slots/bookings/${bookingId}/join-link`
            )
            return { data: response.data ?? null, error: null }
        } catch (error) {
            console.error('Error fetching mentor join link:', error)
            const message = getErrorMessage(error)
            setError(message)
            return { data: null, error: message }
        } finally {
            setIsFetchingJoinLink(false)
        }
    }

    return {
        isFetchingJoinLink,
        error,
        getJoinLink,
    }
}
