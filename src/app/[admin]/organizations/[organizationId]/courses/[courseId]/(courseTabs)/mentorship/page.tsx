'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { CalendarDays, CheckCircle2, Clock3, Download, Mail, RefreshCw, Search, Star, Users, XCircle, AlertTriangle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useBootcamps } from '@/app/[admin]/hooks/useBootcamps'
import { useBatchList } from '@/app/[admin]/hooks/useBatchList'
import { useCourseMentors } from '@/app/[admin]/hooks/useCourseMentors'
import { useOrganizationMentorSessions } from '@/app/[admin]/hooks/useOrganizationMentorSessions'
import { useOrganizationMentorSessionMetrics } from '@/app/[admin]/hooks/useOrganizationMentorSessionMetrics'
import { useDownloadMentorSessionsCsv } from '@/app/[admin]/hooks/useDownloadMentorSessionsCsv'
import { useCancelMentorSlotBooking } from '@/app/student/hooks/useCancelMentorSlotBooking'
import type { OrganizationMentorSession } from '@/app/[admin]/hooks/useOrganizationMentorSessions'
import { useLiveMentorSessions } from '@/app/[admin]/hooks/useLiveMentorSessions'
import type { LiveMentorSession } from '@/app/[admin]/hooks/useLiveMentorSessions'
import { CancelMentorSessionDialog, type CancelSessionDetails } from './_components/CancelMentorSessionDialog'
import { MentorshipBookingsTable } from './_components/MentorshipBookingsTable'
import { type MentorshipBooking } from './_components/columns'

const toneStyles: Record<string, string> = {
  red: 'border-red-300 ring-2 ring-red-100',
  amber: 'border-amber-300 ring-2 ring-amber-100',
  green: 'border-slate-200',
  blue: 'border-slate-200',
}

function toBooking(session: OrganizationMentorSession): MentorshipBooking {
  const slotStart = new Date(session.slotStart)
  const slotEnd = new Date(session.slotEnd)
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).format(slotStart)
  const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
  const state = `${session.lifecycleState} ${session.status}`.toUpperCase()
  const status: MentorshipBooking['status'] = state.includes('COMPLET') ? 'Completed' : state.includes('MISSED') || state.includes('NO_SHOW') ? 'Missed' : state.includes('CANCEL') ? 'Cancelled' : state.includes('PROGRESS') || state.includes('LIVE') ? 'In progress' : 'Upcoming'
  const attendanceState = (session.attendanceStatus || '').toUpperCase()
  const studentAttendance = (session.studentAttendance?.status || '').toUpperCase()
  const mentorAttendance = (session.mentorAttendance?.status || '').toUpperCase()
  const lateByMinutes = Math.max(session.studentAttendance?.lateByMinutes || 0, session.mentorAttendance?.lateByMinutes || 0)
  const attendance = attendanceState === 'NOT_APPLICABLE' ? '—'
    : attendanceState.includes('NO_SHOW') || studentAttendance.includes('NO_SHOW') || mentorAttendance.includes('NO_SHOW') ? (attendanceState.includes('MENTOR') || mentorAttendance.includes('NO_SHOW') ? 'Mentor no-show' : 'Student no-show')
      : attendanceState.includes('NOT_JOINED') || mentorAttendance.includes('NOT_JOINED') || studentAttendance.includes('NOT_JOINED') ? (attendanceState.includes('MENTOR') || mentorAttendance.includes('NOT_JOINED') ? 'Mentor not joined' : 'Student not joined')
        : lateByMinutes > 0 ? `Joined late (${lateByMinutes} min)`
          : attendanceState.includes('BOTH') || (session.mentorAttendance?.joinedAt && session.studentAttendance?.joinedAt) || (['JOINED', 'PRESENT', 'ATTENDED'].includes(studentAttendance) && ['JOINED', 'PRESENT', 'ATTENDED'].includes(mentorAttendance)) ? 'Both joined'
            : attendanceState.includes('IN_PROGRESS') ? 'In progress'
              : attendanceState === 'PENDING' ? 'Scheduled'
                : attendanceState.replaceAll('_', ' ').toLowerCase() || 'Scheduled'
  return {
    id: session.bookingId,
    mentorId: String(session.mentor?.id ?? ''),
    date,
    time: `${timeFormatter.format(slotStart)}–${timeFormatter.format(slotEnd)}`,
    mentor: session.mentor?.name || '—',
    mentorEmail: session.mentor?.email || '',
    student: session.student?.name || '—',
    studentEmail: session.student?.email || '',
    credits: session.creditsLeft ?? 0,
    creditsAssigned: session.creditsAssigned ?? 0,
    batch: session.batchName || '—',
    status,
    attendance,
    mentorRating: session.mentorRating ?? null,
    studentRating: session.studentRating ?? null,
    recording: Boolean(session.recordingUrl),
    recordingUrl: session.recordingUrl,
    recordingStatus: session.recordingStatus ?? null,
    slotStart: session.slotStart,
    slotEnd: session.slotEnd,
  }
}

