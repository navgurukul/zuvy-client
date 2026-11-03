'use client'

import { useEffect } from 'react'
import { useLearnerProfileStrengthStore } from '@/store/learnerProfileStrengthStore'

/**
 * Thin wrapper around the Zustand learnerProfileStrengthStore.
 *
 * Deduplication guarantee:
 * - All components sharing this hook share ONE fetch of /learner-profile/strength.
 * - The store's `fetched` flag acts as a mutex: the first component to call
 *   fetchStrength sets it atomically; all subsequent callers see it already set
 *   and bail out immediately — no duplicate /learner-profile/strength requests.
 * - Calling `refetchLearnerProfileStrength` (e.g. after profile update) bypasses
 *   the cache and forces a fresh fetch.
 *
 * Return shape is identical to the original hook — no consumer changes needed.
 */
export function useLearnerProfileStrength(initialFetch = true) {
    const {
        strengthPercentage,
        strengthLevel,
        strengthMessage,
        isProfileComplete,
        missingFields,
        loading,
        error,
        fetchStrength,
        refetchStrength,
    } = useLearnerProfileStrengthStore()

    useEffect(() => {
        if (initialFetch) fetchStrength()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return {
        strengthPercentage,
        strengthLevel,
        strengthMessage,
        isProfileComplete,
        missingFields,
        loading,
        error,
        refetchLearnerProfileStrength: refetchStrength,
    }
}

export default useLearnerProfileStrength
