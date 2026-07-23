'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type UpdateTopicPayload = {
    name: string
    description: string
}

type UpdateTopicResponse = {
    id?: number
    name?: string
    description?: string
    message?: string
    [key: string]: unknown
}

export function useUpdateTopic() {
    const [updating, setUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updateTopic = useCallback(
        async (
            topicId: number,
            bootcampId: number,
            payload: UpdateTopicPayload
        ): Promise<UpdateTopicResponse> => {
            if (!topicId || Number.isNaN(topicId)) {
                throw new Error('Invalid topic id')
            }

            if (!bootcampId || Number.isNaN(bootcampId)) {
                throw new Error('Invalid bootcamp id')
            }

            const trimmedName = payload.name?.trim()
            const trimmedDescription = payload.description?.trim()

            if (!trimmedName) {
                throw new Error('Topic name is required')
            }

            if (!trimmedDescription) {
                throw new Error('Topic description is required')
            }

            const endpoint = `${process.env.NEXT_PUBLIC_EVAL_URL}/topic/${topicId}?bootcampId=${bootcampId}`

            try {
                setUpdating(true)
                setError(null)

                try {
                    const response = await api.patch<UpdateTopicResponse>(endpoint, {
                        name: trimmedName,
                        description: trimmedDescription,
                    })
                    return response.data
                } catch (putError: any) {
                    // Some deployments expose PATCH instead of PUT for updates.
                    if (putError?.response?.status === 404 || putError?.response?.status === 405) {
                        const response = await api.patch<UpdateTopicResponse>(endpoint, {
                            name: trimmedName,
                            description: trimmedDescription,
                        })
                        return response.data
                    }
                    throw putError
                }
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to update topic'
                setError(errorMessage)
                throw err
            } finally {
                setUpdating(false)
            }
        },
        []
    )

    return {
        updateTopic,
        updating,
        error,
    }
}
