'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface OrganizationMentorSessionMetrics {
  totalSessions: number
  completedSessions: number
  cancelledSessions: number
  scheduledSessions: number
  studentNoShows: number
  mentorNoShows: number
  averageMentorRating: number | null
  averageStudentRating: number | null
}

type MetricsResponse = {
  status?: string
  data?: OrganizationMentorSessionMetrics
}

export function useOrganizationMentorSessionMetrics(
  orgId?: string | number,
  bootcampId?: string | number,
  enabled = true,
) {
  const [metrics, setMetrics] = useState<OrganizationMentorSessionMetrics | null>(null)
  const [loading, setLoading] = useState(Boolean(enabled && orgId && bootcampId))
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    if (!enabled || !orgId || !bootcampId) {
      setMetrics(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.get<MetricsResponse>('http://localhost:5000/course-admin/mentor-sessions/metrics', {
        params: { orgId, bootcampId },
      })
      setMetrics(response.data?.data ?? null)
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message || 'Unable to load mentorship metrics.')
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }, [orgId, bootcampId, enabled])

  useEffect(() => { void fetchMetrics() }, [fetchMetrics])

  return { metrics, loading, error, refetchMetrics: fetchMetrics }
}
