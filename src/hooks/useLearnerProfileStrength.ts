'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

type LearnerProfileStrengthResponse =
    | number
    | string
        | Array<{
                strength?: number | string
                percentage?: number | string
                profileCompletion?: number | string
                level?: string
                message?: string
                isProfileComplete?: boolean
                missingFields?: Record<string, unknown> | string[]
            }>
    | {
        success?: boolean
        status?: string
        message?: string
        code?: number
                level?: string
                profileCompletion?: number | string
                isProfileComplete?: boolean
                missingFields?: Record<string, unknown> | string[]
                data?:
                        | number
                        | string
                        | {
                                strength?: number | string
                                percentage?: number | string
                                profileCompletion?: number | string
                                level?: string
                                message?: string
                                isProfileComplete?: boolean
                                missingFields?: Record<string, unknown> | string[]
                            }
                        | Array<{
                                strength?: number | string
                                percentage?: number | string
                                profileCompletion?: number | string
                                level?: string
                                message?: string
                                isProfileComplete?: boolean
                                missingFields?: Record<string, unknown> | string[]
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

type LearnerProfileStrengthState = {
    percentage: number | null
    level: string | null
    message: string | null
    isProfileComplete: boolean | null
    missingFields: string[]
}

const normalizeMissingFields = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean)
    }

    if (!value || typeof value !== 'object') return []

    return Object.entries(value as Record<string, unknown>)
        .filter(([, fieldValue]) => fieldValue === null || fieldValue === undefined || fieldValue === '' || fieldValue === false)
        .map(([fieldName]) => fieldName)
}

const extractStrengthData = (
    payload: LearnerProfileStrengthResponse
): LearnerProfileStrengthState => {
    let percentage: number | null = null
    let level: string | null = null
    let message: string | null = null
    let isProfileComplete: boolean | null = null
    let missingFields: string[] = []

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
            profileCompletion?: unknown
            level?: unknown
            message?: unknown
            isProfileComplete?: unknown
            missingFields?: unknown
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

        if (percentage === null) {
            const profileCompletionNumber = toNumber(objectValue.profileCompletion)
            if (profileCompletionNumber !== null) {
                percentage = profileCompletionNumber
            }
        }

        if (level === null) {
            level = toText(objectValue.level)
        }

        if (message === null) {
            message = toText(objectValue.message)
        }

        if (isProfileComplete === null && typeof objectValue.isProfileComplete === 'boolean') {
            isProfileComplete = objectValue.isProfileComplete
        }

        if (missingFields.length === 0) {
            missingFields = normalizeMissingFields(objectValue.missingFields)
        }
    }

    inspect(payload)

    return {
        percentage: percentage === null ? null : clampPercentage(percentage),
        level,
        message,
        isProfileComplete,
        missingFields,
    }
}

const clampPercentage = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export function useLearnerProfileStrength(initialFetch = true) {
    const [strengthPercentage, setStrengthPercentage] = useState<number | null>(null)
    const [strengthLevel, setStrengthLevel] = useState<string | null>(null)
    const [strengthMessage, setStrengthMessage] = useState<string | null>(null)
    const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null)
    const [missingFields, setMissingFields] = useState<string[]>([])
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
            setIsProfileComplete(parsedStrength.isProfileComplete)
            setMissingFields(parsedStrength.missingFields)
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setStrengthPercentage(null)
            setStrengthLevel(null)
            setStrengthMessage(null)
            setIsProfileComplete(null)
            setMissingFields([])
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
        isProfileComplete,
        missingFields,
        loading,
        error,
        refetchLearnerProfileStrength: fetchLearnerProfileStrength,
    }
}

export default useLearnerProfileStrength
