'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface OrganizationMentorSession {
  bookingId: number
  courseName: string
  batchName: string | null
  mentor: { id: number; name: string; email: string }
  student: { id: number; name: string; email: string }
  slotStart: string
  slotEnd: string
  status: string
  lifecycleState: string
  creditsAssigned: number
  creditsUsed: number
  creditsLeft: number
  attendanceStatus: string
  mentorRating?: number | null
  studentRating?: number | null
  studentAttendance?: { status?: string; joinedAt?: string | null; lateByMinutes?: number | null }
  mentorAttendance?: { status?: string; joinedAt?: string | null; lateByMinutes?: number | null }
  recordingUrl?: string | null
}

type MentorSessionsResponse = {
  status?: string
  data?: OrganizationMentorSession[]
  total?: number
  totalCount?: number
  totalPages?: number
}

export function useOrganizationMentorSessions(orgId?: string | number, limit = 100, offset = 0) {
  const [sessions, setSessions] = useState<OrganizationMentorSession[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(Boolean(orgId))
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    if (!orgId) {
      setSessions([])
      setTotal(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.get<MentorSessionsResponse>('http://localhost:5000/admin/mentor-sessions', {
        params: { orgId, limit, offset },
      })
      const rows = Array.isArray(response.data?.data) ? response.data.data : []
      setSessions(rows)
      setTotal(response.data.total ?? response.data.totalCount ?? null)
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message || 'Unable to load mentorship sessions.')
      setSessions([])
      setTotal(null)
    } finally {
      setLoading(false)
    }
  }, [orgId, limit, offset])

  useEffect(() => { void fetchSessions() }, [fetchSessions])

  return { sessions, total, loading, error, refetchSessions: fetchSessions }
}
