'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface UpdateLearnerProfilePayload {
    [key: string]: any
}

export function useUpdateLearnerProfile() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const updateLearnerProfile = useCallback(
        async (id: number | string, payload: UpdateLearnerProfilePayload) => {
            try {
                setLoading(true)
                const res = await api.put(`http://localhost:5000/learner-profile/${id}`, payload)
                setError(null)
                return { success: true, data: res.data }
            } catch (err) {
                setError(err)
                console.error('Error updating learner profile:', err)
                return { success: false, error: err }
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return {
        updateLearnerProfile,
        loading,
        error,
    }
}

export default useUpdateLearnerProfile
