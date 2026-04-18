'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'

interface CompleteSessionResponse {
    message?: string
    completedAt?: string
    sessionLifecycleState?: string
    [key: string]: unknown
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to complete session'
}

export function useCompleteMentorSlotSession() {
    const [isCompleting, setIsCompleting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [completionData, setCompletionData] =
        useState<CompleteSessionResponse | null>(null)

    const completeSession = async (bookingId: number): Promise<boolean> => {
        try {
            setIsCompleting(true)
            setError(null)
            setCompletionData(null)

            const response = await api.post<CompleteSessionResponse>(
                `/mentor-slots/${bookingId}/complete`
            )

            setCompletionData(response.data || null)
            return true
        } catch (error) {
            console.error('Error completing mentor session:', error)
            setError(getErrorMessage(error))
            return false
        } finally {
            setIsCompleting(false)
        }
    }

    return {
        isCompleting,
        error,
        completionData,
        completeSession,
    }
}