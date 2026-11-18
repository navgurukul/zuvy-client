'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, CheckCircle2, Download, AlertTriangle, UserRoundX, Video, CircleDot, ChevronDown } from 'lucide-react'
import { useParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useOrganizationMentorSessions } from '@/app/[admin]/hooks/useOrganizationMentorSessions'
import type { OrganizationMentorSession } from '@/app/[admin]/hooks/useOrganizationMentorSessions'

type Session = {
  course: string; time: string; status: 'Mentor not joined' | 'Student not joined' | 'In progress' | 'Starting soon'
  elapsed: string; mentor: string; student: string; mentorJoined: boolean; studentJoined: boolean; initials: string[]
}

const courses = ['React Bootcamp', 'Full Stack JS', 'DSA Placement Prep']
const sessions: Session[] = [
  { course: courses[0], time: '6:00–6:45 PM', status: 'Mentor not joined', elapsed: '6 min late', mentor: 'Arjun Mehta', student: 'Riya Sharma', mentorJoined: false, studentJoined: true, initials: ['AM', 'RS'] },
  { course: courses[2], time: '6:00–6:30 PM', status: 'Student not joined', elapsed: '7 min late', mentor: 'Farhan Ali', student: 'Meera Joshi', mentorJoined: true, studentJoined: false, initials: ['FA', 'MJ'] },
  { course: courses[1], time: '5:45–6:30 PM', status: 'In progress', elapsed: '22 min in', mentor: 'Tanvi Shah', student: 'Nikhil Das', mentorJoined: true, studentJoined: true, initials: ['TS', 'ND'] },
  { course: courses[0], time: '5:57–6:42 PM', status: 'In progress', elapsed: '10 min in', mentor: 'Vikram Rao', student: 'Sana Qureshi', mentorJoined: true, studentJoined: true, initials: ['VR', 'SQ'] },
  { course: courses[1], time: '6:15–7:00 PM', status: 'Starting soon', elapsed: 'in 8 min', mentor: 'Tanvi Shah', student: 'Ayesha Khan', mentorJoined: false, studentJoined: false, initials: ['TS', 'AK'] },
]
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
const statusClass: Record<Session['status'], string> = {
  'Mentor not joined': 'bg-red-50 text-red-700', 'Student not joined': 'bg-amber-100 text-amber-800',
  'In progress': 'bg-green-50 text-green-700', 'Starting soon': 'bg-sky-50 text-sky-700',
}

