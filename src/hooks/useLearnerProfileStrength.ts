'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

type LearnerProfileStrengthResponse =
    | number
    | string
        | Array<{
                strength?: number | string
                percentage?: number | string
                level?: string
                message?: string
            }>
    | {
        success?: boolean
        status?: string
        message?: string
        code?: number
                level?: string
                data?:
                        | number
                        | string
                        | {
                                strength?: number | string
                                percentage?: number | string
                                level?: string
                                message?: string
                            }
                        | Array<{
                                strength?: number | string
                                percentage?: number | string
                                level?: string
                                message?: string
                            }>
      }

const toNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) return parsed
    }
    return null
}

const toText = (value: unknown): string | null => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

const extractStrengthData = (
    payload: LearnerProfileStrengthResponse
): { percentage: number | null; level: string | null; message: string | null } => {
    let percentage: number | null = null
    let level: string | null = null
    let message: string | null = null

    const inspect = (value: unknown) => {
        const directNumber = toNumber(value)
        if (directNumber !== null && percentage === null) {
            percentage = directNumber
            return
        }

        if (Array.isArray(value)) {
            value.forEach(inspect)
            return
        }

        if (!value || typeof value !== 'object') return

        const objectValue = value as {
            data?: unknown
            strength?: unknown
            percentage?: unknown
            level?: unknown
            message?: unknown
        }

        if ('data' in objectValue) {
            inspect(objectValue.data)
        }

        if (percentage === null) {
            const strengthNumber = toNumber(objectValue.strength)
            if (strengthNumber !== null) {
                percentage = strengthNumber
            }
        }

        if (percentage === null) {
            const percentageNumber = toNumber(objectValue.percentage)
            if (percentageNumber !== null) {
                percentage = percentageNumber
            }
        }

        if (level === null) {
            level = toText(objectValue.level)
        }

        if (message === null) {
            message = toText(objectValue.message)
        }
    }

    inspect(payload)

    return {
        percentage: percentage === null ? null : clampPercentage(percentage),
        level,
        message,
    }
}

const clampPercentage = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export function useLearnerProfileStrength(initialFetch = true) {
    const [strengthPercentage, setStrengthPercentage] = useState<number | null>(null)
    const [strengthLevel, setStrengthLevel] = useState<string | null>(null)
    const [strengthMessage, setStrengthMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const fetchLearnerProfileStrength = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<LearnerProfileStrengthResponse>('/learner-profile/strength')
            const parsedStrength = extractStrengthData(res.data)
            setStrengthPercentage(parsedStrength.percentage)
            setStrengthLevel(parsedStrength.level)
            setStrengthMessage(parsedStrength.message)
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setStrengthPercentage(null)
            setStrengthLevel(null)
            setStrengthMessage(null)
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
        strengthLevel,
        strengthMessage,
        loading,
        error,
        refetchLearnerProfileStrength: fetchLearnerProfileStrength,
    }
}

export default useLearnerProfileStrength
