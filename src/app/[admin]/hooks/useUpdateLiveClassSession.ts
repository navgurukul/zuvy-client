'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type UpdateLiveClassSessionPayload = {
    title: string
    description: string
    startDateTime: string
    endDateTime: string
    isZoomMeet: boolean
    batchId: number
    secondBatchId?: number
}

export type UpdateLiveClassSessionResponse = {
    message?: string
    [key: string]: unknown
}

export function useUpdateLiveClassSession() {
    const [updating, setUpdating] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const updateLiveClassSession = useCallback(
        async (
            sessionId: string | number,
            payload: UpdateLiveClassSessionPayload,
            options?: {
                onSuccess?: (res: UpdateLiveClassSessionResponse) => void
                onError?: (err: unknown) => void
            }
        ) => {
            setUpdating(true)
            setError(null)

            try {
                const res = await api.put<UpdateLiveClassSessionResponse>(
                    `/classes/sessions/${sessionId}`,
                    payload
                )

                options?.onSuccess?.(res.data)
                return res.data
            } catch (err) {
                setError(err)
                options?.onError?.(err)
                throw err
            } finally {
                setUpdating(false)
            }
        },
        []
    )

    return {
        updateLiveClassSession,
        updating,
        error,
    }
}

export default useUpdateLiveClassSession