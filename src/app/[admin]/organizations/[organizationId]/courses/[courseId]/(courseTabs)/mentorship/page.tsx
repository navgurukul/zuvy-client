'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { CalendarDays, CheckCircle2, Clock3, Download, Link2, Mail, RefreshCw, Search, Star, Users, XCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { CancelMentorSessionDialog, type CancelSessionDetails } from './_components/CancelMentorSessionDialog'
import { MentorshipBookingsTable } from './_components/MentorshipBookingsTable'
import { type MentorshipBooking } from './_components/columns'

const liveSessions = [
  { status: 'Mentor not joined', tone: 'red', started: 'Started 6 min ago', time: '4:00–4:45 PM · Batch A', mentor: 'Arjun Mehta', student: 'Riya Sharma', mentorJoined: false, studentJoined: true, initials: ['AM', 'RS'] },
  { status: 'Student not joined', tone: 'amber', started: 'Started 7 min ago', time: '4:30–5:00 PM · Batch B', mentor: 'Neha Kapoor', student: 'Karan Patel', mentorJoined: true, studentJoined: false, initials: ['NK', 'KP'] },
  { status: 'In progress', tone: 'green', started: 'Started 22 min ago', time: '3:45–4:30 PM · Batch C', mentor: 'Vikram Rao', student: 'Sana Qureshi', mentorJoined: true, studentJoined: true, initials: ['VR', 'SQ'] },
  { status: 'Starting soon', tone: 'blue', started: 'Starts in 8 min', time: '4:15–5:00 PM · Batch A', mentor: 'Arjun Mehta', student: 'Ishita Verma', mentorJoined: false, studentJoined: false, initials: ['AM', 'IV'] },
]

const toneStyles: Record<string, string> = {
  red: 'border-red-200 bg-red-50/40',
  amber: 'border-amber-200 bg-amber-50/40',
  green: 'border-emerald-200 bg-emerald-50/40',
  blue: 'border-sky-200 bg-sky-50/40',
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
  const [query, setQuery] = useState('')
  const [batchFilter, setBatchFilter] = useState('All batches')
  const [mentorFilter, setMentorFilter] = useState('All mentors')
  const [dateFilter, setDateFilter] = useState('Last 30 days')
  const [refreshedAt, setRefreshedAt] = useState('Updated 2 min ago')
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
          <p className="mt-1 text-sm text-muted-foreground">See who booked, what’s live right now, and every session recording for this course.</p>
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

      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /><h2 className="font-semibold">Live now</h2><span className="text-xs text-muted-foreground">4 sessions · 2 need attention · {refreshedAt}</span></div>
            <Button variant="outline" size="sm" onClick={() => setRefreshedAt('Updated just now')}><RefreshCw className="mr-2 h-3.5 w-3.5" />Refresh</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {liveSessions.map((session) => (
              <article key={`${session.mentor}-${session.student}`} className={`rounded-lg border p-3 ${toneStyles[session.tone]}`}>
                <div className="flex items-center justify-between gap-2"><Badge variant="outline" className="rounded-full border-0 bg-white/80 px-2 py-1 text-[10px] font-medium text-foreground"><span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${session.tone === 'red' ? 'bg-red-500' : session.tone === 'amber' ? 'bg-amber-500' : session.tone === 'green' ? 'bg-green-600' : 'bg-sky-500'}`} />{session.status}</Badge><span className="text-[10px] text-muted-foreground">{session.started}</span></div>
                <p className="mt-3 text-xs text-muted-foreground">{session.time}</p>
                <div className="mt-2 space-y-2">
                  {[session.mentor, session.student].map((name, index) => <div key={name} className="flex items-center gap-2 text-xs">
                    <Avatar className="h-6 w-6"><AvatarFallback className={`text-[9px] ${index ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{session.initials[index]}</AvatarFallback></Avatar>
                    <span className="font-medium">{name}</span><span className="text-muted-foreground">· {index ? 'Student' : 'Mentor'}</span>
                    {!session.mentorJoined && !index && <span className="text-red-600">Not joined yet</span>}
                    {!session.studentJoined && index === 1 && <span className="text-amber-700">Not joined yet</span>}
                  </div>)}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Button size="sm" className="h-7 px-2 text-xs" disabled={session.tone === 'blue'}>Join session</Button>
                  <Button size="sm" variant="outline" className="h-7 bg-white px-2 text-xs" onClick={() => copyLink(`https://meet.example.com/${session.student.toLowerCase().replaceAll(' ', '-')}`)}><Link2 className="mr-1 h-3 w-3" />Link</Button>
                  <Button size="sm" variant="outline" className="h-7 bg-white px-2 text-xs" onClick={() => copyLink(`${session.student.toLowerCase().replaceAll(' ', '.')}@example.com`)}><Mail className="mr-1 h-3 w-3" />Copy student email</Button>
                </div>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
            <div><h2 className="font-semibold text-lg">Bookings</h2><p className="mt-0.5 text-xs text-muted-foreground">Browse mentorship sessions and attendance.</p></div>
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
