'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { CalendarDays, CheckCircle2, Clock3, Download, Link2, Mail, RefreshCw, Search, Star, Users, Video, XCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useBootcamps } from '@/app/[admin]/hooks/useBootcamps'
import { useOrganizationMentorSessions } from '@/app/[admin]/hooks/useOrganizationMentorSessions'
import type { OrganizationMentorSession } from '@/app/[admin]/hooks/useOrganizationMentorSessions'

type BookingStatus = 'Completed' | 'Missed' | 'Cancelled' | 'Upcoming' | 'In progress'

type Booking = {
  id: number
  date: string
  time: string
  mentor: string
  mentorEmail: string
  student: string
  studentEmail: string
  credits: number
  creditsAssigned: number
  batch: string
  status: BookingStatus
  attendance: string
  rating: number | null
  recording: boolean
  recordingUrl?: string | null
}

const liveSessions = [
  { status: 'Mentor not joined', tone: 'red', started: 'Started 6 min ago', time: '4:00–4:45 PM · Batch A', mentor: 'Arjun Mehta', student: 'Riya Sharma', mentorJoined: false, studentJoined: true, initials: ['AM', 'RS'] },
  { status: 'Student not joined', tone: 'amber', started: 'Started 7 min ago', time: '4:30–5:00 PM · Batch B', mentor: 'Neha Kapoor', student: 'Karan Patel', mentorJoined: true, studentJoined: false, initials: ['NK', 'KP'] },
  { status: 'In progress', tone: 'green', started: 'Started 22 min ago', time: '3:45–4:30 PM · Batch C', mentor: 'Vikram Rao', student: 'Sana Qureshi', mentorJoined: true, studentJoined: true, initials: ['VR', 'SQ'] },
  { status: 'Starting soon', tone: 'blue', started: 'Starts in 8 min', time: '4:15–5:00 PM · Batch A', mentor: 'Arjun Mehta', student: 'Ishita Verma', mentorJoined: false, studentJoined: false, initials: ['AM', 'IV'] },
]

const statusStyles: Record<BookingStatus, string> = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Missed: 'bg-slate-100 text-slate-600',
  Cancelled: 'bg-slate-100 text-slate-600',
  Upcoming: 'bg-blue-50 text-blue-700',
  'In progress': 'bg-emerald-50 text-emerald-700',
}

const toneStyles: Record<string, string> = {
  red: 'border-red-200 bg-red-50/40',
  amber: 'border-amber-200 bg-amber-50/40',
  green: 'border-emerald-200 bg-emerald-50/40',
  blue: 'border-sky-200 bg-sky-50/40',
}