/** Derive tone, label, and time strings from a live session */
function getLiveCardProps(session: LiveMentorSession) {
  const mentorJoined = !session.notJoined.includes('mentor')
  const studentJoined = !session.notJoined.includes('student')
  const state = (session.lifecycleState ?? '').toUpperCase()

  let tone: string
  let statusLabel: string
  if (!mentorJoined && studentJoined) { tone = 'red'; statusLabel = 'Mentor not joined' }
  else if (mentorJoined && !studentJoined) { tone = 'amber'; statusLabel = 'Student not joined' }
  else if (state === 'STARTING_SOON' || session.phase === 'starting_soon') { tone = 'blue'; statusLabel = 'Starting soon' }
  else { tone = 'green'; statusLabel = 'In progress' }

  const slotStart = new Date(session.slotStart)
  const slotEnd = new Date(session.slotEnd)
  const minutesAgo = Math.floor((Date.now() - slotStart.getTime()) / 60_000)
  const started = minutesAgo < 0 ? `Starts in ${Math.abs(minutesAgo)} min` : `Started ${minutesAgo} min ago`
  const fmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
  const time = `${fmt.format(slotStart)}–${fmt.format(slotEnd)}`

  const initials = (name: string) => name.split(' ').map((n) => n[0] ?? '').join('').slice(0, 2).toUpperCase()

  return { tone, statusLabel, started, time, mentorJoined, studentJoined, initials }
}

