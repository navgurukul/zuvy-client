'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

type LearnerProfileStrengthResponse =
    | number
    | string
    | {
        success?: boolean
        status?: string
        message?: string
        code?: number
        data?: number | string | { strength?: number | string; percentage?: number | string }
      }

const toNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) return parsed
    }
    return null
}

const extractStrength = (payload: LearnerProfileStrengthResponse): number | null => {
    const direct = toNumber(payload)
    if (direct !== null) return direct

    if (payload && typeof payload === 'object' && 'data' in payload) {
        const dataValue = payload.data
        const dataNumber = toNumber(dataValue)
        if (dataNumber !== null) return dataNumber

        if (dataValue && typeof dataValue === 'object') {
            const strengthNumber = toNumber(dataValue.strength)
            if (strengthNumber !== null) return strengthNumber

            const percentageNumber = toNumber(dataValue.percentage)
            if (percentageNumber !== null) return percentageNumber
        }
    }

    return null
}

const clampPercentage = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export function useLearnerProfileStrength(initialFetch = true) {
    const [strengthPercentage, setStrengthPercentage] = useState<number | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const fetchLearnerProfileStrength = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<LearnerProfileStrengthResponse>('/learner-profile/strength')
            const parsedStrength = extractStrength(res.data)
            setStrengthPercentage(parsedStrength === null ? null : clampPercentage(parsedStrength))
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setStrengthPercentage(null)
            console.error('Error fetching learner profile strength:', err)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) fetchLearnerProfileStrength()
    }, [initialFetch, fetchLearnerProfileStrength])

    return {
        strengthPercentage,
        loading,
        error,
        refetchLearnerProfileStrength: fetchLearnerProfileStrength,
    }
}

export default useLearnerProfileStrength
