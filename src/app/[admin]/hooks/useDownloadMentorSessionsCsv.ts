'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { OrganizationMentorSession } from '@/app/[admin]/hooks/useOrganizationMentorSessions'

type ExportResponse = {
  data?: OrganizationMentorSession[]
}

const csvDate = (value?: string | null, withTime = false) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const iso = date.toISOString()
  return withTime ? `${iso.slice(0, 10)} ${iso.slice(11, 16)}` : iso.slice(0, 10)
}

const csvTime = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(11, 16)
}

const getStatus = (session: OrganizationMentorSession) => {
  const state = `${session.lifecycleState} ${session.status}`.toUpperCase()
  if (state.includes('COMPLET')) return 'Completed'
  if (state.includes('MISSED') || state.includes('NO_SHOW')) return 'Missed'
  if (state.includes('CANCEL')) return 'Cancelled'
  if (state.includes('PROGRESS') || state.includes('LIVE')) return 'In progress'
  return 'Upcoming'
}

const getJoinStatus = (session: OrganizationMentorSession) => {
  const attendance = (session.attendanceStatus || '').toUpperCase()
  const student = (session.studentAttendance?.status || '').toUpperCase()
  const mentor = (session.mentorAttendance?.status || '').toUpperCase()
  const lateBy = Math.max(session.studentAttendance?.lateByMinutes || 0, session.mentorAttendance?.lateByMinutes || 0)

  if (attendance === 'NOT_APPLICABLE') return '—'
  if (attendance.includes('NO_SHOW') || student.includes('NO_SHOW') || mentor.includes('NO_SHOW')) {
    return attendance.includes('MENTOR') || mentor.includes('NO_SHOW') ? 'Mentor no-show' : 'Student no-show'
  }
  if (attendance.includes('NOT_JOINED') || mentor.includes('NOT_JOINED') || student.includes('NOT_JOINED')) {
    return attendance.includes('MENTOR') || mentor.includes('NOT_JOINED') ? 'Mentor not joined' : 'Student not joined'
  }
  if (lateBy > 0) return `Joined late (${lateBy} min)`
  if (attendance.includes('BOTH') || (session.mentorAttendance?.joinedAt && session.studentAttendance?.joinedAt)) return 'Both joined'
  if (attendance.includes('IN_PROGRESS')) return 'In progress'
  if (attendance === 'PENDING') return 'Scheduled'
  return attendance.replaceAll('_', ' ').toLowerCase() || 'Scheduled'
}

const createCsv = (sessions: OrganizationMentorSession[]) => {
  const headers = ['Booking ID', 'Course', 'Batch', 'Mentor name', 'Mentor email', 'Student name', 'Student email', 'Credits used', 'Credits left', 'Session date', 'Start', 'End', 'Status', 'Join status', 'Mentor joined at', 'Student joined at', 'Mentor rating', 'Student rating', 'Recording URL']
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const rows = sessions.map((session) => [
    session.bookingId,
    session.courseName,
    session.batchName,
    session.mentor?.name,
    session.mentor?.email,
    session.student?.name,
    session.student?.email,
    session.creditsUsed,
    session.creditsLeft,
    csvDate(session.slotStart),
    csvTime(session.slotStart),
    csvTime(session.slotEnd),
    getStatus(session),
    getJoinStatus(session),
    csvDate(session.mentorAttendance?.joinedAt, true),
    csvDate(session.studentAttendance?.joinedAt, true),
    session.mentorRating,
    session.studentRating,
    session.recordingUrl,
  ])
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')
  return new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
}

const saveFile = (file: Blob, filename: string) => {
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function useDownloadMentorSessionsCsv(
  orgId?: string | number,
  bootcampId?: string | number,
  lifecycleState?: string,
) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const downloadCsv = useCallback(async () => {
    if (!orgId || !bootcampId) {
      setError('Organization and course are required to export bookings.')
      return
    }

    setDownloading(true)
    setError(null)
    try {
      const response = await api.get<Blob>('http://localhost:5000/course-admin/mentor-sessions/export', {
        params: { orgId, bootcampId, ...(lifecycleState ? { lifecycleState } : {}) },
        responseType: 'blob',
      })
      let file = response.data
      const contentType = String(response.headers['content-type'] || file.type || '').toLowerCase()
      if (contentType.includes('json')) {
        const payload = JSON.parse(await file.text()) as ExportResponse | OrganizationMentorSession[]
        const sessions = Array.isArray(payload) ? payload : payload.data
        if (!Array.isArray(sessions)) throw new Error('The export response did not include session rows.')
        file = createCsv(sessions)
      }

      const disposition = String(response.headers['content-disposition'] || '')
      const filename = disposition.match(/filename\*?=(?:UTF-8''|\")?([^;\"]+)/i)?.[1]
        || `mentorship-bookings-${bootcampId}.csv`
      saveFile(file, decodeURIComponent(filename.replace(/\"/g, '').trim()))
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (requestError as { message?: string })?.message
      setError(message || 'Unable to download the bookings CSV.')
    } finally {
      setDownloading(false)
    }
  }, [orgId, bootcampId, lifecycleState])

  return { downloadCsv, downloading, error }
}