export default function MentorshipPage() {
  const { organizationId, courseId } = useParams<{ organizationId: string; courseId: string }>()
  const pathname = usePathname()
  const isAdminRoute = pathname.split('/')[1] === 'admin'
  const { courses, loading: coursesLoading } = useBootcamps({ limit: 1000, searchTerm: '', offset: 0 })
  const course = courses.find((item) => String(item.id) === String(courseId))
  const { batchData } = useBatchList(courseId, { enabled: isAdminRoute })
  const { mentors } = useCourseMentors(organizationId, courseId, isAdminRoute)
  const { metrics, error: metricsError } = useOrganizationMentorSessionMetrics(organizationId, courseId, isAdminRoute)
  const [offset, setOffset] = useState(0)
  const [recordingsOnly, setRecordingsOnly] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [selectedMentorId, setSelectedMentorId] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const lifecycleStateFilter = isAdminRoute
    ? ({ Upcoming: 'SCHEDULED', Completed: 'COMPLETED', Missed: 'NO_SHOW', Cancelled: 'CANCELLED' } as Record<string, string>)[statusFilter]
    : undefined
  const pageLimit = isAdminRoute && selectedMentorId ? 10 : 100
  const { sessions: apiSessions, loading: sessionsLoading, error: sessionsError, refetchSessions } = useOrganizationMentorSessions(
    organizationId,
    pageLimit,
    offset,
    isAdminRoute ? courseId : undefined,
    isAdminRoute ? selectedBatchId || undefined : undefined,
    isAdminRoute && recordingsOnly ? true : undefined,
    isAdminRoute ? selectedMentorId || undefined : undefined,
    lifecycleStateFilter,
  )
  const { cancelBooking, isCancelling, error: cancelError } = useCancelMentorSlotBooking()
  const [sessionToCancel, setSessionToCancel] = useState<CancelSessionDetails | null>(null)
  useEffect(() => {
    setSelectedBatchId('')
    setSelectedMentorId('')
    setOffset(0)
  }, [courseId])
  const courseSessions = useMemo(() => course ? apiSessions.filter((session) => session.courseName === course.name) : [], [apiSessions, course])
  const bookings = useMemo(() => courseSessions.map(toBooking), [courseSessions])

  // Live Now — real API (orgId required, bootcampId scopes to this course)
  const { sessions: liveSessionsFromApi, total: liveTotalFromApi, needsAttentionCount: needsAttentionCountFromApi, loading: liveLoading, stale: liveStale, refetch: refetchLive } = useLiveMentorSessions(organizationId, courseId)

  // ── TODO: REMOVE BEFORE PUSH ── dummy data to preview Live Now cards while API returns empty ──
  const DUMMY_LIVE_SESSIONS: LiveMentorSession[] = [
    {
      bookingId: 9001,
      bootcampId: 1041,
      bootcampName: 'Full Stack Bootcamp',
      topic: 'React hooks deep dive',
      slotStart: new Date(Date.now() - 12 * 60_000).toISOString(),
      slotEnd: new Date(Date.now() + 48 * 60_000).toISOString(),
      lifecycleState: 'IN_PROGRESS',
      phase: 'in_progress',
      notJoined: [],
      needsAttention: false,
      mentor: { id: '101', name: 'Priya Sharma', email: 'priya@example.com', joinedAt: new Date(Date.now() - 11 * 60_000).toISOString() },
      student: { id: '201', name: 'Arjun Mehta', email: 'arjun@example.com', joinedAt: new Date(Date.now() - 10 * 60_000).toISOString() },
      meetingLink: 'https://meet.example.com/room-1',
    },
    {
      bookingId: 9002,
      bootcampId: 1041,
      bootcampName: 'Full Stack Bootcamp',
      topic: 'Node.js REST APIs',
      slotStart: new Date(Date.now() - 5 * 60_000).toISOString(),
      slotEnd: new Date(Date.now() + 55 * 60_000).toISOString(),
      lifecycleState: 'IN_PROGRESS',
      phase: 'in_progress',
      notJoined: ['student'],
      needsAttention: true,
      mentor: { id: '102', name: 'Rahul Verma', email: 'rahul@example.com', joinedAt: new Date(Date.now() - 4 * 60_000).toISOString() },
      student: { id: '202', name: 'Sneha Patel', email: 'sneha@example.com', joinedAt: null },
      meetingLink: 'https://meet.example.com/room-2',
    },
    {
      bookingId: 9003,
      bootcampId: 1041,
      bootcampName: 'Full Stack Bootcamp',
      topic: 'SQL & Database design',
      slotStart: new Date(Date.now() + 3 * 60_000).toISOString(),
      slotEnd: new Date(Date.now() + 63 * 60_000).toISOString(),
      lifecycleState: 'STARTING_SOON',
      phase: 'starting_soon',
      notJoined: ['mentor', 'student'],
      needsAttention: false,
      mentor: { id: '103', name: 'Anita Nair', email: 'anita@example.com', joinedAt: null },
      student: { id: '203', name: 'Karan Singh', email: 'karan@example.com', joinedAt: null },
      meetingLink: 'https://meet.example.com/room-3',
    },
    // row 2
    {
      bookingId: 9004,
      bootcampId: 1041,
      bootcampName: 'Full Stack Bootcamp',
      topic: 'Pandas & NumPy',
      slotStart: new Date(Date.now() - 8 * 60_000).toISOString(),
      slotEnd: new Date(Date.now() + 52 * 60_000).toISOString(),
      lifecycleState: 'IN_PROGRESS',
      phase: 'in_progress',
      notJoined: ['mentor'],
      needsAttention: true,
      mentor: { id: '104', name: 'Vikram Rao', email: 'vikram@example.com', joinedAt: null },
      student: { id: '204', name: 'Pooja Iyer', email: 'pooja@example.com', joinedAt: new Date(Date.now() - 7 * 60_000).toISOString() },
      meetingLink: 'https://meet.example.com/room-4',
    },
    {
      bookingId: 9005,
      bootcampId: 1041,
      bootcampName: 'Full Stack Bootcamp',
      topic: 'Machine Learning basics',
      slotStart: new Date(Date.now() - 2 * 60_000).toISOString(),
      slotEnd: new Date(Date.now() + 58 * 60_000).toISOString(),
      lifecycleState: 'IN_PROGRESS',
      phase: 'in_progress',
      notJoined: [],
      needsAttention: false,
      mentor: { id: '105', name: 'Deepa Menon', email: 'deepa@example.com', joinedAt: new Date(Date.now() - 2 * 60_000).toISOString() },
      student: { id: '205', name: 'Rohan Das', email: 'rohan@example.com', joinedAt: new Date(Date.now() - 1 * 60_000).toISOString() },
      meetingLink: 'https://meet.example.com/room-5',
    },
    {
      bookingId: 9006,
      bootcampId: 1041,
      bootcampName: 'Full Stack Bootcamp',
      topic: 'Statistics for ML',
      slotStart: new Date(Date.now() + 7 * 60_000).toISOString(),
      slotEnd: new Date(Date.now() + 67 * 60_000).toISOString(),
      lifecycleState: 'STARTING_SOON',
      phase: 'starting_soon',
      notJoined: ['mentor', 'student'],
      needsAttention: false,
      mentor: { id: '106', name: 'Suresh Nair', email: 'suresh@example.com', joinedAt: null },
      student: { id: '206', name: 'Meena Pillai', email: 'meena@example.com', joinedAt: null },
      meetingLink: 'https://meet.example.com/room-6',
    },
    {
      bookingId: 9007,
      bootcampId: 1041,
      bootcampName: 'Full Stack Bootcamp',
      topic: 'Figma prototyping',
      slotStart: new Date(Date.now() - 15 * 60_000).toISOString(),
      slotEnd: new Date(Date.now() + 45 * 60_000).toISOString(),
      lifecycleState: 'IN_PROGRESS',
      phase: 'in_progress',
      notJoined: ['student'],
      needsAttention: true,
      mentor: { id: '107', name: 'Kavya Reddy', email: 'kavya@example.com', joinedAt: new Date(Date.now() - 14 * 60_000).toISOString() },
      student: { id: '207', name: 'Amit Shah', email: 'amit@example.com', joinedAt: null },
      meetingLink: 'https://meet.example.com/room-7',
    },
    // row 3
    {
      bookingId: 9008,
      bootcampId: 1041,
      bootcampName: 'Full Stack Bootcamp',
      topic: 'User research methods',
      slotStart: new Date(Date.now() - 20 * 60_000).toISOString(),
      slotEnd: new Date(Date.now() + 40 * 60_000).toISOString(),
      lifecycleState: 'IN_PROGRESS',
      phase: 'in_progress',
      notJoined: [],
      needsAttention: false,
      mentor: { id: '108', name: 'Nisha Kulkarni', email: 'nisha@example.com', joinedAt: new Date(Date.now() - 19 * 60_000).toISOString() },
      student: { id: '208', name: 'Pradeep Joshi', email: 'pradeep@example.com', joinedAt: new Date(Date.now() - 18 * 60_000).toISOString() },
      meetingLink: 'https://meet.example.com/room-8',
    },
    {
      bookingId: 9009,
      bootcampId: 1041,
      bootcampName: 'Full Stack Bootcamp',
      topic: 'Docker & Kubernetes',
      slotStart: new Date(Date.now() + 1 * 60_000).toISOString(),
      slotEnd: new Date(Date.now() + 61 * 60_000).toISOString(),
      lifecycleState: 'STARTING_SOON',
      phase: 'starting_soon',
      notJoined: ['mentor', 'student'],
      needsAttention: false,
      mentor: { id: '109', name: 'Ravi Shankar', email: 'ravi@example.com', joinedAt: null },
      student: { id: '209', name: 'Latha Bose', email: 'latha@example.com', joinedAt: null },
      meetingLink: 'https://meet.example.com/room-9',
    },
    {
      bookingId: 9010,
      bootcampId: 1041,
      bootcampName: 'Full Stack Bootcamp',
      topic: 'CI/CD pipelines',
      slotStart: new Date(Date.now() - 3 * 60_000).toISOString(),
      slotEnd: new Date(Date.now() + 57 * 60_000).toISOString(),
      lifecycleState: 'IN_PROGRESS',
      phase: 'in_progress',
      notJoined: ['mentor'],
      needsAttention: true,
      mentor: { id: '110', name: 'Ganesh Murthy', email: 'ganesh@example.com', joinedAt: null },
      student: { id: '210', name: 'Swati Desai', email: 'swati@example.com', joinedAt: new Date(Date.now() - 2 * 60_000).toISOString() },
      meetingLink: 'https://meet.example.com/room-10',
    },
    {
      bookingId: 9011,
      bootcampId: 1041,
      bootcampName: 'Full Stack Bootcamp',
      topic: 'Terraform basics',
      slotStart: new Date(Date.now() - 9 * 60_000).toISOString(),
      slotEnd: new Date(Date.now() + 51 * 60_000).toISOString(),
      lifecycleState: 'IN_PROGRESS',
      phase: 'in_progress',
      notJoined: [],
      needsAttention: false,
      mentor: { id: '111', name: 'Sonal Tiwari', email: 'sonal@example.com', joinedAt: new Date(Date.now() - 8 * 60_000).toISOString() },
      student: { id: '211', name: 'Kunal Saxena', email: 'kunal@example.com', joinedAt: new Date(Date.now() - 7 * 60_000).toISOString() },
      meetingLink: 'https://meet.example.com/room-11',
    },
  ]
  const useDummy = liveSessionsFromApi.length === 0 && !liveLoading
  const liveSessions = useDummy ? DUMMY_LIVE_SESSIONS : liveSessionsFromApi
  const liveTotal = useDummy ? DUMMY_LIVE_SESSIONS.length : liveTotalFromApi
  const needsAttentionCount = useDummy ? 4 : needsAttentionCountFromApi
  // ── END DUMMY DATA ──
  const [liveRefreshedAt, setLiveRefreshedAt] = useState('')
  const handleRefreshLive = async () => {
    await refetchLive()
    setLiveRefreshedAt('Updated just now')
  }

  const [query, setQuery] = useState('')
  const [batchFilter, setBatchFilter] = useState('All batches')
  const [mentorFilter, setMentorFilter] = useState('All mentors')
  const [dateFilter, setDateFilter] = useState('Last 30 days')
  const { downloadCsv, downloading: exporting, error: exportError } = useDownloadMentorSessionsCsv(organizationId, courseId, lifecycleStateFilter)

  const visibleBookings = useMemo(() => bookings.filter((booking) => {
    const searchMatches = `${booking.mentor} ${booking.student} ${booking.mentorEmail} ${booking.studentEmail}`.toLowerCase().includes(query.toLowerCase())
    return searchMatches
      && (statusFilter === 'All' || booking.status === statusFilter)
      && (batchFilter === 'All batches' || booking.batch === batchFilter)
      && (isAdminRoute ? !selectedMentorId || booking.mentorId === selectedMentorId : mentorFilter === 'All mentors' || booking.mentor === mentorFilter)
      && (!recordingsOnly || booking.recording)
  }), [batchFilter, bookings, isAdminRoute, mentorFilter, query, recordingsOnly, selectedMentorId, statusFilter])

  const copyLink = async (text: string) => {
    try { await navigator.clipboard.writeText(text) } catch { /* Clipboard may be unavailable in preview. */ }
  }

  const confirmCancellation = useCallback(async (bookingId: number, reason: string, askedBy: 'student' | 'mentor') => {
    const succeeded = await cancelBooking(bookingId, reason, askedBy, 'instructor')
    if (succeeded) {
      setSessionToCancel(null)
      await refetchSessions()
    }
  }, [cancelBooking, refetchSessions])

  return (
    <main className="space-y-4 pb-10 pt-4 text-left">
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Mentorship</h1>
          <p className="mt-1 text-sm text-muted-foreground">See who booked, what's live right now, and every session recording for this course.</p>
        </div>
        <Button variant="outline" size="sm" disabled={exporting} onClick={downloadCsv}><Download className="mr-2 h-4 w-4" />{exporting ? 'Preparing CSV…' : 'Download CSV'}</Button>
      </section>
      {exportError && <p role="alert" className="text-xs text-red-600">{exportError}</p>}

      <section aria-label="Mentorship overview" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total bookings', value: isAdminRoute ? metrics?.totalSessions ?? '—' : '124', icon: CalendarDays, color: 'text-emerald-700' },
          { label: 'Upcoming', value: isAdminRoute ? metrics?.scheduledSessions ?? '—' : '18', icon: Clock3, color: 'text-blue-600' },
          { label: 'Completed', value: isAdminRoute ? metrics?.completedSessions ?? '—' : '86', icon: CheckCircle2, color: 'text-green-600' },
          { label: 'No-shows', value: isAdminRoute ? (metrics ? metrics.studentNoShows + metrics.mentorNoShows : '—') : '9', icon: Users, color: 'text-red-500' },
          { label: 'Cancelled', value: isAdminRoute ? metrics?.cancelledSessions ?? '—' : '11', icon: XCircle, color: 'text-slate-500' },
          { label: 'Avg rating (from students)', value: isAdminRoute ? metrics?.averageStudentRating ?? '—' : '4.6', icon: Star, color: 'text-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-none"><CardContent className="p-4">
            <Icon className={`mb-2 h-4 w-4 ${color}`} />
            <div className="text-xl font-semibold leading-none">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{label}</div>
          </CardContent></Card>
        ))}
      </section>
      {isAdminRoute && metricsError && <p role="alert" className="text-xs text-red-600">{metricsError}</p>}

      {/* ── Live Now ── */}
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <h2 className="font-semibold text-base">Live now</h2>
              <span className="text-xs text-muted-foreground">
                {liveLoading
                  ? 'Loading…'
                  : `${liveTotal} session${liveTotal !== 1 ? 's' : ''} · ${needsAttentionCount} need attention${liveRefreshedAt ? ` · ${liveRefreshedAt}` : ''}`}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefreshLive} disabled={liveLoading}>
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${liveLoading ? 'animate-spin' : ''}`} />Refresh
            </Button>
          </div>

          {liveStale && (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Last refresh failed — showing data that may be out of date. Click Refresh to try again.
            </div>
          )}

          {liveLoading && (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading live sessions…</p>
          )}

          {!liveLoading && liveSessions.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No live sessions right now.</p>
          )}

          {!liveLoading && liveSessions.length > 0 && (
            <div className="max-h-[500px] overflow-y-auto pr-1">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {liveSessions.map((session) => {
                const { tone, statusLabel, started, time, mentorJoined, studentJoined, initials } = getLiveCardProps(session)
                const dotColor = tone === 'red' ? 'text-red-500' : tone === 'amber' ? 'text-amber-500' : tone === 'green' ? 'text-green-600' : 'text-sky-500'
                const labelColor = tone === 'red' ? 'text-red-600' : tone === 'amber' ? 'text-amber-600' : tone === 'green' ? 'text-green-700' : 'text-sky-600'
                return (
                  <article key={session.bookingId} className={`rounded-lg border bg-white p-3 ${toneStyles[tone]}`}>

                    {/* Row 1 — status + elapsed */}
                    <div className="flex items-center justify-between gap-1">
                      <span className={`flex items-center gap-1 text-[11px] font-semibold ${labelColor}`}>
                        <span className={dotColor}>●</span>
                        {statusLabel}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">{started}</span>
                    </div>

                    {/* Row 2 — time only */}
                    <p className="mt-1 text-[11px] text-slate-500">{time}</p>

                    {/* Person rows */}
                    <div className="mt-2 space-y-1.5">
                      {([
                        { person: session.mentor, role: 'Mentor', joined: mentorJoined, avatarClass: 'bg-green-100 text-green-700' },
                        { person: session.student, role: 'Student', joined: studentJoined, avatarClass: 'bg-blue-100 text-blue-700' },
                      ] as const).map(({ person, role, joined, avatarClass }) => (
                        <div key={person.id} className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5 shrink-0">
                            <AvatarFallback className={`text-[8px] font-bold ${avatarClass}`}>{initials(person.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-medium leading-tight text-slate-800">
                              {person.name}
                              <span className="ml-1 font-normal text-slate-400">· {role}</span>
                            </p>
                            <p className={`text-[10px] leading-tight ${joined ? 'text-slate-400' : role === 'Mentor' ? 'font-medium text-red-500' : 'font-medium text-amber-500'}`}>
                              {joined
                                ? `Joined ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(person.joinedAt ?? ''))}`
                                : 'Not joined yet'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions — all in one row */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1">
                      <Button
                        size="sm"
                        disabled={!session.meetingLink}
                        className="h-6 bg-[#28622f] px-2.5 text-[11px] font-medium hover:bg-[#204f26]"
                        onClick={() => session.meetingLink && window.open(session.meetingLink, '_blank')}
                      >
                        Join session
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 bg-white px-2 text-[11px]">Details</Button>
                      {!mentorJoined && (
                        <Button size="sm" variant="outline" className="h-6 bg-white px-2 text-[11px]" onClick={() => copyLink(session.mentor.email)}>
                          <Mail className="mr-1 h-3 w-3" />Mentor email
                        </Button>
                      )}
                      {!studentJoined && (
                        <Button size="sm" variant="outline" className="h-6 bg-white px-2 text-[11px]" onClick={() => copyLink(session.student.email)}>
                          <Mail className="mr-1 h-3 w-3" />Student email
                        </Button>
                      )}
                      {tone !== 'green' && (
                        <Button size="sm" variant="outline" className="h-6 border-red-200 bg-white px-2 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700">
                          Cancel
                        </Button>
                      )}
                    </div>

                  </article>
                )
              })}
            </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Bookings ── */}
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
            <div><h2 className="font-semibold text-lg text-base">Bookings</h2><p className="mt-0.5 text-xs text-muted-foreground">Browse mentorship sessions and attendance.</p></div>
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter bookings by status">
              {[{ label: 'All', value: 'All' }, { label: 'Upcoming', value: 'Upcoming' }, { label: 'Completed', value: 'Completed' }, { label: 'No-shows', value: 'Missed' }, { label: 'Cancelled', value: 'Cancelled' }].map(({ label, value }) => {
                const count = isAdminRoute && metrics
                  ? value === 'All' ? metrics.totalSessions
                    : value === 'Upcoming' ? metrics.scheduledSessions
                      : value === 'Completed' ? metrics.completedSessions
                        : value === 'Missed' ? metrics.studentNoShows + metrics.mentorNoShows
                          : metrics.cancelledSessions
                  : value === 'All' ? bookings.length : bookings.filter((booking) => booking.status === value).length
                return <Button key={value} size="sm" variant={statusFilter === value ? 'default' : 'outline'} className="h-7 rounded-full px-3 text-[11px]" onClick={() => { setOffset(0); setStatusFilter(value) }}>{label} <span className="ml-1 opacity-75">{count}</span></Button>
              })}
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-[minmax(240px,1fr)_140px_150px_140px_145px]">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student or mentor" className="mt-0 h-9 border-[#e7e1da] bg-[#fbfaf8] pl-9 text-xs" /></div>
            <label className="flex h-9 items-center gap-2 rounded-md border border-[#e7e1da] bg-[#fbfaf8] px-3 text-xs"><CalendarDays className="h-3.5 w-3.5 text-slate-600"/><select aria-label="Date range" className="min-w-0 appearance-none bg-transparent outline-none" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}><option>Last 30 days</option><option>Last 7 days</option><option>All time</option></select></label>
            {isAdminRoute ? <select aria-label="Filter mentor" className="h-9 rounded-md border border-[#e7e1da] bg-[#fbfaf8] px-3 text-xs" value={selectedMentorId} onChange={(event) => { setOffset(0); setSelectedMentorId(event.target.value) }}><option value="">All mentors</option>{mentors.map((mentor) => <option key={mentor.id} value={String(mentor.id)}>{mentor.name}</option>)}</select> : <select aria-label="Filter mentor" className="h-9 rounded-md border border-[#e7e1da] bg-[#fbfaf8] px-3 text-xs" value={mentorFilter} onChange={(event) => setMentorFilter(event.target.value)}><option>All mentors</option>{Array.from(new Set(bookings.map((booking) => booking.mentor))).map((mentor) => <option key={mentor}>{mentor}</option>)}</select>}
            {isAdminRoute ? <select aria-label="Filter batch" className="h-9 rounded-md border border-[#e7e1da] bg-[#fbfaf8] px-3 text-xs" value={selectedBatchId} onChange={(event) => { setOffset(0); setSelectedBatchId(event.target.value) }}><option value="">All batches</option>{batchData.map((batch) => <option key={batch.id} value={String(batch.id)}>{batch.name}</option>)}</select> : <select aria-label="Filter batch" className="h-9 rounded-md border border-[#e7e1da] bg-[#fbfaf8] px-3 text-xs" value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)}><option>All batches</option>{Array.from(new Set(bookings.map((booking) => booking.batch).filter((batch) => batch !== '—'))).map((batch) => <option key={batch}>{batch}</option>)}</select>}
            <label htmlFor="recordings" className="flex h-9 items-center gap-2 rounded-md border border-[#e7e1da] bg-[#fbfaf8] px-3 text-xs"><Checkbox id="recordings" checked={recordingsOnly} onCheckedChange={(value) => { if (isAdminRoute) setOffset(0); setRecordingsOnly(value === true) }} /><span className="cursor-pointer whitespace-nowrap">Has recording</span></label>
          </div>

          <div className="mt-3">
            <MentorshipBookingsTable
              bookings={visibleBookings}
              onCancel={(booking) => setSessionToCancel({ bookingId: booking.id, mentor: booking.mentor, student: booking.student, slotStart: booking.slotStart, slotEnd: booking.slotEnd })}
              loading={sessionsLoading || coursesLoading}
              error={sessionsError}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>Showing {visibleBookings.length} bookings{course ? ` for ${course.name}` : ''}</span><span>{dateFilter}</span></div>
          <div className="mt-3 flex justify-end gap-2"><Button variant="outline" size="sm" disabled={sessionsLoading || offset === 0} onClick={() => setOffset(Math.max(0, offset - pageLimit))}>Previous</Button><Button variant="outline" size="sm" disabled={sessionsLoading || apiSessions.length < pageLimit} onClick={() => setOffset(offset + pageLimit)}>Next</Button></div>
        </CardContent>
      </Card>
      <CancelMentorSessionDialog
        open={Boolean(sessionToCancel)}
        session={sessionToCancel}
        submitting={isCancelling}
        error={cancelError}
        onOpenChange={(open) => { if (!open) setSessionToCancel(null) }}
        onConfirm={confirmCancellation}
      />
    </main>
  )
}
