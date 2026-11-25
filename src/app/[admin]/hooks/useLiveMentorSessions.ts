'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export interface LiveSessionParticipant {
  id: string
  name: string
  email: string
  joinedAt: string | null
}

export interface LiveMentorSession {
  bookingId: number
  bootcampId: number
  bootcampName: string
  topic: string | null
  slotStart: string
  slotEnd: string
  phase: string
  lifecycleState: string
  meetingLink: string | null
  mentor: LiveSessionParticipant
  student: LiveSessionParticipant
  needsAttention: boolean
  notJoined: string[]
}

interface LiveSessionsResponse {
  serverTime: string
  total: number
  needsAttentionCount: number
  sessions: LiveMentorSession[]
}

async function fetchLive(orgId: number, bootcampId?: number): Promise<LiveSessionsResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const params: Record<string, number> = { orgId }
  if (bootcampId) params.bootcampId = bootcampId

  const response = await axios.get<LiveSessionsResponse>(
    'http://localhost:5000/admin/mentor-sessions/live',
    {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  )
  return response.data
}

export function useLiveMentorSessions(orgId?: string | number, bootcampId?: string | number) {
  const [sessions, setSessions] = useState<LiveMentorSession[]>([])
  const [total, setTotal] = useState(0)
  const [needsAttentionCount, setNeedsAttentionCount] = useState(0)
  const [serverTime, setServerTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // stale = last refresh failed, showing old data with a warning
  const [stale, setStale] = useState(false)
  const [tick, setTick] = useState(0)

  const orgNum = orgId ? Number(orgId) : undefined
  const bootNum = bootcampId ? Number(bootcampId) : undefined

  useEffect(() => {
    if (!orgNum) return

    let cancelled = false
    setLoading(true)

    fetchLive(orgNum, bootNum)
      .then((data) => {
        if (cancelled) return
        setSessions(Array.isArray(data.sessions) ? data.sessions : [])
        setTotal(data.total ?? 0)
        setNeedsAttentionCount(data.needsAttentionCount ?? 0)
        setServerTime(data.serverTime ?? null)
        setStale(false) // fresh data — clear warning
      })
      .catch(() => {
        if (cancelled) return
        // keep existing sessions, just mark as stale
        setStale(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [orgNum, bootNum, tick])

  // Manual refresh only — call refetch() from the Refresh button
  const refetch = () => setTick((t) => t + 1)

  return { sessions, total, needsAttentionCount, serverTime, loading, stale, refetch }
}
