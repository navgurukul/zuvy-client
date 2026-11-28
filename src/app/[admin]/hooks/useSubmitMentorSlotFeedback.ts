'use client'

import { useCallback, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
import { SubmitFeedbackResponse, MentorSessionFeedbackPayload } from './hookType'

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to submit feedback'
}

export function useSubmitMentorSlotFeedback() {
    const [isSubmittingFeedback, setIsSubmittingFeedback] =
        useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [feedbackData, setFeedbackData] =
        useState<SubmitFeedbackResponse | null>(null)
    // State is read at render time; the ref gives the caller this call's response right after `await`
    const lastResponseRef = useRef<SubmitFeedbackResponse | null>(null)
    const getLastResponse = useCallback(() => lastResponseRef.current, [])

    const submitFeedback = async (
        bookingId: number,
        payload: MentorSessionFeedbackPayload
    ): Promise<boolean> => {
        if (!Number.isFinite(payload.rating)) {
            setError('rating must be a valid number')
            return false
        }

        try {
            setIsSubmittingFeedback(true)
            setError(null)
            setFeedbackData(null)
            lastResponseRef.current = null

            const response = await api.post<SubmitFeedbackResponse>(
                `/instructor/mentor-slots/bookings/${bookingId}/feedback`,
                payload
            )

            lastResponseRef.current = response.data || null
            setFeedbackData(response.data || null)
            return true
        } catch (error) {
            console.error('Error submitting mentor feedback:', error)
            setError(getErrorMessage(error))
            return false
        } finally {
            setIsSubmittingFeedback(false)
        }
    }

    return {
        isSubmittingFeedback,
        error,
        feedbackData,
        getLastResponse,
        submitFeedback,
    }
}