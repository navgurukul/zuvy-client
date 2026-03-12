'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface MentorProfile {
    mentorUserId: number
    bio: string
    expertise: string[]
    title: string
    bufferMinutes: number
    timezone: string
    acceptsNewMentees: boolean
    status: string
}

const PROFILE_KEYS = [
    'mentorUserId',
    'userId',
    'id',
    'bio',
    'expertise',
    'title',
    'role',
    'bufferMinutes',
    'buffer',
    'timezone',
    'timeZone',
    'acceptsNewMentees',
    'acceptingNewMentees',
    'isAcceptingNewMentees',
    'acceptingSessions',
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null

const hasAnyProfileKey = (value: Record<string, unknown>): boolean =>
    PROFILE_KEYS.some((key) => key in value)

const getProfileCandidate = (
    response: unknown
): Record<string, unknown> | null => {
    if (!isRecord(response)) {
        return null
    }

    if (hasAnyProfileKey(response)) {
        return response
    }

    const nestedData = response.data
    if (isRecord(nestedData)) {
        if (hasAnyProfileKey(nestedData)) {
            return nestedData
        }

        const nestedMentorProfile = nestedData.mentorProfile
        if (isRecord(nestedMentorProfile)) {
            return nestedMentorProfile
        }

        const nestedProfile = nestedData.profile
        if (isRecord(nestedProfile)) {
            return nestedProfile
        }

        const nestedMentor = nestedData.mentor
        if (isRecord(nestedMentor)) {
            return nestedMentor
        }
    }

    const mentorProfile = response.mentorProfile
    if (isRecord(mentorProfile)) {
        return mentorProfile
    }

    const profile = response.profile
    if (isRecord(profile)) {
        return profile
    }

    const mentor = response.mentor
    if (isRecord(mentor)) {
        return mentor
    }

    return null
}

const parseString = (value: unknown, fallback = ''): string =>
    typeof value === 'string' ? value : fallback

const parseNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string') {
        const parsedValue = Number(value)
        if (Number.isFinite(parsedValue)) {
            return parsedValue
        }
    }

    return fallback
}

const parseBoolean = (value: unknown): boolean | null => {
    if (typeof value === 'boolean') {
        return value
    }

    if (typeof value === 'number') {
        if (value === 1) {
            return true
        }

        if (value === 0) {
            return false
        }
    }

    if (typeof value === 'string') {
        const normalizedValue = value.trim().toLowerCase()

        if (['true', '1', 'yes', 'y'].includes(normalizedValue)) {
            return true
        }

        if (['false', '0', 'no', 'n'].includes(normalizedValue)) {
            return false
        }
    }

    return null
}

const parseExpertise = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string')
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
    }

    return []
}

const parseMentorProfileResponse = (
    response: unknown
): MentorProfile | null => {
    const profile = getProfileCandidate(response)

    if (!profile) {
        return null
    }

    const acceptsNewMentees =
        parseBoolean(
            profile.acceptsNewMentees ??
                profile.acceptingNewMentees ??
                profile.isAcceptingNewMentees ??
                profile.acceptingSessions
        ) ?? true

    return {
        mentorUserId: parseNumber(
            profile.mentorUserId ?? profile.userId ?? profile.id,
            0
        ),
        bio: parseString(profile.bio),
        expertise: parseExpertise(profile.expertise),
        title: parseString(profile.title ?? profile.role),
        bufferMinutes: parseNumber(profile.bufferMinutes ?? profile.buffer, 0),
        timezone: parseString(profile.timezone ?? profile.timeZone),
        acceptsNewMentees,
        status: parseString(profile.status),
    }
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch mentor profile'
}

export function useMentorProfile(mentorId?: string, initialFetch = true) {
    const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(
        null
    )
    const [loading, setLoading] = useState<boolean>(!!initialFetch && !!mentorId)
    const [error, setError] = useState<string | null>(null)

    const getMentorProfile = useCallback(async () => {
        if (!mentorId) {
            setLoading(false)
            setMentorProfile(null)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await api.get<unknown>(
                `/mentors/${mentorId}`
            )
            setMentorProfile(parseMentorProfileResponse(response.data))
        } catch (error) {
            console.error('Error fetching mentor profile:', error)
            setMentorProfile(null)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [mentorId])

    useEffect(() => {
        if (initialFetch) getMentorProfile()
    }, [initialFetch, getMentorProfile])

    return {
        mentorProfile,
        loading,
        error,
        refetchMentorProfile: getMentorProfile,
    }
}