export default function OrganizationMentorshipPage() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const pathname = usePathname()
  const role = pathname.split('/')[1] || 'admin'
  const courseBookingsHref = `/${role}/organizations/${organizationId}/courses/1120/mentorship`
  const [selectedCourse, setSelectedCourse] = useState('All courses')
  const [selectedDate, setSelectedDate] = useState('Today, 23 Oct')
  const [offset, setOffset] = useState(0)
  const { sessions: apiSessions, total, loading, error } = useOrganizationMentorSessions(organizationId, 100, offset)
  const courseOptions = useMemo(() => Array.from(new Set(apiSessions.map((session) => session.courseName).filter(Boolean))), [apiSessions])
  const displayedCourses = courseOptions.length ? courseOptions : courses
  const tableSessions = useMemo(() => selectedCourse === 'All courses' ? apiSessions : apiSessions.filter((session) => session.courseName === selectedCourse), [apiSessions, selectedCourse])
  const visibleSessions = useMemo(() => selectedCourse === 'All courses' ? sessions : sessions.filter((session) => session.course === selectedCourse), [selectedCourse])
  const attentionCount = visibleSessions.filter((session) => session.status === 'Mentor not joined' || session.status === 'Student not joined').length
  const downloadCsv = () => {
    const csvRows = tableSessions.map((row) => [row.courseName, formatSessionTime(row.slotStart, row.slotEnd), getSessionStatus(row), row.mentor?.name, row.student?.name, row.creditsLeft, getAttendanceLabel(row)])
    const csv = [['Course', 'Time', 'Status', 'Mentor', 'Student', 'Credits left', 'Attendance'], ...csvRows].map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = `mentorship-${organizationId}.csv`; link.click(); URL.revokeObjectURL(url)
  }

  return <main className="min-h-full bg-[#fbfaf8] px-4 py-6 text-[#17232b] sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1500px] space-y-[18px]">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="text-[25px] font-bold leading-tight">Mentorship</h1><p className="mt-1 text-[13px] text-slate-600">All courses in your organisation with mentorship turned on. Sample data.</p></div>
        <div className="flex gap-2">
          <label className="relative flex h-9 items-center gap-2 rounded-md border border-[#e7e1da] bg-white px-3 text-xs">
            <CalendarDays className="h-4 w-4"/><select aria-label="Choose date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="appearance-none bg-transparent pr-4 outline-none"><option>Today, 23 Oct</option><option>Yesterday, 22 Oct</option><option>21 Oct</option></select><ChevronDown className="pointer-events-none absolute right-2 h-3 w-3"/>
          </label>
          <Button variant="outline" size="sm" className="h-9 bg-white text-xs" onClick={downloadCsv}><Download className="mr-2 h-4 w-4"/>Download CSV</Button>
        </div>
      </header>

      <section aria-label="Filter by course" className="flex flex-wrap items-center gap-2 text-xs"><span className="mr-1 text-slate-600">Course</span>
        {['All courses', ...displayedCourses].map((course) => <button key={course} onClick={() => setSelectedCourse(course)} className={`rounded-full border px-3 py-2 transition-colors ${selectedCourse === course ? 'border-[#28622f] bg-[#28622f] font-semibold text-white' : 'border-[#e7e1da] bg-white hover:bg-slate-50'}`}>{course}{course === 'All courses' ? ` (${displayedCourses.length})` : ''}</button>)}
      </section>

      <section aria-label="Today's summary" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {[
          { label: 'Sessions today', value: selectedCourse === 'All courses' ? 14 : selectedCourse === courses[0] ? 6 : selectedCourse === courses[1] ? 5 : 3, Icon: CalendarDays, color: 'text-green-800' },
          { label: 'Live now', value: visibleSessions.length, Icon: Video, color: 'text-blue-600' },
          { label: 'Need attention now', value: attentionCount, Icon: AlertTriangle, color: 'text-red-600', alert: true },
          { label: 'Completed today', value: selectedCourse === 'All courses' ? 6 : 2, Icon: CheckCircle2, color: 'text-green-600' },
          { label: 'No-shows today', value: selectedCourse === 'All courses' ? 1 : attentionCount ? 1 : 0, Icon: UserRoundX, color: 'text-slate-600' },
        ].map(({ label, value, Icon, color, alert }) => <article key={label} className={`relative min-h-[102px] rounded-lg border bg-white px-3.5 py-3.5 ${alert ? 'border-red-300' : 'border-[#e7e1da]'}`}>
          <Icon className={`mb-2 h-[17px] w-[17px] ${color}`}/>{alert && <span className="absolute right-3 top-4 text-[10px] font-semibold text-red-600">Show only these</span>}
          <div className={`text-[22px] font-bold leading-none ${alert ? 'text-red-700' : ''}`}>{value}</div><p className="mt-1 text-xs text-slate-600">{label}</p>
        </article>)}
      </section>

      <section className="rounded-lg border border-[#e7e1da] bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs"><CircleDot className="h-3.5 w-3.5 fill-red-600 text-red-600"/><h2 className="text-sm font-semibold">Live now</h2><span className="text-slate-600">Needs attention first · refreshes every minute</span></div>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
          {visibleSessions.map((session, index) => <article key={`${session.student}-${index}`} className={`min-w-0 rounded-lg border p-3 ${session.status === 'Mentor not joined' ? 'border-red-300 ring-1 ring-red-100' : session.status === 'Student not joined' ? 'border-amber-300 ring-1 ring-amber-100' : 'border-[#e7e1da]'}`}>
            <div className="flex items-center justify-between gap-1"><span className={`truncate rounded px-2 py-1 text-[10px] font-semibold ${statusClass[session.status]}`}><span className="mr-1">●</span>{session.status}</span><span className="whitespace-nowrap text-[10px] text-slate-600">{session.elapsed}</span></div>
            <p className="mt-2.5 truncate text-xs font-semibold">{session.course}<span className="ml-1 font-normal text-slate-500">· {session.time}</span></p>
            <div className="mt-2.5 space-y-1.5">
              {[session.mentor, session.student].map((name, i) => <div key={name} className="flex items-center gap-2 text-xs">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${i === 0 ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-700'}`}>{session.initials[i]}</span>
                <div className="min-w-0 leading-tight"><div className="truncate"><strong>{name}</strong><span className="text-slate-500"> · {i ? 'Student' : 'Mentor'}</span></div><div className={`mt-0.5 text-[10px] ${!(i ? session.studentJoined : session.mentorJoined) && session.status !== 'Starting soon' ? 'font-medium text-red-600' : 'text-slate-500'}`}>{i ? session.studentJoined ? 'Joined 5:57 PM' : 'Not joined yet' : session.mentorJoined ? 'Joined 5:54 PM' : 'Not joined yet'}</div></div>
              </div>)}
            </div>
            <div className="mt-2.5 flex gap-1.5"><Button size="sm" disabled={session.status === 'Starting soon'} className="h-[30px] bg-[#28622f] px-2.5 text-[11px] hover:bg-[#204f26]">Join session</Button><Button size="sm" variant="outline" className="h-[30px] px-2.5 text-[11px]">Details</Button></div>
          </article>)}
        </div>
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
