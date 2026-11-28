'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import { MentorshipEligibility } from './hookTypes'

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch mentorship eligibility'
}

/** GET /student/mentorship/eligibility - credits block, rule numbers and serverTime for the credits banner */
export function useMentorshipEligibility(initialFetch = true) {
    const [eligibility, setEligibility] = useState<MentorshipEligibility | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getEligibility = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get<MentorshipEligibility>('/student/mentorship/eligibility')
            setEligibility(response.data)
        } catch (error) {
            console.error('Error fetching mentorship eligibility:', error)
            setEligibility(null)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) getEligibility()
    }, [initialFetch, getEligibility])

    return {
        eligibility,
        loading,
        error,
        refetchEligibility: getEligibility,
    }
}
