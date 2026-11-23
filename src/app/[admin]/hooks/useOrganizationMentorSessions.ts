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
  studentAttendance?: { status?: string; joinedAt?: string | null; leftAt?: string | null; lateByMinutes?: number | null }
  mentorAttendance?: { status?: string; joinedAt?: string | null; leftAt?: string | null; lateByMinutes?: number | null }
  recordingUrl?: string | null
  recordingStatus?: string | null
  bookedAt?: string | null
  cancelledAt?: string | null
  completedAt?: string | null
  cancelledBy?: string | null
  cancellationReason?: string | null
  joinedAt?: string | null
  leftAt?: string | null
}

type MentorSessionsResponse = {
  status?: string
  data?: OrganizationMentorSession[]
  total?: number
  totalCount?: number
  totalPages?: number
}

export function useOrganizationMentorSessions(
  orgId?: string | number,
  limit = 100,
  offset = 0,
  bootcampId?: string | number,
  batchId?: string | number,
  hasRecording?: boolean,
  mentorId?: string | number,
  lifecycleState?: string,
) {
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
      const response = await api.get<MentorSessionsResponse>('http://localhost:5000/course-admin/mentor-sessions', {
        params: {
          orgId,
          ...(bootcampId ? { bootcampId } : {}),
          ...(batchId ? { batchId } : {}),
          ...(hasRecording ? { hasRecording: true } : {}),
          ...(mentorId ? { mentorId } : {}),
          ...(lifecycleState ? { lifecycleState } : {}),
          limit,
          offset,
        },
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
  }, [orgId, limit, offset, bootcampId, batchId, hasRecording, mentorId, lifecycleState])

  useEffect(() => { void fetchSessions() }, [fetchSessions])

  return { sessions, total, loading, error, refetchSessions: fetchSessions }
}
