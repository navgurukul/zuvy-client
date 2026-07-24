'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import { LearnerProfileData, LearnerProfileResponse } from './hookTypes'

export function useLearnerProfile(initialFetch = true) {
    const [learnerProfile, setLearnerProfile] = useState<LearnerProfileData | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)
    // const localBaseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || 'http://localhost:5000'

    const fetchLearnerProfile = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<LearnerProfileResponse>('/learner-profile')
            setLearnerProfile(res.data?.data ?? null)
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setLearnerProfile(null)
            console.error('Error fetching learner profile:', err)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) fetchLearnerProfile()
    }, [initialFetch, fetchLearnerProfile])

    return {
        learnerProfile,
        loading,
        error,
        refetchLearnerProfile: fetchLearnerProfile,
    }
}

export default useLearnerProfile
