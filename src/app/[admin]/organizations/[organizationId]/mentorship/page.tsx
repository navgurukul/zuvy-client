'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, CheckCircle2, Download, AlertTriangle, UserRoundX, Video, CircleDot, ChevronDown, RefreshCw, Mail } from 'lucide-react'
import { useParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useOrganizationMentorSessions } from '@/app/[admin]/hooks/useOrganizationMentorSessions'
import type { OrganizationMentorSession } from '@/app/[admin]/hooks/useOrganizationMentorSessions'
import { useLiveMentorSessions } from '@/app/[admin]/hooks/useLiveMentorSessions'
import type { LiveMentorSession } from '@/app/[admin]/hooks/useLiveMentorSessions'

/** Derive tone, label, and time strings from a live session (mirrors course mentorship page) */
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
  const elapsed = minutesAgo < 0 ? `in ${Math.abs(minutesAgo)} min` : `${minutesAgo} min ${minutesAgo < 0 ? 'to go' : 'late'}`
  const fmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
  const time = `${fmt.format(slotStart)}–${fmt.format(slotEnd)}`
  const initials = (name: string) => name.split(' ').map((n) => n[0] ?? '').join('').slice(0, 2).toUpperCase()

  return { tone, statusLabel, elapsed, time, mentorJoined, studentJoined, initials }
}
const formatSessionTime = (start: string, end: string) => {
  const formatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
  return `${formatter.format(new Date(start))}–${formatter.format(new Date(end))}`
}

const getSessionStatus = (session: OrganizationMentorSession) => {
  const state = `${session.lifecycleState} ${session.status}`.toUpperCase()
  if (state.includes('COMPLET')) return 'Completed'
  if (state.includes('MISSED') || state.includes('NO_SHOW')) return 'Missed'
  if (state.includes('CANCEL')) return 'Cancelled'
  if (state.includes('PROGRESS') || state.includes('LIVE')) return 'In progress'
  return 'Upcoming'
}

const getAttendanceLabel = (session: OrganizationMentorSession) => {
  const status = (session.attendanceStatus || '').toUpperCase()
  if (status === 'NOT_APPLICABLE') return '—'
  if (status.includes('NO_SHOW') || status.includes('NOT_JOINED')) return status.includes('MENTOR') ? 'Mentor not joined' : 'Student no-show'
  if (status.includes('BOTH') || (session.mentorAttendance?.joinedAt && session.studentAttendance?.joinedAt)) return 'Both joined'
  if (status.includes('IN_PROGRESS') || status.includes('PRESENT')) return 'In progress'
  return session.attendanceStatus?.replaceAll('_', ' ').toLowerCase() || 'Scheduled'
}

const toneCardClass: Record<string, string> = {
  red: 'border-red-300 ring-2 ring-red-100',
  amber: 'border-amber-300 ring-2 ring-amber-100',
  green: 'border-slate-200',
  blue: 'border-slate-200',
}

