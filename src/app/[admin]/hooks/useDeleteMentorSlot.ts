'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'

interface DeleteMentorSlotResponse {
    message?: string
}

export interface DeleteMentorSlotResult {
    success: boolean
    /** The backend's message: "Slot deleted successfully", or the refusal
     * (400 SLOT_BOOKED "Booked slots can't be removed. Cancel the booking first."). */
    message: string
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to remove slot'
}

export function useDeleteMentorSlot() {
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [deletingSlotId, setDeletingSlotId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const deleteSlot = async (slotId: number): Promise<DeleteMentorSlotResult> => {
        try {
            setIsDeleting(true)
            setDeletingSlotId(slotId)
            setError(null)
            setMessage(null)

            const response = await api.delete<DeleteMentorSlotResponse>(
                `/instructor/mentor-slots/${slotId}`
            )

            const successMessage = response.data?.message || 'Slot removed successfully.'
            setMessage(successMessage)
            return { success: true, message: successMessage }
        } catch (error) {
            console.error('Error removing mentor slot:', error)
            const errorMessage = getErrorMessage(error)
            setError(errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            setIsDeleting(false)
            setDeletingSlotId(null)
        }
    }

    const clearError = () => setError(null)

    return {
        isDeleting,
        deletingSlotId,
        error,
        message,
        deleteSlot,
        clearError,
    }
}
