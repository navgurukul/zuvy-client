'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface MentorProfileResponse {
  mentorProfileId: number
  mentorUserId: string
  organizationId: number
  mentorType: string
  timezone: string
  title: string
  bio: string
  expertise: string[]
  pastExperiences: string | null
  status: string
  isVerified: boolean
  acceptsNewMentees: boolean
  createdAt: string
  updatedAt: string
}

export interface ProfileCompletenessGate {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
}

const REQUIRED_FIELDS = ['bio', 'expertise', 'pastExperiences'] as const

const validateProfileCompleteness = (
  profile: MentorProfileResponse | null
): ProfileCompletenessGate => {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: [...REQUIRED_FIELDS],
      completionPercentage: 0,
    }
  }

  const missingFields: string[] = []

  // Check bio
  if (!profile.bio || profile.bio.trim().length === 0) {
    missingFields.push('bio')
  }

  // Check expertise
  if (!profile.expertise || profile.expertise.length === 0) {
    missingFields.push('expertise')
  }

  // Check pastExperiences
  if (!profile.pastExperiences || profile.pastExperiences.trim().length === 0) {
    missingFields.push('pastExperiences')
  }

  const completionPercentage = Math.round(
    ((REQUIRED_FIELDS.length - missingFields.length) / REQUIRED_FIELDS.length) *
      100
  )

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
  }
}

const getErrorMessage = (error: unknown): string => {
  const message = (
    error as { response?: { data?: { message?: string } } }
  )?.response?.data?.message

  return message || 'Failed to fetch mentor profile'
}

export function useGetMentorProfile() {
  const [mentorProfile, setMentorProfile] =
    useState<MentorProfileResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [completenessGate, setCompletenessGate] =
    useState<ProfileCompletenessGate | null>(null)

  const fetchMentorProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get<MentorProfileResponse>(
        '/instructor/mentor-slots/profile'
      )
      
      const profile = response.data
      setMentorProfile(profile)
      setCompletenessGate(validateProfileCompleteness(profile))
    } catch (error) {
      console.error('Error fetching mentor profile:', error)
      setMentorProfile(null)
      setCompletenessGate(validateProfileCompleteness(null))
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status !== 404) {
        setError(getErrorMessage(error))
      } else {
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMentorProfile()
  }, [fetchMentorProfile])

  return {
    mentorProfile,
    loading,
    error,
    completenessGate,
    refetchMentorProfile: fetchMentorProfile,
  }
}
