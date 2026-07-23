'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { CreateTopicPayload, CreateTopicResponse } from './hookType'

export function useCreateTopic() {
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createTopic = useCallback(
        async (
            bootcampId: number,
            payload: CreateTopicPayload
        ): Promise<CreateTopicResponse> => {
            try {
                setCreating(true)
                setError(null)

                const response = await api.post<CreateTopicResponse>(
                    `${process.env.NEXT_PUBLIC_EVAL_URL}/topic?bootcampId=${bootcampId}`,
                    payload
                )

                return response.data
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to create topic'
                setError(errorMessage)
                throw err
            } finally {
                setCreating(false)
            }
        },
        []
    )

    return {
        createTopic,
        creating,
        error,
    }
}
