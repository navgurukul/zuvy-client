'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { MentorProfileResponse } from './useGetMentorProfile'

type MentorProfileMutationResponse = MentorProfileResponse & {
  message?: string
  data?: {
    message?: string
  }
}

export type UpdateMentorProfileResult = {
  data: MentorProfileMutationResponse
  message?: string
}

export type UpdateMentorProfilePayload = {
  bio: string
  expertise: string[]
  title: string
  pastExperiences?: string
}

export function useUpdateMentorProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateMentorProfile = useCallback(async (
    payload: UpdateMentorProfilePayload,
    isFirstTime?: boolean
  ): Promise<UpdateMentorProfileResult> => {
    try {
      setLoading(true)
      setError(null)

      // Use POST for first-time profile creation, PATCH for updates
      const method = isFirstTime ? 'post' : 'patch'
      const response = await api[method]<MentorProfileMutationResponse>(
        '/instructor/mentor-slots/profile',
        payload
      )

      const responseData = response.data
      const message = responseData?.message ?? responseData?.data?.message

      return {
        data: responseData,
        message,
      }
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update mentor profile'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    updateMentorProfile,
    loading,
    error,
  }
}
