'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'

export interface StudentFeedbackPayload {
    rating: number
    feedback: string
    notes: string
}

interface SubmitFeedbackResponse {
    message?: string
    [key: string]: unknown
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to submit feedback'
}

export function useSubmitStudentFeedback() {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [responseData, setResponseData] = useState<SubmitFeedbackResponse | null>(null)

    const submitFeedback = async (
        bookingId: number,
        payload: StudentFeedbackPayload
    ): Promise<boolean> => {
        if (!Number.isFinite(payload.rating) || payload.rating < 1 || payload.rating > 5) {
            setError('Rating must be a valid number between 1 and 5')
            return false
        }

        try {
            setIsSubmitting(true)
            setError(null)
            setResponseData(null)

            const response = await api.post<SubmitFeedbackResponse>(
                `/student/mentor-slots/bookings/${bookingId}/feedback`,
                payload
            )

            setResponseData(response.data || null)
            return true
        } catch (error) {
            console.error('Error submitting student feedback:', error)
            setError(getErrorMessage(error))
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        isSubmitting,
        error,
        responseData,
        submitFeedback,
    }
}
