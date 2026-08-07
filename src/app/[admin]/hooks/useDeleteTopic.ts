'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export function useDeleteTopic() {
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const deleteTopic = useCallback(async (topicId: number, bootcampId: number) => {
        try {
            setDeleting(true)
            setError(null)

            await api.delete(
                `${process.env.NEXT_PUBLIC_EVAL_URL}/topic/${topicId}?bootcampId=${bootcampId}`
            )
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to delete topic'
            setError(errorMessage)
            throw err
        } finally {
            setDeleting(false)
        }
    }, [])

    return {
        deleteTopic,
        deleting,
        error,
    }
}