export default function OrganizationMentorshipPage() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const pathname = usePathname()
  const role = pathname.split('/')[1] || 'admin'
  const courseBookingsHref = `/${role}/organizations/${organizationId}/courses/1120/mentorship`
  const [selectedCourse, setSelectedCourse] = useState('All courses')
  const [selectedDate, setSelectedDate] = useState('Today, 23 Oct')
  const [offset, setOffset] = useState(0)

  // Today's sessions table
  const { sessions: apiSessions, total, loading, error } = useOrganizationMentorSessions(organizationId, 100, offset)
  const courseOptions = useMemo(() => Array.from(new Set(apiSessions.map((session) => session.courseName).filter(Boolean))), [apiSessions])
  const tableSessions = useMemo(() => selectedCourse === 'All courses' ? apiSessions : apiSessions.filter((session) => session.courseName === selectedCourse), [apiSessions, selectedCourse])

  // Live Now — same API used on the course mentorship tab
  const { sessions: liveSessionsFromApi, total: liveTotalFromApi, needsAttentionCount: needsAttentionCountFromApi, loading: liveLoading, stale: liveStale, refetch: refetchLive } = useLiveMentorSessions(organizationId)

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
      bootcampName: 'Data Science Cohort',
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
      bootcampId: 1042,
      bootcampName: 'Data Science Cohort',
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
      bootcampId: 1042,
      bootcampName: 'Data Science Cohort',
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
      bootcampId: 1043,
      bootcampName: 'UI/UX Bootcamp',
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
      bootcampId: 1043,
      bootcampName: 'UI/UX Bootcamp',
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
      bootcampId: 1044,
      bootcampName: 'DevOps Masterclass',
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
      bootcampId: 1044,
      bootcampName: 'DevOps Masterclass',
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
      bootcampId: 1045,
      bootcampName: 'DevOps Masterclass',
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

  const visibleLiveSessions = useMemo(() => selectedCourse === 'All courses' ? liveSessions : liveSessions.filter((session) => session.bootcampName === selectedCourse), [liveSessions, selectedCourse])

  const downloadCsv = () => {
    const csvRows = tableSessions.map((row) => [row.courseName, formatSessionTime(row.slotStart, row.slotEnd), getSessionStatus(row), row.mentor?.name, row.student?.name, row.creditsLeft, getAttendanceLabel(row)])
    const csv = [['Course', 'Time', 'Status', 'Mentor', 'Student', 'Credits left', 'Attendance'], ...csvRows].map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = `mentorship-${organizationId}.csv`; link.click(); URL.revokeObjectURL(url)
  }

  const copyLink = async (text: string) => {
    try { await navigator.clipboard.writeText(text) } catch { /* Clipboard may be unavailable in preview. */ }
  }

  return <main className="min-h-full bg-[#fbfaf8] px-4 py-6 text-[#17232b] sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1500px] space-y-[18px]">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="text-[25px] text-left font-bold leading-tight">Mentorship</h1><p className="mt-1 text-[13px] text-slate-600">All courses in your organisation with mentorship turned on.</p></div>
        <div className="flex gap-2">
          <label className="relative flex h-9 items-center gap-2 rounded-md border border-[#e7e1da] bg-white px-3 text-xs">
            <CalendarDays className="h-4 w-4"/><select aria-label="Choose date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="appearance-none bg-transparent pr-4 outline-none"><option>Today, 23 Oct</option><option>Yesterday, 22 Oct</option><option>21 Oct</option></select><ChevronDown className="pointer-events-none absolute right-2 h-3 w-3"/>
          </label>
          <Button variant="outline" size="sm" className="h-9 bg-white text-xs" onClick={downloadCsv}><Download className="mr-2 h-4 w-4"/>Download CSV</Button>
        </div>
      </header>

      <section aria-label="Filter by course" className="flex flex-wrap items-center gap-2 text-xs"><span className="mr-1 text-slate-600">Course</span>
        {['All courses', ...courseOptions].map((course) => <button key={course} onClick={() => setSelectedCourse(course)} className={`rounded-full border px-3 py-2 transition-colors ${selectedCourse === course ? 'border-[#28622f] bg-[#28622f] font-semibold text-white' : 'border-[#e7e1da] bg-white hover:bg-slate-50'}`}>{course}{course === 'All courses' ? ` (${courseOptions.length})` : ''}</button>)}
      </section>

      <section aria-label="Today's summary" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {[
          { label: 'Sessions today', value: tableSessions.length, Icon: CalendarDays, color: 'text-green-800' },
          { label: 'Live now', value: liveLoading ? '…' : visibleLiveSessions.length, Icon: Video, color: 'text-blue-600' },
          { label: 'Need attention now', value: liveLoading ? '…' : visibleLiveSessions.filter((s) => s.needsAttention).length, Icon: AlertTriangle, color: 'text-red-600', alert: true },
          { label: 'Completed today', value: tableSessions.filter((s) => getSessionStatus(s) === 'Completed').length, Icon: CheckCircle2, color: 'text-green-600' },
          { label: 'No-shows today', value: tableSessions.filter((s) => getAttendanceLabel(s).toLowerCase().includes('no-show') || getAttendanceLabel(s) === 'Mentor not joined').length, Icon: UserRoundX, color: 'text-slate-600' },
        ].map(({ label, value, Icon, color, alert }) => <article key={label} className={`relative min-h-[102px] rounded-lg border bg-white px-3.5 py-3.5 ${alert ? 'border-red-300' : 'border-[#e7e1da]'}`}>
          <Icon className={`mb-2 h-[17px] w-[17px] ${color}`}/>{alert && <span className="absolute right-3 top-4 text-[10px] font-semibold text-red-600">Show only these</span>}
          <div className={`text-[22px] font-bold leading-none ${alert ? 'text-red-700' : ''}`}>{value}</div><p className="mt-1 text-xs text-slate-600">{label}</p>
        </article>)}
      </section>

      <section className="rounded-lg border border-[#e7e1da] bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <CircleDot className="h-3.5 w-3.5 fill-red-600 text-red-600"/>
            <h2 className="text-sm font-semibold">Live now</h2>
            <span className="text-slate-600">
              {liveLoading ? 'Loading…' : `${liveTotal} session${liveTotal !== 1 ? 's' : ''} · ${needsAttentionCount} need attention`}
            </span>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => refetchLive()} disabled={liveLoading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${liveLoading ? 'animate-spin' : ''}`}/>Refresh
          </Button>
        </div>

        {liveStale && (
          <div className="mb-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0"/>
            Last refresh failed — showing data that may be out of date. Click Refresh to try again.
          </div>
        )}

        {liveLoading && <p className="py-6 text-center text-sm text-slate-500">Loading live sessions…</p>}

        {!liveLoading && visibleLiveSessions.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">No live sessions right now.</p>
        )}

        {!liveLoading && visibleLiveSessions.length > 0 && (
          <div className="max-h-[500px] overflow-y-auto pr-1">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleLiveSessions.map((session) => {
              const { tone, statusLabel, elapsed, time, mentorJoined, studentJoined, initials } = getLiveCardProps(session)
              const dotColor = tone === 'red' ? 'text-red-500' : tone === 'amber' ? 'text-amber-500' : tone === 'green' ? 'text-green-600' : 'text-sky-500'
              const labelColor = tone === 'red' ? 'text-red-600' : tone === 'amber' ? 'text-amber-600' : tone === 'green' ? 'text-green-700' : 'text-sky-600'
              return (
                <article key={session.bookingId} className={`min-w-0 rounded-lg border bg-white p-3 ${toneCardClass[tone]}`}>

                  {/* Status + elapsed */}
                  <div className="flex items-center justify-between gap-1">
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${labelColor}`}>
                      <span className={dotColor}>●</span>{statusLabel}
                    </span>
                    <span className="shrink-0 text-[10px] text-slate-400">{elapsed}</span>
                  </div>

                  {/* Time */}
                  <p className="mt-0.5 text-[11px] text-slate-500">{time}</p>

                  {/* Person rows */}
                  <div className="mt-2 space-y-1.5">
                    {([
                      { person: session.mentor, role: 'Mentor', joined: mentorJoined, avatarClass: 'bg-green-100 text-green-700' },
                      { person: session.student, role: 'Student', joined: studentJoined, avatarClass: 'bg-blue-100 text-blue-700' },
                    ] as const).map(({ person, role, joined, avatarClass }) => (
                      <div key={person.id} className="flex items-start gap-1.5">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${avatarClass}`}>
                          {initials(person.name)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-1">
                            <span className="truncate text-xs font-semibold text-slate-800">{person.name}</span>
                            <span className="shrink-0 text-[10px] text-slate-400">· {role}</span>
                          </div>
                          <p className={`text-[10px] leading-tight ${joined ? 'text-slate-400' : role === 'Mentor' ? 'font-medium text-red-500' : 'font-medium text-amber-500'}`}>
                            {joined
                              ? `Joined ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(person.joinedAt ?? ''))}`
                              : 'Not joined yet'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Primary actions */}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <Button
                      size="sm"
                      disabled={!session.meetingLink}
                      className="h-7 bg-[#28622f] px-3 text-xs font-medium hover:bg-[#204f26]"
                      onClick={() => session.meetingLink && window.open(session.meetingLink, '_blank')}
                    >
                      Join session
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 bg-white px-2.5 text-xs">Details</Button>
                  </div>

                  {/* Secondary actions — only when needed */}
                  {(!mentorJoined || !studentJoined || tone !== 'green') && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {!mentorJoined && (
                        <Button size="sm" variant="outline" className="h-7 bg-white px-2.5 text-xs" onClick={() => copyLink(session.mentor.email)}>
                          <Mail className="mr-1 h-3 w-3" />Mentor email
                        </Button>
                      )}
                      {!studentJoined && (
                        <Button size="sm" variant="outline" className="h-7 bg-white px-2.5 text-xs" onClick={() => copyLink(session.student.email)}>
                          <Mail className="mr-1 h-3 w-3" />Student email
                        </Button>
                      )}
                      {tone !== 'green' && (
                        <Button size="sm" variant="outline" className="h-7 border-red-200 bg-white px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700">
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}

                </article>
              )
            })}
          </div>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border border-[#e7e1da] bg-white">
        <div className="flex items-center justify-between px-4 pb-3 pt-4"><h2 className="text-sm font-semibold">Today&apos;s sessions</h2><Link href={courseBookingsHref} className="text-xs font-medium text-green-800 underline underline-offset-2">Open a course&apos;s full bookings →</Link></div>
        {error && <p role="alert" className="px-4 py-3 text-xs text-red-700">{error}</p>}
        <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-xs"><thead className="border-b border-[#eee9e3] text-slate-600"><tr>{['Time', 'Course', 'Mentor', 'Student', 'Credits left', 'Status', 'Attendance', ''].map((heading) => <th key={heading} className="px-3.5 py-3 font-medium">{heading}</th>)}</tr></thead><tbody>{tableSessions.map((row) => {
          const status = getSessionStatus(row)
          const attendance = getAttendanceLabel(row)
          const statusTone = status === 'Completed' || status === 'In progress' ? 'bg-green-50 text-green-800' : status === 'Missed' || status === 'Cancelled' ? 'bg-stone-100 text-stone-700' : 'bg-sky-50 text-sky-800'
          const attendanceTone = attendance === 'Both joined' || attendance === 'In progress' ? 'bg-green-50 text-green-800' : attendance.toLowerCase().includes('no-show') || attendance === 'Mentor not joined' ? 'bg-red-50 text-red-700' : attendance === 'Student not joined' ? 'bg-amber-100 text-amber-800' : 'bg-sky-50 text-sky-800'
          return <tr key={row.bookingId} className="border-b border-[#eee9e3] last:border-0"><td className="whitespace-nowrap px-3.5 py-3.5 font-medium">{formatSessionTime(row.slotStart, row.slotEnd)}</td><td className="px-3.5 py-3.5">{row.courseName}</td><td className="px-3.5 py-3.5">{row.mentor?.name || '—'}</td><td className="px-3.5 py-3.5">{row.student?.name || '—'}</td><td className="px-3.5 py-3.5"><span className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${row.creditsLeft === 0 ? 'bg-red-50 text-red-700' : row.creditsLeft === 1 ? 'bg-amber-100 text-amber-800' : 'bg-green-50 text-green-800'}`}><span className="mr-1">●</span>{row.creditsLeft} of {row.creditsAssigned} left</span></td><td className="px-3.5 py-3.5"><span className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone}`}><span className="mr-1">●</span>{status}</span></td><td className="px-3.5 py-3.5"><span className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${attendanceTone}`}><span className="mr-1">●</span>{attendance}</span></td><td className="px-3.5 py-3.5"><Link href={courseBookingsHref} className="inline-flex h-8 items-center rounded-md border border-[#e7e1da] bg-white px-3 hover:bg-stone-50">View</Link></td></tr>
        })}{!loading && !error && tableSessions.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No mentorship sessions found.</td></tr>}{loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading sessions…</td></tr>}</tbody></table></div>
        <div className="flex items-center justify-between border-t border-[#eee9e3] px-4 py-3 text-xs text-slate-500"><span>{total !== null ? `Showing ${offset + 1}–${offset + apiSessions.length} of ${total}` : `Showing ${apiSessions.length} sessions`}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={loading || offset === 0} onClick={() => setOffset(Math.max(0, offset - 100))}>Previous</Button><Button variant="outline" size="sm" disabled={loading || apiSessions.length < 100 || (total !== null && offset + apiSessions.length >= total)} onClick={() => setOffset(offset + 100)}>Next</Button></div></div>
      </section>
    </div>
  </main>
}
