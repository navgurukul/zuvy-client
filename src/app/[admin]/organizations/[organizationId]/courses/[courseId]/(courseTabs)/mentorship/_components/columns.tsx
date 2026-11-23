'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Star, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type MentorshipBookingStatus = 'Completed' | 'Missed' | 'Cancelled' | 'Upcoming' | 'In progress'

export type MentorshipBooking = {
  id: number
  mentorId: string
  date: string
  time: string
  mentor: string
  mentorEmail: string
  student: string
  studentEmail: string
  credits: number
  creditsAssigned: number
  batch: string
  status: MentorshipBookingStatus
  attendance: string
  mentorRating: number | null
  studentRating: number | null
  recording: boolean
  recordingUrl?: string | null
  recordingStatus?: string | null
  slotStart: string
  slotEnd: string
}

const statusStyle: Record<MentorshipBookingStatus, string> = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Missed: 'bg-slate-100 text-slate-600',
  Cancelled: 'bg-slate-100 text-slate-600',
  Upcoming: 'bg-blue-50 text-blue-700',
  'In progress': 'bg-emerald-50 text-emerald-700',
}

function Rating({ label, value }: { label: string; value: number | null }) {
  return <div>{label} {value === null ? '—' : <><Star className="ml-0.5 inline h-2.5 w-2.5 fill-amber-400 text-amber-400" /> {value}</>}</div>
}

export function createMentorshipColumns(onCancel: (booking: MentorshipBooking) => void): ColumnDef<MentorshipBooking>[] {
  return [
    {
      accessorKey: 'date',
      header: 'Date and time',
      cell: ({ row }) => <div className="whitespace-nowrap font-semibold">{row.original.date}<div className="mt-0.5 text-[10px] font-normal text-slate-500">{row.original.time}</div></div>,
    },
    { accessorKey: 'mentor', header: 'Mentor', cell: ({ row }) => <span className="whitespace-nowrap font-medium">{row.original.mentor}</span> },
    {
      accessorKey: 'student',
      header: 'Student',
      cell: ({ row }) => <div><div className="whitespace-nowrap font-medium">{row.original.student}</div><div className="mt-0.5 max-w-[150px] truncate text-[10px] text-slate-500">{row.original.studentEmail}</div></div>,
    },
    {
      accessorKey: 'credits',
      header: 'Credits left',
      cell: ({ row }) => {
        const { credits, creditsAssigned } = row.original
        const tone = credits === 0 ? 'bg-red-50 text-red-700' : credits === 1 ? 'bg-amber-100 text-amber-800' : 'bg-green-50 text-green-800'
        return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${tone}`}><span>●</span>{credits} of {creditsAssigned} left</span>
      },
    },
    { accessorKey: 'batch', header: 'Batch', cell: ({ row }) => <span className="whitespace-nowrap">{row.original.batch}</span> },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle[row.original.status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{row.original.status}</span>,
    },
    {
      accessorKey: 'attendance',
      header: 'Attendance',
      cell: ({ row }) => {
        const attendance = row.original.attendance
        const tone = attendance === 'Both joined' || attendance === 'In progress' ? 'bg-green-50 text-green-800' : attendance.toLowerCase().includes('no-show') || attendance.includes('not joined') ? 'bg-red-50 text-red-700' : attendance.includes('late') ? 'bg-amber-100 text-amber-800' : attendance === 'Scheduled' ? 'bg-sky-50 text-sky-800' : 'bg-stone-100 text-stone-600'
        return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${tone}`}><span>●</span>{attendance}</span>
      },
    },
    {
      id: 'ratings',
      header: 'Ratings',
      cell: ({ row }) => <div className="whitespace-nowrap text-[10px] text-slate-600"><Rating label="Student → Mentor" value={row.original.studentRating} /><Rating label="Mentor → Student" value={row.original.mentorRating} /></div>,
    },
    {
      id: 'recording',
      header: 'Recording',
      cell: ({ row }) => {
        const { recordingUrl, recordingStatus } = row.original
        const state = (recordingStatus || '').toUpperCase()
        return recordingUrl ? <a href={recordingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-green-800 underline"><Video className="h-3.5 w-3.5" />Watch</a> : state.includes('PROCESS') || state === 'PENDING' ? <span className="whitespace-nowrap text-slate-600">Processing</span> : <span className="whitespace-nowrap text-slate-600">Not held</span>
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const canCancel = String(row.original.status).toLowerCase() === 'upcoming'
        return <div className="flex items-center gap-1.5"><Button type="button" variant="outline" size="sm" className="h-7 border-[#e7e1da] bg-white px-3 text-[10px]">View</Button><Button type="button" variant="outline" size="sm" onClick={() => onCancel(row.original)} className="h-7 border-[#e7e1da] bg-white px-2 text-[10px] text-red-600">Cancel</Button></div>
      },
    },
  ]
}
