'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface CourseMentor {
  id: string | number
  name: string
  email?: string
}

type RawCourseMentor = {
  id?: string | number
  mentorId?: string | number
  name?: string
  mentorName?: string
  email?: string
}

type CourseMentorsResponse = {
  data?: RawCourseMentor[] | { mentors?: RawCourseMentor[] }
  mentors?: RawCourseMentor[]
}

const normalizeMentors = (response: CourseMentorsResponse): CourseMentor[] => {
  const rawMentors = Array.isArray(response.data)
    ? response.data
    : response.data?.mentors ?? response.mentors ?? []

  return rawMentors.flatMap((mentor) => {
    const id = mentor.id ?? mentor.mentorId
    const name = mentor.name ?? mentor.mentorName
    return id !== undefined && name ? [{ id, name, email: mentor.email }] : []
  })
}

export function useCourseMentors(
  orgId?: string | number,
  bootcampId?: string | number,
  enabled = true,
) {
  const [mentors, setMentors] = useState<CourseMentor[]>([])
  const [loading, setLoading] = useState(Boolean(enabled && orgId && bootcampId))
  const [error, setError] = useState<string | null>(null)

  const fetchMentors = useCallback(async () => {
    if (!enabled || !orgId || !bootcampId) {
      setMentors([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.get<CourseMentorsResponse>('http://localhost:5000/course-admin/mentors', {
        params: { orgId, bootcampId },
      })
      setMentors(normalizeMentors(response.data))
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message || 'Unable to load mentors.')
      setMentors([])
    } finally {
      setLoading(false)
    }
  }, [orgId, bootcampId, enabled])

  useEffect(() => { void fetchMentors() }, [fetchMentors])

  return { mentors, loading, error, refetchMentors: fetchMentors }
}
