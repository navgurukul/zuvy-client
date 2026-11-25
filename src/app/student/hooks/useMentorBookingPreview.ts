'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
import { MentorBookingPreview } from './hookTypes'

type MentorBookingPreviewApiResponse = MentorBookingPreview | { data: MentorBookingPreview }

const parseBookingPreview = (
    response: MentorBookingPreviewApiResponse
): MentorBookingPreview | null => {
    if (!response || typeof response !== 'object') return null
    const preview = 'data' in response ? response.data : response
    if (!preview) return null
    return {
        ...preview,
        goodToKnow: Array.isArray(preview.goodToKnow) ? preview.goodToKnow : [],
    }
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch booking preview'
}

/**
 * What booking a slot would do (read only): canBook / blocked, the credit
 * impact and the "Good to know" lines.
 * GET /student/mentor-slots/:slotId/booking-preview
 */
export function useMentorBookingPreview(slotId?: number | null, initialFetch = true) {
    const [preview, setPreview] = useState<MentorBookingPreview | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch && !!slotId)
    const [error, setError] = useState<string | null>(null)
    // Ignore responses for a slot that is no longer the current one
    const latestRequestId = useRef(0)

    const getBookingPreview = useCallback(async () => {
        const requestId = ++latestRequestId.current

        if (!slotId) {
            setPreview(null)
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await api.get<MentorBookingPreviewApiResponse>(
                `/student/mentor-slots/${slotId}/booking-preview`
            )

            if (requestId !== latestRequestId.current) return
            setPreview(parseBookingPreview(response.data))
        } catch (error) {
            if (requestId !== latestRequestId.current) return
            console.error('Error fetching booking preview:', error)
            setPreview(null)
            setError(getErrorMessage(error))
        } finally {
            if (requestId === latestRequestId.current) setLoading(false)
        }
    }, [slotId])

    useEffect(() => {
        if (initialFetch) getBookingPreview()
    }, [initialFetch, getBookingPreview])

    return {
        preview,
        loading,
        error,
        refetchBookingPreview: getBookingPreview,
    }
}
