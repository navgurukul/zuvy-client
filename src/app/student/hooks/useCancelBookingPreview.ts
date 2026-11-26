'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import { CancelBookingPreview } from './hookTypes'

type CancelBookingPreviewApiResponse = CancelBookingPreview | { data: CancelBookingPreview }

const parseCancelPreview = (
    response: CancelBookingPreviewApiResponse
): CancelBookingPreview | null => {
    if (!response || typeof response !== 'object') return null
    if ('bookingId' in response || 'canCancel' in response) return response as CancelBookingPreview
    if ('data' in response && response.data) return response.data
    return null
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch cancel preview'
}

/**
 * What cancelling a booking would do (read only): canCancel / blocked,
 * the credit message and the minimum reason length.
 * GET /student/mentor-slots/bookings/:bookingId/cancel-preview
 */
export function useCancelBookingPreview(bookingId?: number | null, initialFetch = true) {
    const [preview, setPreview] = useState<CancelBookingPreview | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch && !!bookingId)
    const [error, setError] = useState<string | null>(null)

    const getCancelPreview = useCallback(async () => {
        if (!bookingId) {
            setPreview(null)
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await api.get<CancelBookingPreviewApiResponse>(
                `/student/mentor-slots/bookings/${bookingId}/cancel-preview`
            )
            setPreview(parseCancelPreview(response.data))
        } catch (error) {
            console.error('Error fetching cancel preview:', error)
            setPreview(null)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [bookingId])

    useEffect(() => {
        if (initialFetch) getCancelPreview()
    }, [initialFetch, getCancelPreview])

    return {
        preview,
        loading,
        error,
        refetchCancelPreview: getCancelPreview,
    }
}
