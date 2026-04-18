'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { MentorProfileResponse } from './useGetMentorProfile'

export type UpdateMentorProfilePayload = {
  bio: string
  expertise: string[]
  title: string
  bootcampId: number
  pastExperiences?: string
}

export function useUpdateMentorProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateMentorProfile = useCallback(async (payload: UpdateMentorProfilePayload) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.patch<MentorProfileResponse>(
        '/mentor-slots/mentor/profile',
        payload
      )

      return response.data
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
