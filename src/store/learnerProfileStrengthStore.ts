import { create } from 'zustand'
import { api } from '@/utils/axios.config'

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Parsing helpers (kept identical to the original hook) ────────────────────

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

const clampPercentage = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const normalizeMissingFields = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean)
    }
    if (!value || typeof value !== 'object') return []
    return Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v === null || v === undefined || v === '' || v === false)
        .map(([k]) => k)
}

const extractStrengthData = (payload: LearnerProfileStrengthResponse) => {
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

        const o = value as {
            data?: unknown
            strength?: unknown
            percentage?: unknown
            profileCompletion?: unknown
            level?: unknown
            message?: unknown
            isProfileComplete?: unknown
            missingFields?: unknown
        }

        if ('data' in o) inspect(o.data)

        if (percentage === null) {
            const n = toNumber(o.strength)
            if (n !== null) percentage = n
        }
        if (percentage === null) {
            const n = toNumber(o.percentage)
            if (n !== null) percentage = n
        }
        if (percentage === null) {
            const n = toNumber(o.profileCompletion)
            if (n !== null) percentage = n
        }

        if (level === null) level = toText(o.level)
        if (message === null) message = toText(o.message)
        if (isProfileComplete === null && typeof o.isProfileComplete === 'boolean') {
            isProfileComplete = o.isProfileComplete
        }
        if (missingFields.length === 0) {
            missingFields = normalizeMissingFields(o.missingFields)
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

// ─── Store ────────────────────────────────────────────────────────────────────

interface LearnerProfileStrengthState {
    strengthPercentage: number | null
    strengthLevel: string | null
    strengthMessage: string | null
    isProfileComplete: boolean | null
    missingFields: string[]
    loading: boolean
    error: unknown
    /**
     * Tracks whether a fetch has already been initiated.
     * Acts as a dedup mutex — concurrent callers from multiple components
     * (e.g. Header + StudentDashboard) bail out when this is already true.
     */
    fetched: boolean

    fetchStrength: () => Promise<LearnerProfileStrengthResponse | null>
    refetchStrength: () => Promise<LearnerProfileStrengthResponse | null>
}

export const useLearnerProfileStrengthStore = create<LearnerProfileStrengthState>((set, get) => ({
    strengthPercentage: null,
    strengthLevel: null,
    strengthMessage: null,
    isProfileComplete: null,
    missingFields: [],
    loading: false,
    error: null,
    fetched: false,

    fetchStrength: async () => {
        // Already cached or in-flight — deduplicate
        if (get().fetched) return null

        // Mark in-flight atomically so concurrent callers bail out
        set({ loading: true, error: null, fetched: true })

        try {
            const res = await api.get<LearnerProfileStrengthResponse>('/learner-profile/strength')
            const parsed = extractStrengthData(res.data)
            set({
                strengthPercentage: parsed.percentage,
                strengthLevel: parsed.level,
                strengthMessage: parsed.message,
                isProfileComplete: parsed.isProfileComplete,
                missingFields: parsed.missingFields,
                loading: false,
                error: null,
            })
            return res.data
        } catch (err) {
            console.error('Error fetching learner profile strength:', err)
            set({
                strengthPercentage: null,
                strengthLevel: null,
                strengthMessage: null,
                isProfileComplete: null,
                missingFields: [],
                loading: false,
                error: err,
                // Clear so a future explicit refetch can retry
                fetched: false,
            })
            return null
        }
    },

    refetchStrength: async () => {
        // Force a fresh fetch by clearing the dedup flag first
        set({ fetched: false, loading: true, error: null })
        return get().fetchStrength()
    },
}))
