"use client"
import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Info,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useMyMentorSlots, type MentorCreatedSlot } from "@/app/[admin]/hooks/useMyMentorSlots"
import { useCreateMentorSlot } from "@/app/[admin]/hooks/useCreateMentorSlot"
import { useDeleteMentorSlot, type DeleteMentorSlotResult } from "@/app/[admin]/hooks/useDeleteMentorSlot"
import { useSlotLicenceCheck } from "@/app/[admin]/hooks/useSlotLicenceCheck"
import { CalendarSkeleton } from "@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ─── Constants ────────────────────────────────────────────────────────────────
const durationOptions = [30, 45, 60, 90]
const defaultStartTime = "09:00"
const defaultDurationMinutes = "60"

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toDateStr = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const getLocalDateString = () => toDateStr(new Date())
const getDefaultSlotDate = () => getLocalDateString()

const addDays = (date: Date, days: number) => {
  const r = new Date(date)
  r.setDate(r.getDate() + days)
  return r
}

const getMonday = (ref: Date) => {
  const d = new Date(ref)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d
}

const formatTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

// e.g. "Sat, 7 Nov 2026"
const formatFullDate = (value: string | Date) => {
  const d = new Date(value)
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" })
  const rest = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  return `${weekday}, ${rest}`
}

// e.g. "Fri, 6 Nov at 11:00 AM"
const formatDayAtTime = (value: string | Date) => {
  const d = new Date(value)
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" })
  const dayMonth = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  return `${weekday}, ${dayMonth} at ${formatTime(d)}`
}

const formatDuration = (durationMinutes: number) => {
  if (durationMinutes % 60 === 0) return `${durationMinutes / 60} hr`
  return `${durationMinutes} min`
}

const formatHoursLabel = (hours: number) =>
  `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`

const combineDateAndTime = (date: string, time: string): Date | null => {
  if (!date || !time) return null
  const [hours, minutes] = time.split(":").map(Number)
  const parsed = new Date(date)
  if (isNaN(parsed.getTime()) || isNaN(hours) || isNaN(minutes)) return null
  parsed.setHours(hours, minutes, 0, 0)
  return parsed
}

const normalizeStatus = (s: string) => s.toLowerCase()
const isOpenSlot = (slot: MentorCreatedSlot) => {
  const s = normalizeStatus(slot.status)
  return s === "available" || s === "open"
}
const isBookedSlot = (slot: MentorCreatedSlot) =>
  slot.currentBookedCount > 0 || normalizeStatus(slot.status) === "booked"
const isPastSlot = (slot: MentorCreatedSlot, now = Date.now()) =>
  new Date(slot.slotEndDateTime).getTime() <= now
// Students can't book within rules.noticeHours of the start (both from the backend)
const isTooSoonToBook = (slot: MentorCreatedSlot, now: number, noticeHours?: number) => {
  const bookableUntil = slot.bookableUntil ? new Date(slot.bookableUntil).getTime() : NaN
  if (Number.isFinite(bookableUntil)) return now >= bookableUntil
  if (typeof noticeHours !== "number") return false
  return new Date(slot.slotStartDateTime).getTime() - now < noticeHours * 60 * 60 * 1000
}
// The backend says whether a slot can be removed (open slots: any time; booked/held/past: no)
const canDeleteSlot = (slot: MentorCreatedSlot, now = Date.now()) => {
  if (typeof slot.canRemove === "boolean") return slot.canRemove
  return !isBookedSlot(slot) && !isPastSlot(slot, now)
}
const getSlotDateKey = (slot: MentorCreatedSlot) => toDateStr(new Date(slot.slotStartDateTime))

// Booked student's short name from the API (students[].shortName, e.g. "Karan P.")
const getBookedStudentLabel = (slot: MentorCreatedSlot) => {
  const shortNames = (slot.students ?? [])
    .map((student) => student.shortName?.trim())
    .filter(Boolean)
  if (shortNames.length) return shortNames.join(", ")
  const name = ((slot as MentorCreatedSlot & { studentName?: string | null }).studentName || "").trim()
  if (!name) return null
  const [first, ...rest] = name.split(/\s+/)
  const last = rest[rest.length - 1]
  return last ? `${first} ${last[0].toUpperCase()}.` : first
}