function downloadCsv(rows: Booking[]) {
  const headers = ['Date and time', 'Mentor', 'Student', 'Credits left', 'Batch', 'Status', 'Attendance', 'Rating', 'Recording']
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const csv = [headers, ...rows.map((row) => [`${row.date} ${row.time}`, row.mentor, row.student, row.credits, row.batch, row.status, row.attendance, row.rating ?? '', row.recording ? 'Available' : 'Not held'])]
    .map((line) => line.map(escape).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'mentorship-bookings.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

function StatusPill({ status }: { status: BookingStatus }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>
}

function toBooking(session: OrganizationMentorSession): Booking {
  const slotStart = new Date(session.slotStart)
  const slotEnd = new Date(session.slotEnd)
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).format(slotStart)
  const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
  const state = `${session.lifecycleState} ${session.status}`.toUpperCase()
  const status: BookingStatus = state.includes('COMPLET') ? 'Completed' : state.includes('MISSED') || state.includes('NO_SHOW') ? 'Missed' : state.includes('CANCEL') ? 'Cancelled' : state.includes('PROGRESS') || state.includes('LIVE') ? 'In progress' : 'Upcoming'
  const attendanceState = (session.attendanceStatus || '').toUpperCase()
  const attendance = attendanceState === 'NOT_APPLICABLE' ? '—'
    : attendanceState.includes('NO_SHOW') || attendanceState.includes('NOT_JOINED') ? (attendanceState.includes('MENTOR') ? 'Mentor not joined' : 'Student no-show')
      : attendanceState.includes('BOTH') || (session.mentorAttendance?.joinedAt && session.studentAttendance?.joinedAt) ? 'Both joined'
        : attendanceState.replaceAll('_', ' ').toLowerCase() || 'Scheduled'
  return {
    id: session.bookingId,
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
    rating: session.mentorRating ?? session.studentRating ?? null,
    recording: Boolean(session.recordingUrl),
    recordingUrl: session.recordingUrl,
  }
}

export default function MentorshipPage() {
  const { organizationId, courseId } = useParams<{ organizationId: string; courseId: string }>()
  const { courses, loading: coursesLoading } = useBootcamps({ limit: 1000, searchTerm: '', offset: 0 })
  const course = courses.find((item) => String(item.id) === String(courseId))
  const [offset, setOffset] = useState(0)
  const { sessions: apiSessions, loading: sessionsLoading, error: sessionsError } = useOrganizationMentorSessions(organizationId, 100, offset)
  const courseSessions = useMemo(() => course ? apiSessions.filter((session) => session.courseName === course.name) : [], [apiSessions, course])
  const bookings = useMemo(() => courseSessions.map(toBooking), [courseSessions])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [batchFilter, setBatchFilter] = useState('All batches')
  const [mentorFilter, setMentorFilter] = useState('All mentors')
  const [dateFilter, setDateFilter] = useState('Last 30 days')
  const [recordingsOnly, setRecordingsOnly] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState('Updated 2 min ago')

  const visibleBookings = useMemo(() => bookings.filter((booking) => {
    const searchMatches = `${booking.mentor} ${booking.student} ${booking.mentorEmail} ${booking.studentEmail}`.toLowerCase().includes(query.toLowerCase())
    return searchMatches
      && (statusFilter === 'All' || booking.status === statusFilter)
      && (batchFilter === 'All batches' || booking.batch === batchFilter)
      && (mentorFilter === 'All mentors' || booking.mentor === mentorFilter)
      && (!recordingsOnly || booking.recording)
  }), [batchFilter, bookings, mentorFilter, query, recordingsOnly, statusFilter])

  const copyLink = async (text: string) => {
    try { await navigator.clipboard.writeText(text) } catch { /* Clipboard may be unavailable in preview. */ }
  }

  return (
    <main className="space-y-4 pb-10 pt-4 text-left">
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Mentorship</h1>
          <p className="mt-1 text-sm text-muted-foreground">See who booked, what’s live right now, and every session recording for this course.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadCsv(visibleBookings)}><Download className="mr-2 h-4 w-4" />Download CSV</Button>
      </section>

      <section aria-label="Mentorship overview" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total bookings', value: '124', icon: CalendarDays, color: 'text-emerald-700' },
          { label: 'Upcoming', value: '18', icon: Clock3, color: 'text-blue-600' },
          { label: 'Completed', value: '86', icon: CheckCircle2, color: 'text-green-600' },
          { label: 'No-shows', value: '9', icon: Users, color: 'text-red-500' },
          { label: 'Cancelled', value: '11', icon: XCircle, color: 'text-slate-500' },
          { label: 'Avg rating (from students)', value: '4.6', icon: Star, color: 'text-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-none"><CardContent className="p-4">
            <Icon className={`mb-2 h-4 w-4 ${color}`} />
            <div className="text-xl font-semibold leading-none">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{label}</div>
          </CardContent></Card>
        ))}
      </section>

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
            <div><h2 className="font-semibold">Bookings</h2><p className="mt-0.5 text-xs text-muted-foreground">Browse mentorship sessions and attendance.</p></div>
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter bookings by status">
              {(['All', 'Upcoming', 'Completed', 'Missed', 'Cancelled'] as const).map((status) => {
                const count = status === 'All' ? bookings.length : bookings.filter((booking) => booking.status === status).length
                return <Button key={status} size="sm" variant={statusFilter === status ? 'default' : 'outline'} className="h-8 rounded-full px-3 text-xs" onClick={() => setStatusFilter(status)}>{status} <span className="ml-1 opacity-75">{count}</span></Button>
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative sm:col-span-2 lg:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student or mentor" className="mt-0 h-9 pl-9" /></div>
            <select aria-label="Date range" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}><option>Last 30 days</option><option>Last 7 days</option><option>All time</option></select>
            <select aria-label="Filter mentor" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={mentorFilter} onChange={(event) => setMentorFilter(event.target.value)}><option>All mentors</option>{Array.from(new Set(bookings.map((booking) => booking.mentor))).map((mentor) => <option key={mentor}>{mentor}</option>)}</select>
            <div className="flex items-center gap-2 rounded-md border border-input px-3 text-sm"><Checkbox id="recordings" checked={recordingsOnly} onCheckedChange={(value) => setRecordingsOnly(value === true)} /><label htmlFor="recordings" className="cursor-pointer whitespace-nowrap">Has recording</label></div>
            <select aria-label="Filter batch" className="h-9 rounded-md border border-input bg-background px-3 text-sm sm:col-span-2 lg:col-span-1" value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)}><option>All batches</option>{Array.from(new Set(bookings.map((booking) => booking.batch).filter((batch) => batch !== '—'))).map((batch) => <option key={batch}>{batch}</option>)}</select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
              <thead><tr className="border-b text-muted-foreground">
                {['Date and time', 'Mentor', 'Student', 'Credits left', 'Batch', 'Status', 'Attendance', 'Ratings', 'Recording'].map((heading) => <th key={heading} className="px-2 py-3 font-medium">{heading}</th>)}
              </tr></thead>
              <tbody>
                {visibleBookings.map((booking) => <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="whitespace-nowrap px-2 py-3 font-medium">{booking.date}<div className="mt-0.5 text-[10px] font-normal text-muted-foreground">{booking.time}</div></td>
                  <td className="px-2 py-3">{booking.mentor}</td>
                  <td className="px-2 py-3">{booking.student}<div className="mt-0.5 text-[10px] text-muted-foreground">{booking.studentEmail}</div></td>
                  <td className="px-2 py-3"><span className={`rounded-full px-2 py-1 ${booking.credits === 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{booking.credits} of {booking.creditsAssigned} left</span></td>
                  <td className="px-2 py-3">{booking.batch}</td>
                  <td className="px-2 py-3"><StatusPill status={booking.status} /></td>
                  <td className="px-2 py-3"><span className={`rounded-full px-2 py-1 ${booking.attendance.includes('no-show') ? 'bg-red-50 text-red-700' : booking.attendance.includes('late') ? 'bg-amber-50 text-amber-700' : booking.attendance === 'Both joined' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{booking.attendance}</span></td>
                  <td className="px-2 py-3 text-muted-foreground">{booking.rating ? <>{booking.rating} <Star className="inline h-3 w-3 fill-amber-400 text-amber-400" /> <span>· Mentor</span></> : '—'}<div>Student · Mentor</div></td>
                  <td className="px-2 py-3">{booking.recordingUrl ? <a href={booking.recordingUrl} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center text-xs text-primary"><Video className="mr-1 h-3.5 w-3.5" />Watch</a> : <span className="text-muted-foreground">Not held</span>}</td>
                </tr>)}
                {(sessionsLoading || coursesLoading) && <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">Loading bookings…</td></tr>}
                {!sessionsLoading && !coursesLoading && !sessionsError && !visibleBookings.length && <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No bookings match these filters.</td></tr>}
                {sessionsError && <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-red-600">{sessionsError}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>Showing {visibleBookings.length} bookings{course ? ` for ${course.name}` : ''}</span><span>{dateFilter}</span></div>
          <div className="mt-3 flex justify-end gap-2"><Button variant="outline" size="sm" disabled={sessionsLoading || offset === 0} onClick={() => setOffset(Math.max(0, offset - 100))}>Previous</Button><Button variant="outline" size="sm" disabled={sessionsLoading || apiSessions.length < 100} onClick={() => setOffset(offset + 100)}>Next</Button></div>
        </CardContent>
      </Card>
    </main>
  )
}
