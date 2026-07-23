'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

export interface UpdateAttendanceStatusPayload {
    userId: string | number
    status: 'present' | 'absent'
}

export function useUpdateAttendanceStatus() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<unknown>(null)

    const updateAttendanceStatus = useCallback(
        async (
            courseId: string | number,
            sessionId: string | number,
            payload: UpdateAttendanceStatusPayload
        ): Promise<AxiosResponse<any>> => {
            setLoading(true)
            setError(null)
            try {
                const endpoint = `/bootcamp/${courseId}/attendance/${sessionId}/mark`
                const response = await api.post(endpoint, payload)
                return response
            } catch (err) {
                setError(err)
                throw err
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return {
        updateAttendanceStatus,
        loading,
        error,
    }
}

export default useUpdateAttendanceStatus