type SlotState = "open" | "tooSoon" | "booked" | "held" | "past"

const getSlotState = (slot: MentorCreatedSlot, now: number, noticeHours?: number): SlotState => {
  // `state` from GET /instructor/mentor-slots/my
  switch (slot.state) {
    case "open":
      return "open"
    case "tooSoonToBook":
      return "tooSoon"
    case "booked":
      return "booked"
    case "held":
      return "held"
    case "past":
      return "past"
  }
  if (isPastSlot(slot, now)) return "past"
  if (isBookedSlot(slot)) return "booked"
  if (isTooSoonToBook(slot, now, noticeHours)) return "tooSoon"
  return "open"
}

// `chip` styles both the calendar cards and the legend swatches, so they always match
const SLOT_STATE_STYLES: Record<SlotState, { chip: string; selected: string; legend: string }> = {
  open: {
    chip: "border-green-700 bg-green-50 dark:border-green-500/70 dark:bg-green-950/30",
    selected: "border-2 border-green-800 dark:border-green-400",
    legend: "Open",
  },
  tooSoon: {
    chip: "border-amber-500 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-950/30",
    selected: "border-2 border-amber-600 dark:border-amber-400",
    legend: "Open, too soon to book",
  },
  booked: {
    chip: "border-blue-500 bg-blue-50 dark:border-blue-500/70 dark:bg-blue-950/30",
    selected: "border-2 border-blue-700 dark:border-blue-400",
    legend: "Booked",
  },
  // Held for a student's reschedule request: shown like a booked slot
  held: {
    chip: "border-blue-500 bg-blue-50 dark:border-blue-500/70 dark:bg-blue-950/30",
    selected: "border-2 border-blue-700 dark:border-blue-400",
    legend: "Held for a reschedule",
  },
  past: {
    chip: "border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800/60",
    selected: "border-2 border-gray-500 dark:border-gray-400",
    legend: "Past",
  },
}

const getSlotChipLabel = (slot: MentorCreatedSlot, state: SlotState) => {
  if (state === "past") return "Past"
  if (state === "booked") return getBookedStudentLabel(slot) || "Booked"
  if (state === "held") return "Held"
  if (state === "tooSoon") return "Too soon"
  return "Open"
}

// ─── Slot chip (calendar) ─────────────────────────────────────────────────────
function SlotChip({
  slot,
  state,
  selected,
  onClick,
}: {
  slot: MentorCreatedSlot
  state: SlotState
  selected: boolean
  onClick: () => void
}) {
  const styles = SLOT_STATE_STYLES[state]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-md border px-2.5 py-2 text-left text-foreground transition-shadow hover:shadow-sm",
        styles.chip,
        selected && styles.selected
      )}
    >
      <p className="truncate text-xs font-medium">{formatTime(slot.slotStartDateTime)}</p>
      <p className="mt-0.5 truncate text-xs text-foreground/80">{getSlotChipLabel(slot, state)}</p>
    </button>
  )
}

