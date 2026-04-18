'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'

interface DeleteMentorSlotResponse {
    message?: string
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

    const deleteSlot = async (slotId: number): Promise<boolean> => {
        try {
            setIsDeleting(true)
            setDeletingSlotId(slotId)
            setError(null)
            setMessage(null)

            const response = await api.delete<DeleteMentorSlotResponse>(
                `/mentor-slots/${slotId}`
            )

            setMessage(response.data?.message || 'Slot removed successfully.')
            return true
        } catch (error) {
            console.error('Error removing mentor slot:', error)
            setError(getErrorMessage(error))
            return false
        } finally {
            setIsDeleting(false)
            setDeletingSlotId(null)
        }
    }

    return {
        isDeleting,
        deletingSlotId,
        error,
        message,
        deleteSlot,
    }
}