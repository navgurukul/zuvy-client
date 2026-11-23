'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export type CancelSessionDetails = {
  bookingId: number
  mentor: string
  student: string
  slotStart: string
  slotEnd: string
}

type Props = {
  open: boolean
  session: CancelSessionDetails | null
  submitting?: boolean
  error?: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: (bookingId: number, reason: string, askedBy: 'student' | 'mentor') => Promise<void>
}

export function CancelMentorSessionDialog({ open, session, submitting = false, error, onOpenChange, onConfirm }: Props) {
  const [askedBy, setAskedBy] = useState('')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (open) {
      setAskedBy('')
      setReason('')
      setNote('')
      setValidationError('')
    }
  }, [open, session?.bookingId])

  if (!session) return null

  const start = new Date(session.slotStart)
  const end = new Date(session.slotEnd)
  const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).format(start)
  const timeLabel = `${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(start)}–${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(end)}`

  const submit = async () => {
    if (!askedBy || !reason) {
      setValidationError('Choose who asked and a cancellation reason.')
      return
    }
    if (note.trim().length < 10) {
      setValidationError('Add a note with at least 10 characters.')
      return
    }
    setValidationError('')
    await onConfirm(session.bookingId, `${reason}: ${note.trim()}`, askedBy as 'student' | 'mentor')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[468px] gap-0 rounded-lg border-[#e7e1da] bg-[#fbfaf8] p-5 text-[#1f2a24] shadow-xl sm:max-w-[468px]">
        <DialogTitle className="text-base font-semibold">Cancel this session?</DialogTitle>
        <p className="mt-2 text-xs text-[#53635a]">{session.mentor} and {session.student} · {dateLabel}, {timeLabel}</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="space-y-1 text-xs font-medium">Who asked? *
            <select value={askedBy} onChange={(event) => setAskedBy(event.target.value)} className="h-9 w-full rounded-md border border-[#e7e1da] bg-white px-3 text-xs font-normal outline-none focus:ring-2 focus:ring-green-700/20">
              <option value="">Choose</option><option value="student">Student</option><option value="mentor">Mentor</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium">Reason *
            <select value={reason} onChange={(event) => setReason(event.target.value)} className="h-9 w-full rounded-md border border-[#e7e1da] bg-white px-3 text-xs font-normal outline-none focus:ring-2 focus:ring-green-700/20">
              <option value="">Choose</option><option>Schedule conflict</option><option>Personal emergency</option><option>Other</option>
            </select>
          </label>
        </div>

        <label className="mt-3 space-y-1 text-xs font-medium">Note, shown to the mentor and the student *
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="The mentor has a family emergency and can't take this session." className="min-h-[68px] w-full rounded-md border border-[#e7e1da] bg-white p-3 text-xs font-normal outline-none placeholder:text-[#777] focus:ring-2 focus:ring-green-700/20" />
        </label>
        <p className="mt-1 text-[11px] text-[#53635a]">Minimum 10 characters.</p>
        <div className="mt-3 rounded-md bg-[#f1f8ee] px-3 py-3 text-xs leading-[18px] text-[#27352c]">The student gets the credit back and can book again straight away. Both are told, with your note. The slot reopens, so other students can book it.</div>
        {(validationError || error) && <p role="alert" className="mt-2 text-xs text-red-600">{validationError || error}</p>}
        <div className="mt-3 flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)} className="h-9 border-[#e7e1da] bg-white px-3 text-xs">Keep session</Button>
          <Button type="button" disabled={submitting} onClick={() => void submit()} className="h-9 bg-[#ee8f89] px-3 text-xs text-white hover:bg-[#e77e77]">{submitting ? 'Cancelling…' : 'Cancel session'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