// ─── Slot Detail Panel ────────────────────────────────────────────────────────
function SlotDetailPanel({
  slot,
  now,
  noticeHours,
  onClose,
  onDelete,
  isDeleting,
  deletingSlotId,
  deleteError,
}: {
  slot: MentorCreatedSlot
  now: number
  noticeHours?: number
  onClose: () => void
  onDelete: (id: number) => Promise<DeleteMentorSlotResult>
  isDeleting: boolean
  deletingSlotId: number | null
  deleteError: string | null
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const state = getSlotState(slot, now, noticeHours)
  const deletable = canDeleteSlot(slot, now)
  const deleting = isDeleting && deletingSlotId === slot.id
  // The panel's line comes from the backend (slot.message)
  const slotMessage = slot.message?.trim() || ""

  useEffect(() => {
    setConfirmDelete(false)
  }, [slot.id])

  useEffect(() => {
    if (!confirmDelete) return
    const t = setTimeout(() => setConfirmDelete(false), 4000)
    return () => clearTimeout(t)
  }, [confirmDelete])

  const handleDelete = async () => {
    const result = await onDelete(slot.id)
    if (result.success) onClose()
  }

  const infoClassName: Record<SlotState, string> = {
    open: "bg-green-50 dark:bg-green-950/30",
    tooSoon: "bg-amber-50 dark:bg-amber-950/30",
    booked: "bg-blue-50 dark:bg-blue-950/30",
    held: "bg-blue-50 dark:bg-blue-950/30",
    past: "bg-muted",
  }

  return (
    <Card className="rounded-xl border border-border bg-card shadow-none">
      <CardContent className="space-y-4 p-6 text-left">
        <p className="text-sm font-semibold text-foreground">Slot Details</p>

        <div>
          <p className="text-base font-semibold text-foreground">{formatFullDate(slot.slotStartDateTime)}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatTime(slot.slotStartDateTime)} - {formatTime(slot.slotEndDateTime)} · {slot.durationMinutes} min
          </p>
        </div>

        {slotMessage && (
          <div className={cn("rounded-lg px-4 py-3 text-sm leading-relaxed text-foreground", infoClassName[state])}>
            {slotMessage}
          </div>
        )}

        {deleteError && <p className="text-xs font-medium text-destructive">{deleteError}</p>}

        {deletable &&
          (confirmDelete ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-destructive">Remove this slot? This cannot be undone.</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  {deleting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  {deleting ? "Removing..." : "Confirm remove"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                  Keep slot
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(true)}
              className="text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Remove slot
            </Button>
          ))}
      </CardContent>
    </Card>
  )
}

// ─── Add Slot Form Panel ───────────────────────────────────────────────────────
function AddSlotPanel({
  slotDate,
  setSlotDate,
  startTime,
  setStartTime,
  durationMinutes,
  setDurationMinutes,
  overlappingSlot,
  formError,
  createError,
  isCreating,
  minDate,
  checkMessages,
  checking,
  blockedByCheck,
  nextFreeAt,
  onUseNextFreeTime,
  onCancel,
  onConfirm,
}: {
  slotDate: string
  setSlotDate: (v: string) => void
  startTime: string
  setStartTime: (v: string) => void
  durationMinutes: string
  setDurationMinutes: (v: string) => void
  overlappingSlot: MentorCreatedSlot | null
  formError: string | null
  createError: string | null
  isCreating: boolean
  minDate?: string
  checkMessages: string[]
  checking: boolean
  blockedByCheck: boolean
  /** licence-check `nextAvailableAt`: when a Zoom licence is free again */
  nextFreeAt: Date | null
  onUseNextFreeTime: () => void
  onCancel: () => void
  onConfirm: () => void
}) {
  const startTimeInputRef = useRef<HTMLInputElement | null>(null)

  const dateLabel = slotDate
    ? new Date(slotDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : ""

  return (
    <div className="space-y-4">
      {/* Date */}
      <div className="text-left">
        <label className="text-xs font-medium text-muted-foreground">Date</label>
        <div className="mt-1 relative">
          <Input
            type="date"
            value={slotDate}
            min={minDate}
            onChange={(e) => setSlotDate(e.target.value)}
            className="w-full text-sm font-medium [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
        {dateLabel && <p className="mt-1 text-xs text-muted-foreground">{dateLabel}</p>}
      </div>

      {/* Start Time + Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-left">
          <label className="text-xs font-medium text-muted-foreground">Start time</label>
          <div
            className="mt-1"
            onClick={() => {
              startTimeInputRef.current?.focus()
              startTimeInputRef.current?.showPicker?.()
            }}
          >
            <Input
              ref={startTimeInputRef}
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="text-sm font-medium [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>
        <div className="text-left">
          <label className="text-xs font-medium text-muted-foreground">Duration</label>
          <Select value={durationMinutes} onValueChange={setDurationMinutes}>
            <SelectTrigger className="mt-1 text-sm font-medium">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {formatDuration(opt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conflict */}
      {overlappingSlot && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-3 space-y-1 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-left text-xs font-semibold text-red-500 dark:text-red-400">CONFLICT DETECTED</p>
          <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <Clock size={12} />
            {formatTime(overlappingSlot.slotStartDateTime)} - {formatTime(overlappingSlot.slotEndDateTime)}
          </div>
        </div>
      )}
      {/* GET /instructor/mentor-slots/licence-check: lead time ("Slots need to start at least 4 days from now ...") and licence messages */}
      {checkMessages.map((text) => (
        <div
          key={text}
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-left text-xs leading-relaxed text-foreground dark:border-amber-900/60 dark:bg-amber-950/30"
        >
          {text}
        </div>
      ))}
      {/* No Zoom licence free at this time: one click moves the form to the next free time */}
      {nextFreeAt && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onUseNextFreeTime}
          className="w-full gap-1.5"
        >
          <Clock className="h-3.5 w-3.5" />
          Use {formatDayAtTime(nextFreeAt)}
        </Button>
      )}
      {formError && <p className="text-left text-xs text-destructive">{formError}</p>}
      {createError && <p className="text-left text-xs text-destructive">{createError}</p>}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel} disabled={isCreating}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-green-800 hover:bg-green-900 text-white"
          onClick={onConfirm}
          disabled={isCreating || checking || blockedByCheck}
        >
          {isCreating ? "Creating..." : checking ? "Checking..." : "Create slot"}
        </Button>
      </div>
    </div>
  )
}

