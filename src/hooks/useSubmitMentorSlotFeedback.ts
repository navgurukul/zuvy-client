'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'

export interface MentorSessionFeedbackPayload {
    feedback: {
        notes: string
        areasOfImprovement: string
    }
    rating: number
}

interface SubmitFeedbackResponse {
    message?: string
    feedbackLockedAt?: string
    rating?: number
    [key: string]: unknown
}

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

            const response = await api.post<SubmitFeedbackResponse>(
                `/mentor-slots/${bookingId}/feedback`,
                payload
            )

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
        submitFeedback,
    }
}