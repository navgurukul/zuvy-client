'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface LearnerProfilePayload {
    [key: string]: any
}

export function useSaveLearnerProfile() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)
    // const localBaseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || 'http://localhost:5000'

    const saveLearnerProfile = useCallback(async (payload: LearnerProfilePayload) => {
        try {
            setLoading(true)
            const res = await api.post('/learner-profile', payload)
            setError(null)
            return { success: true, data: res.data }
        } catch (err) {
            setError(err)
            console.error('Error saving learner profile:', err)
            return { success: false, error: err }
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        saveLearnerProfile,
        loading,
        error,
    }
}

export default useSaveLearnerProfile