// ─── This Week Stats Card ─────────────────────────────────────────────────────
function ThisWeekCard({ metrics }: { metrics: any }) {
  return (
    <Card className="rounded-lg border border-border bg-card shadow-sm">
      <CardContent className="space-y-3 p-4 text-left">
        <p className="text-xs font-bold">This Week</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Total", value: metrics?.totalSlots ?? "-" },
            { label: "Open", value: metrics?.available ?? "-" },
            { label: "Booked", value: metrics?.full ?? "-" },
            { label: "Hours", value: typeof metrics?.hours === "number" ? formatHoursLabel(metrics.hours) : "-" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-muted p-2 text-center">
              <p className="text-base font-bold tabular-nums">{value}</p>
              <p className="text-[9px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Empty Detail Panel ───────────────────────────────────────────────────────
function EmptyDetailPanel() {
  return (
    <Card className="rounded-lg border border-dashed border-border bg-card shadow-sm">
      <CardContent className="space-y-3 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold">No slot selected</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Click any slot on the calendar to view its details
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AvailabilityPage() {
  const router = useRouter()
  const pathname = usePathname()

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showAddSlotPanel, setShowAddSlotPanel] = useState(false)

  // Create-slot form state
  const [slotDate, setSlotDate] = useState<string>(getDefaultSlotDate())
  const [startTime, setStartTime] = useState<string>(defaultStartTime)
  const [durationMinutes, setDurationMinutes] = useState<string>(defaultDurationMinutes)
  const [formError, setFormError] = useState<string | null>(null)

  const today = getLocalDateString()
  const nowMs = currentTime.getTime()
  const baseWeekStart = useMemo(() => getMonday(new Date()), [])

  const {
    slots,
    metrics,
    weekStart: apiWeekStart,
    weekEnd: apiWeekEnd,
    summary,
    rules,
    earliestNewSlotStart,
    loading,
    error,
    refetchMySlots,
    upsertMySlot,
  } = useMyMentorSlots(true, { weekOffset })

  const { isCreating, error: createError, createSlot } = useCreateMentorSlot()
  const { isDeleting, deletingSlotId, error: deleteError, deleteSlot, clearError: clearDeleteError } = useDeleteMentorSlot()
  // From the backend (GET /instructor/mentor-slots/my -> rules.noticeHours)
  const noticeHours = rules?.noticeHours

  // Week computation
  const weekStart = useMemo(
    () => (apiWeekStart ? new Date(apiWeekStart) : addDays(baseWeekStart, weekOffset * 7)),
    [apiWeekStart, baseWeekStart, weekOffset]
  )
  const weekEnd = useMemo(
    () => (apiWeekEnd ? new Date(apiWeekEnd) : addDays(weekStart, 6)),
    [apiWeekEnd, weekStart]
  )
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )
  const isCurrentWeek = weekOffset === 0

  // weekStart/weekEnd are Mon 00:00 – Sun 23:59 IST sent as UTC, so format them in IST
  const weekLabel = `${weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  })} – ${weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })}`

  // New slots need slot_min_lead_days of notice: the picker starts on the earliest allowed day
  const earliestSlotDate = useMemo(() => {
    if (!earliestNewSlotStart) return today
    const earliest = new Date(earliestNewSlotStart)
    if (Number.isNaN(earliest.getTime())) return today
    const earliestStr = toDateStr(earliest)
    return earliestStr > today ? earliestStr : today
  }, [earliestNewSlotStart, today])
  const clampSlotDate = useCallback(
    (dateStr: string) => (dateStr < earliestSlotDate ? earliestSlotDate : dateStr),
    [earliestSlotDate]
  )

  // Move a too-early date forward once the earliest day is known
  useEffect(() => {
    setSlotDate((current) => clampSlotDate(current))
  }, [clampSlotDate])

  const sortedSlots = useMemo(
    () => [...slots].sort((a, b) => new Date(a.slotStartDateTime).getTime() - new Date(b.slotStartDateTime).getTime()),
    [slots]
  )

  const slotsByDate = useMemo(() => {
    const map: Record<string, MentorCreatedSlot[]> = {}
    for (const slot of sortedSlots) {
      const key = getSlotDateKey(slot)
      if (!map[key]) map[key] = []
      map[key].push(slot)
    }
    return map
  }, [sortedSlots])

  const selectedSlot = useMemo(() => slots.find((s) => s.id === selectedSlotId) || null, [slots, selectedSlotId])

  // Header counts: `summary` from the API ("5 slots this week · 2 open · 2 booked")
  const fallbackOpenCount = useMemo(() => sortedSlots.filter((s) => isOpenSlot(s)).length, [sortedSlots])
  const fallbackBookedCount = useMemo(() => sortedSlots.filter((s) => isBookedSlot(s)).length, [sortedSlots])
  const totalSlotsCount = summary?.slots ?? metrics?.totalSlots ?? sortedSlots.length
  const openSlotsCount = summary?.open ?? fallbackOpenCount
  const bookedSlotsCount = summary?.booked ?? fallbackBookedCount

  // Proposed slot for overlap detection
  const proposedStart = useMemo(() => combineDateAndTime(slotDate, startTime), [slotDate, startTime])
  const proposedEnd = useMemo(() => {
    if (!proposedStart) return null
    const dur = Number(durationMinutes)
    if (!isFinite(dur) || dur <= 0) return null
    return new Date(proposedStart.getTime() + dur * 60 * 1000)
  }, [durationMinutes, proposedStart])

  const overlappingSlot = useMemo(() => {
    if (!proposedStart || !proposedEnd) return null
    return sortedSlots.find((s) => {
      const es = new Date(s.slotStartDateTime)
      const ee = new Date(s.slotEndDateTime)
      return proposedStart < ee && proposedEnd > es
    }) || null
  }, [proposedStart, proposedEnd, sortedSlots])

  const { check: slotCheck, loading: checkingSlot } = useSlotLicenceCheck(
    showAddSlotPanel && proposedStart && proposedEnd ? proposedStart.toISOString() : null,
    showAddSlotPanel && proposedStart && proposedEnd ? proposedEnd.toISOString() : null
  )
  const slotCheckMessages = useMemo(() => {
    if (!slotCheck) return []
    const messages: string[] = []
    if (slotCheck.leadTime && !slotCheck.leadTime.ok && slotCheck.leadTime.message) messages.push(slotCheck.leadTime.message)
    if (!slotCheck.available && slotCheck.message) messages.push(slotCheck.message)
    return messages
  }, [slotCheck])
  const blockedBySlotCheck = slotCheck
    ? slotCheck.canCreate === false || (slotCheck.canCreate === undefined && !slotCheck.available)
    : false

  // licence-check `nextAvailableAt`: shown only when the Zoom licence pool is full at the picked time
  const nextFreeAt = useMemo(() => {
    if (!slotCheck || slotCheck.available || !slotCheck.nextAvailableAt) return null
    const date = new Date(slotCheck.nextAvailableAt)
    return Number.isNaN(date.getTime()) ? null : date
  }, [slotCheck])

  const applyNextFreeTime = () => {
    if (!nextFreeAt) return
    setSlotDate(toDateStr(nextFreeAt))
    setStartTime(
      `${String(nextFreeAt.getHours()).padStart(2, "0")}:${String(nextFreeAt.getMinutes()).padStart(2, "0")}`
    )
    setFormError(null)
  }

  // Effects
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setSelectedSlotId(null)
  }, [weekDays])

  useEffect(() => {
    if (selectedSlotId !== null && !selectedSlot) setSelectedSlotId(null)
  }, [selectedSlot, selectedSlotId])

  // Handlers
  const handleCreateSlot = async () => {
    setFormError(null)
    if (!proposedStart || !proposedEnd) { setFormError("Please select valid date, time, and duration."); return }
    if (proposedStart <= new Date()) { setFormError("Start must not be in the past."); return }
    if (proposedEnd <= proposedStart) { setFormError("End must be after start."); return }
    if (overlappingSlot) { setFormError("This slot overlaps with an existing slot."); return }

    const result = await createSlot({
      slotStartDateTime: proposedStart.toISOString(),
      slotEndDateTime: proposedEnd.toISOString(),
      durationMinutes: Number(durationMinutes),
    })

    if (result.success) {
      const created = result.slot
      if (created) {
        upsertMySlot({
          id: created.id,
          slotStartDateTime: created.slotStartDateTime,
          slotEndDateTime: created.slotEndDateTime,
          durationMinutes: created.durationMinutes,
          maxCapacity: created.maxCapacity,
          currentBookedCount: created.currentBookedCount,
          status: created.status,
        })
      }
      toast.success({ title: "Success", description: "Slot created successfully." })
      setSlotDate(clampSlotDate(getDefaultSlotDate()))
      setStartTime(defaultStartTime)
      setDurationMinutes(defaultDurationMinutes)
      setShowAddSlotPanel(false)
      void refetchMySlots()
    } else {
      if (result.statusCode === 403) {
        toast.error({ title: "Profile incomplete", description: result.errorMessage || "Complete your mentor profile before creating slots." })
        const roleFromPath = pathname.split("/").filter(Boolean)[0]
        const authRaw = localStorage.getItem("AUTH")
        let authUser: { orgId?: string | number } | null = null
        if (authRaw) { try { authUser = JSON.parse(authRaw) } catch { authUser = null } }
        const organizationId = authUser?.orgId
        if (roleFromPath && organizationId) router.push(`/${roleFromPath}/organizations/${organizationId}/profile`)
        else router.push("/profile")
        return
      }
      toast.error({ title: "Failed", description: result.errorMessage || createError || "Failed to create slot." })
    }
  }

  const handleDeleteSlot = async (slotId: number) => {
    const result = await deleteSlot(slotId)
    if (result.success) {
      toast.success({ title: "Success", description: result.message })
      await refetchMySlots()
      setSelectedSlotId(null)
    } else {
      // e.g. 400 SLOT_BOOKED "Booked slots can't be removed. Cancel the booking first."
      toast.error({ title: "Failed", description: result.message })
      void refetchMySlots()
    }
    return result
  }

  const openCreateSlot = (date?: Date) => {
    // Open on the clicked day, or the earliest day a new slot is allowed (earliestNewSlotStart)
    setSlotDate(clampSlotDate(date ? toDateStr(date) : getDefaultSlotDate()))
    setFormError(null)
    setSelectedSlotId(null)
    setShowAddSlotPanel(true)
  }

  const isInitialLoading = loading && slots.length === 0

  return isInitialLoading ? (
    <CalendarSkeleton />
  ) : (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Availability</h1>
            <span
              title={`${
                typeof noticeHours === "number"
                  ? `Students can book open slots until ${noticeHours} hours before they start. `
                  : ""
              }Click an empty part of a day to add a slot.`}
              className="text-green-800 dark:text-green-400"
            >
              <Info className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalSlotsCount} slots this week · {openSlotsCount} open · {bookedSlotsCount} booked · today is {formatDayAtTime(currentTime)}
          </p>
        </div>

        <Button
          className="gap-1.5 bg-green-800 hover:bg-green-900 text-white"
          onClick={() => openCreateSlot()}
        >
          <Plus className="h-4 w-4" />
          Create Slot
        </Button>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setWeekOffset((o) => o - 1)} aria-label="Previous week">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setWeekOffset((o) => o + 1)} aria-label="Next week">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="ml-1 text-sm font-semibold">{weekLabel}</span>
        {!isCurrentWeek && (
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>This week</Button>
        )}
      </div>

      {!loading && error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Week calendar */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {loading ? (
            <div className="h-[460px] animate-pulse bg-muted/40" />
          ) : (
            <div className="overflow-x-auto">
              {/* Phones: the week scrolls sideways instead of squeezing each day */}
              <div className="grid min-w-[640px] grid-cols-7">
                {weekDays.map((day, idx) => {
                  const dateKey = toDateStr(day)
                  const daySlots = slotsByDate[dateKey] ?? []
                  const isToday = dateKey === today

                  return (
                    <div
                      key={dateKey}
                      className={cn(
                        "flex min-h-[420px] min-w-0 flex-col px-2 pt-3 pb-3",
                        idx > 0 && "border-l border-border",
                        isToday && "bg-muted/50"
                      )}
                    >
                      <p className="border-b border-border pb-2 text-left text-xs font-semibold text-foreground">
                        {day.toLocaleDateString("en-US", { weekday: "short" })} {day.getDate()}
                      </p>

                      <div className="mt-2 space-y-2">
                        {daySlots.map((slot) => (
                          <SlotChip
                            key={slot.id}
                            slot={slot}
                            state={getSlotState(slot, nowMs, noticeHours)}
                            selected={selectedSlotId === slot.id}
                            onClick={() => {
                              clearDeleteError()
                              setSelectedSlotId((id) => (id === slot.id ? null : slot.id))
                            }}
                          />
                        ))}
                      </div>

                      {/* Empty space below the slots: click to create a slot on this day */}
                      <button
                        type="button"
                        onClick={() => openCreateSlot(day)}
                        aria-label={`Create a slot on ${formatFullDate(day)}`}
                        className="mt-2 min-h-[48px] flex-1 cursor-pointer rounded-md transition-colors hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3 text-xs text-muted-foreground">
            {(Object.keys(SLOT_STATE_STYLES) as SlotState[]).filter((state) => state !== "held").map((state) => (
              <div key={state} className="flex items-center gap-2">
                <span className={cn("h-3.5 w-3.5 shrink-0 rounded-[3px] border", SLOT_STATE_STYLES[state].chip)} />
                {SLOT_STATE_STYLES[state].legend}
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {selectedSlot ? (
            <SlotDetailPanel
              slot={selectedSlot}
              now={nowMs}
              noticeHours={noticeHours}
              onClose={() => setSelectedSlotId(null)}
              onDelete={handleDeleteSlot}
              isDeleting={isDeleting}
              deletingSlotId={deletingSlotId}
              deleteError={deleteError}
            />
          ) : (
            <>
              <EmptyDetailPanel />
              <ThisWeekCard metrics={metrics} />
            </>
          )}
        </div>
      </div>

      {/* Create slot dialog */}
      <Dialog open={showAddSlotPanel} onOpenChange={setShowAddSlotPanel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-left">Create Slot</DialogTitle>
          </DialogHeader>
          <AddSlotPanel
            slotDate={slotDate}
            setSlotDate={setSlotDate}
            startTime={startTime}
            setStartTime={setStartTime}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            overlappingSlot={overlappingSlot}
            formError={formError}
            createError={createError}
            isCreating={isCreating}
            // Days before earliestNewSlotStart (minSlotLeadDays) can't be picked; the licence check
            // still reports a too-early time on that first day
            minDate={earliestSlotDate}
            checkMessages={slotCheckMessages}
            checking={checkingSlot}
            blockedByCheck={blockedBySlotCheck}
            nextFreeAt={nextFreeAt}
            onUseNextFreeTime={applyNextFreeTime}
            onCancel={() => setShowAddSlotPanel(false)}
            onConfirm={handleCreateSlot}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
