"use client"
import { useMemo, useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  AlertTriangle,
  Lock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  CalendarDays,
  CalendarX,
  Loader2,
  Grid3X3,
  List,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useMyMentorSlots, type MentorCreatedSlot } from "@/hooks/useMyMentorSlots"
import { useCreateMentorSlot } from "@/hooks/useCreateMentorSlot"
import { useDeleteMentorSlot } from "@/hooks/useDeleteMentorSlot"
import {
  AvailabilitySkeleton,
  CalendarSkeleton,
} from "@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton"
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

const START_HOUR = 7
const END_HOUR = 22
const HOURS_COUNT = END_HOUR - START_HOUR
const HOUR_HEIGHT = 56
const TOTAL_HEIGHT = HOURS_COUNT * HOUR_HEIGHT
const HOUR_TICKS = Array.from({ length: HOURS_COUNT + 1 }, (_, i) => START_HOUR + i)
const minimumDeleteLeadTimeMs = 12 * 60 * 60 * 1000

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getLocalDateString = () => {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, "0")
  const d = String(today.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const getDefaultSlotDate = () => getLocalDateString()

const toDateStr = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

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

const hourLabel = (h: number) => {
  if (h === 0 || h === 24) return "12am"
  if (h === 12) return "12pm"
  return h > 12 ? `${h - 12}pm` : `${h}am`
}

const formatLocalDate = (dateTime: string) =>
  new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

const formatShortDate = (dateTime: string) =>
  new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

const formatLongDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

const formatLocalTimeRange = (start: string, end: string) =>
  `${formatTime(start)} — ${formatTime(end)}`

const formatDuration = (durationMinutes: number) => {
  if (durationMinutes % 60 === 0) return `${durationMinutes / 60} hr`
  return `${durationMinutes} min`
}

const formatHoursLabel = (hours: number) =>
  `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`

const getStatusLabel = (slot: MentorCreatedSlot) => {
  const s = slot.status.toLowerCase()
  if (slot.currentBookedCount > 0 || s === "booked") return "Booked"
  if (s === "available" || s === "open") return "Open"
  return slot.status
}

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
const isPastSlot = (slot: MentorCreatedSlot) => new Date(slot.slotEndDateTime) <= new Date()
const canDeleteSlot = (slot: MentorCreatedSlot) => {
  if (isBookedSlot(slot) || isPastSlot(slot)) return false
  return new Date(slot.slotStartDateTime).getTime() - Date.now() >= minimumDeleteLeadTimeMs
}
const getDeleteBlockReason = (slot: MentorCreatedSlot) => {
  if (isBookedSlot(slot)) return "Booked slots cannot be removed."
  if (isPastSlot(slot)) return "Past slots can no longer be removed."
  if (!canDeleteSlot(slot)) return null
  return null
}
const getSlotDateKey = (slot: MentorCreatedSlot) => toDateStr(new Date(slot.slotStartDateTime))
const slotTop = (slot: MentorCreatedSlot) => {
  const s = new Date(slot.slotStartDateTime)
  return ((s.getHours() * 60 + s.getMinutes() - START_HOUR * 60) / 60) * HOUR_HEIGHT
}
const slotHeight = (slot: MentorCreatedSlot) =>
  Math.max((slot.durationMinutes / 60) * HOUR_HEIGHT, 22)

// ─── Calendar sub-components ──────────────────────────────────────────────────
function DayHeader({ day, today }: { day: Date; today: string }) {
  const dateString = toDateStr(day)
  const isToday = dateString === today
  return (
    <div className={cn("select-none py-2.5 text-center", isToday && "relative")}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {day.toLocaleDateString("en-US", { weekday: "short" })}
      </p>
      <div
        className={cn(
          "mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
          isToday ? "bg-primary text-primary-foreground" : "text-foreground"
        )}
      >
        {day.getDate()}
      </div>
    </div>
  )
}

function SlotBlock({
  slot,
  selected,
  onClick,
}: {
  slot: MentorCreatedSlot
  selected: boolean
  onClick: () => void
}) {
  const past = isPastSlot(slot)
  const booked = isBookedSlot(slot)
  const top = slotTop(slot)
  const height = slotHeight(slot)
  const tall = height >= 40

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={past}
      title={`${formatTime(slot.slotStartDateTime)} — ${formatTime(slot.slotEndDateTime)} · ${getStatusLabel(slot)}`}
      className={cn(
        "absolute left-0.5 right-0.5 overflow-hidden rounded-md border px-1.5 py-1 text-left transition-all duration-150",
        booked
          ? past
            ? "cursor-default border-blue-200/40 bg-blue-50/30 text-blue-400/50"
            : "border-blue-300/50 bg-blue-50 text-blue-700 hover:brightness-95"
          : past
            ? "cursor-default border-green-200/40 bg-green-50/25 text-green-700/40"
            : "border-green-300/50 bg-green-50 text-green-800 hover:brightness-95",
        selected && !past && "z-10 ring-2 ring-primary ring-offset-1"
      )}
      style={{ top: `${top}px`, height: `${height}px` }}
    >
      <p className="truncate text-[10px] font-bold leading-none">{formatTime(slot.slotStartDateTime)}</p>
      {tall && (
        <p className="mt-0.5 truncate text-[9px] leading-none opacity-80">
          {booked ? "Booked" : "Open"}
        </p>
      )}
    </button>
  )
}

// ─── Slot Detail Panel ────────────────────────────────────────────────────────
function SlotDetailPanel({
  slot,
  onClose,
  onDelete,
  isDeleting,
  deletingSlotId,
  deleteError,
}: {
  slot: MentorCreatedSlot
  onClose: () => void
  onDelete: (id: number) => Promise<boolean>
  isDeleting: boolean
  deletingSlotId: number | null
  deleteError: string | null
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const past = isPastSlot(slot)
  const booked = isBookedSlot(slot)
  const deleteBlockedReason = getDeleteBlockReason(slot)
  const deleting = isDeleting && deletingSlotId === slot.id

  useEffect(() => {
    if (!confirmDelete) return
    const t = setTimeout(() => setConfirmDelete(false), 4000)
    return () => clearTimeout(t)
  }, [confirmDelete])

  const handleDelete = async () => {
    const removed = await onDelete(slot.id)
    if (removed) onClose()
  }

  return (
    <Card className="rounded-lg border border-border bg-card shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-left">Slot Details</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {past ? "This slot has passed" : "Active availability slot"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="text-left">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              past ? "bg-muted text-muted-foreground" : booked ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-800"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", past ? "bg-muted-foreground" : booked ? "bg-blue-500" : "bg-green-500")} />
            {past ? "Past" : booked ? "Booked" : "Open"}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium text-muted-foreground text-left">Date</p>
              <p className="mt-0.5 text-sm font-semibold">{formatLongDate(slot.slotStartDateTime)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium text-muted-foreground text-left">Time</p>
              <p className="mt-0.5 text-sm font-semibold">
                {formatTime(slot.slotStartDateTime)} — {formatTime(slot.slotEndDateTime)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatDuration(slot.durationMinutes)}</p>
            </div>
          </div>
        </div>

        {slot.currentBookedCount > 0 && (
          <div className="rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
            {slot.currentBookedCount} learner{slot.currentBookedCount !== 1 ? "s" : ""} booked this slot.
          </div>
        )}
        {booked && !past && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>This slot is reserved by a learner and cannot be deleted.</p>
          </div>
        )}
        {past && (
          <div className="rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
            This slot is in the past and is no longer active.
          </div>
        )}
        {!booked && !past && deleteBlockedReason && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 px-3 py-2.5 text-xs text-yellow-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>{deleteBlockedReason}</p>
          </div>
        )}
        {deleteError && <p className="text-xs font-medium text-destructive">{deleteError}</p>}

        {!booked && !past && (
          <div>
            {deleteBlockedReason ? (
              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-destructive/20 px-3 py-2 text-xs font-semibold text-destructive opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Slot
              </button>
            ) : confirmDelete ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-destructive">Delete this slot? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground transition-colors hover:opacity-90 disabled:opacity-60"
                  >
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    {deleting ? "Deleting..." : "Confirm Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Slot
              </button>
            )}
          </div>
        )}
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
  onCancel: () => void
  onConfirm: () => void
}) {
  const startTimeInputRef = useRef<HTMLInputElement | null>(null)

  // Display a nice date label for the date input
  const dateLabel = slotDate
    ? new Date(slotDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : ""

  return (
    <Card className="rounded-lg border border-border bg-card shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 text-left">New Slot</p>
        </div>

        {/* Date */}
        <div className="text-left">
          <label className="text-xs font-medium text-muted-foreground">Date</label>
          <div className="mt-1 relative">
            <Input
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="w-full text-sm font-medium"
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
                className="text-sm font-medium"
              />
            </div>
          </div>
          <div className="text-left mt-1">
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
          <div className="border border-red-200 bg-red-50 rounded-lg p-3 space-y-1">
            <p className="text-left text-xs font-semibold text-red-500">CONFLICT DETECTED</p>
            <div className="flex items-center gap-2 text-xs text-red-600">
              <Clock size={12} />
              {formatLocalTimeRange(overlappingSlot.slotStartDateTime, overlappingSlot.slotEndDateTime)}
            </div>
          </div>
        )}
        {formError && <p className="text-xs text-destructive">{formError}</p>}
        {createError && <p className="text-xs text-destructive">{createError}</p>}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" onClick={onCancel} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-green-800 hover:bg-green-900 text-white"
            onClick={onConfirm}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "+ Confirm & create"}
          </Button>
        </div>
      </CardContent>
    </Card>
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

// ─── Upcoming Slot Card ───────────────────────────────────────────────────────
function UpcomingSlotCard({ slots }: { slots: MentorCreatedSlot[] }) {
  const upcoming = slots
    .filter((s) => !isPastSlot(s) && !isBookedSlot(s))
    .sort((a, b) => new Date(a.slotStartDateTime).getTime() - new Date(b.slotStartDateTime).getTime())[0]

  if (!upcoming) return null

  return (
    <Card className="rounded-lg border border-border bg-card shadow-sm">
      <CardContent className="p-4 text-left">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Next upcoming slot
        </p>
        <p className="text-sm font-bold">{formatTime(upcoming.slotStartDateTime)} · {formatDuration(upcoming.durationMinutes)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatLongDate(upcoming.slotStartDateTime).split(",").slice(0, 2).join(",")}</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-green-300 px-2.5 py-0.5 text-xs font-semibold text-green-700">
          Open
        </span>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Click any slot to see details, or click an empty cell to add a new slot.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Empty Detail Panel ───────────────────────────────────────────────────────
function EmptyDetailPanel({ onAddSlot }: { onAddSlot: () => void }) {
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

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Calendar state
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedMobileDay, setSelectedMobileDay] = useState(0)
  const [showAddSlotPanel, setShowAddSlotPanel] = useState(false)
  const [addSlotDate, setAddSlotDateState] = useState<string>(getDefaultSlotDate())

  // Form state (shared between grid sidebar + list create)
  const [slotDate, setSlotDate] = useState<string>(getDefaultSlotDate())
  const [startTime, setStartTime] = useState<string>(defaultStartTime)
  const [durationMinutes, setDurationMinutes] = useState<string>(defaultDurationMinutes)
  const [formError, setFormError] = useState<string | null>(null)

  const today = getLocalDateString()
  const baseWeekStart = useMemo(() => getMonday(new Date()), [])

  const {
    slots,
    metrics,
    weekStart: apiWeekStart,
    weekEnd: apiWeekEnd,
    loading,
    error,
    refetchMySlots,
    upsertMySlot,
  } = useMyMentorSlots(true, { weekOffset })

  const { isCreating, error: createError, createSlot } = useCreateMentorSlot()
  const { isDeleting, deletingSlotId, error: deleteError, message: deleteMessage, deleteSlot } = useDeleteMentorSlot()

  const scrollRef = useRef<HTMLDivElement>(null)

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

  // const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`

  const weekLabel = `${weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })} – ${weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })}`

  // Sorted slots
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

  const openSlotsCount = useMemo(() => sortedSlots.filter((s) => isOpenSlot(s)).length, [sortedSlots])
  const bookedSlotsCount = useMemo(() => sortedSlots.filter((s) => isBookedSlot(s)).length, [sortedSlots])

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

  const currentTimePx = useMemo(() => {
    const mins = currentTime.getHours() * 60 + currentTime.getMinutes()
    return ((mins - START_HOUR * 60) / 60) * HOUR_HEIGHT
  }, [currentTime])

  // Effects
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!loading && scrollRef.current) scrollRef.current.scrollTop = HOUR_HEIGHT
  }, [loading])

  useEffect(() => {
    const todayInWeek = weekDays.findIndex((d) => toDateStr(d) === today)
    setSelectedMobileDay(todayInWeek >= 0 ? todayInWeek : 0)
    setSelectedSlotId(null)
  }, [today, weekDays])

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
      setSlotDate(getDefaultSlotDate())
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
    const removed = await deleteSlot(slotId)
    if (removed) {
      toast.success({ title: "Success", description: deleteMessage || "Slot removed successfully." })
      await refetchMySlots()
      setSelectedSlotId(null)
    } else {
      toast.error({ title: "Failed", description: deleteError || "Failed to remove slot." })
    }
    return removed ?? false
  }


  const handleEmptyCellClick = (
    date: Date,
    hour?: number
  ) => {
    const dateStr = toDateStr(date)

    setSlotDate(dateStr)

    if (hour !== undefined) {
      setStartTime(
        `${String(hour).padStart(2, "0")}:00`
      )
    }

    setSelectedSlotId(null)
    setShowAddSlotPanel(true)
  }
  const handleAddSlotButton = () => {
    setSlotDate(getDefaultSlotDate())
    setSelectedSlotId(null)
    setShowAddSlotPanel(true)
  }

  const isInitialLoading = loading && slots.length === 0

  // ── Right sidebar content
  const renderRightSidebar = () => {
    if (showAddSlotPanel) {
      return (
        <Dialog
          open={showAddSlotPanel}
          onOpenChange={setShowAddSlotPanel}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Slot</DialogTitle>
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
              onCancel={() => setShowAddSlotPanel(false)}
              onConfirm={handleCreateSlot}
            />
          </DialogContent>
        </Dialog>

      )
    }

    if (selectedSlot) {
      return (
        <SlotDetailPanel
          slot={selectedSlot}
          onClose={() => setSelectedSlotId(null)}
          onDelete={handleDeleteSlot}
          isDeleting={isDeleting}
          deletingSlotId={deletingSlotId}
          deleteError={deleteError}
        />
      )
    }
    return (
      <>
        <UpcomingSlotCard slots={sortedSlots} />
        <EmptyDetailPanel onAddSlot={handleAddSlotButton} />
      </>
    )
  }

  return isInitialLoading ? (
    <CalendarSkeleton />
  ) : (
    // <div className="min-h-screen p-6 space-y-4">
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-lg font-semibold">Availability</h1>
          <p className="text-sm text-muted-foreground">
            {metrics?.totalSlots ?? sortedSlots.length} slots this week · {openSlotsCount} open · {bookedSlotsCount} booked
            {typeof metrics?.hours === "number" ? ` · ${formatHoursLabel(metrics.hours)}` : ""}
          </p>
        </div>

        {/* Top-right controls */}
        <div className="flex items-center gap-2">
          {/* Grid / List toggle */}
          <div className="flex items-center rounded-lg border border-border bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "grid" ? "bg-green-50 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "list" ? "bg-green-100 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
          </div>

          <Button
            size="sm"
            className="gap-1.5 bg-green-800 hover:bg-green-900 text-white"
            onClick={handleAddSlotButton}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Slot
          </Button>
        </div>
      </div>

      {!loading && error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {viewMode === "grid" && (
        <div className="max-w-7xl space-y-4">
          {/* Week navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-3xl h-8 w-8" onClick={() => setWeekOffset((o) => o - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-3xl h-8 w-8" onClick={() => setWeekOffset((o) => o + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="ml-1 text-sm font-semibold">{weekLabel}</span>
            {!isCurrentWeek && (
              <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>Today</Button>
            )}
          </div>

          {loading ? (
            <div className="animate-pulse rounded-lg border border-border bg-card" style={{ height: "520px" }} />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              {/* Calendar card */}
              <Card className="overflow-hidden rounded-lg border border-border bg-card lg:col-span-3">
                <CardContent className="p-0">
                  {/* Day headers */}
                  <div className="flex border-b border-border bg-card">
                    <div className="w-12 shrink-0" />
                    {weekDays.map((day) => (
                      <div key={toDateStr(day)} className="min-w-0 flex-1 border-l border-border/30 first:border-l-0">
                        <DayHeader day={day} today={today} />
                      </div>
                    ))}
                  </div>

                  {/* Mobile day tabs */}
                  <div className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2 lg:hidden">
                    {weekDays.map((day, idx) => {
                      const dateKey = toDateStr(day)
                      const hasSlots = (slotsByDate[dateKey] ?? []).length > 0
                      const isToday = dateKey === today
                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() => setSelectedMobileDay(idx)}
                          className={cn(
                            "flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                            selectedMobileDay === idx ? "bg-primary text-primary-foreground" : isToday ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          <span className="text-[9px] font-semibold">{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                          <span className="font-bold">{day.getDate()}</span>
                          {hasSlots && <span className="h-1 w-1 rounded-full bg-current opacity-60" />}
                        </button>
                      )
                    })}
                  </div>

                  {/* Mobile slot list */}
                  <div className="space-y-2 p-3 lg:hidden">
                    {(slotsByDate[toDateStr(weekDays[selectedMobileDay])] ?? []).length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-8 text-center">
                        <CalendarX className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No slots on this day</p>
                        <button
                          type="button"
                          onClick={() => handleEmptyCellClick(weekDays[selectedMobileDay])}
                          className="text-xs font-semibold text-primary hover:text-primary/80"
                        >
                          + Add availability
                        </button>
                      </div>
                    ) : (
                      (slotsByDate[toDateStr(weekDays[selectedMobileDay])] ?? []).map((slot) => {
                        const past = isPastSlot(slot)
                        const booked = isBookedSlot(slot)
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                              selectedSlotId === slot.id ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-muted",
                              past && "opacity-60"
                            )}
                          >
                            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", booked ? "bg-blue-50" : "bg-green-50")}>
                              <Clock className={cn("h-4 w-4", booked ? "text-blue-600" : "text-green-700")} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">{formatTime(slot.slotStartDateTime)} — {formatTime(slot.slotEndDateTime)}</p>
                              <p className="text-xs text-muted-foreground">{formatDuration(slot.durationMinutes)}</p>
                            </div>
                            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", booked ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-800")}>
                              {booked ? "Booked" : "Open"}
                            </span>
                          </button>
                        )
                      })
                    )}
                  </div>

                  {/* Desktop time grid */}
                  <div ref={scrollRef} className="hidden overflow-y-auto lg:block" style={{ maxHeight: "580px" }}>
                    <div className="flex" style={{ height: `${TOTAL_HEIGHT}px` }}>
                      {/* Hour labels */}
                      <div className="relative w-12 shrink-0 select-none">
                        {HOUR_TICKS.map((hour, idx) => (
                          <div
                            key={hour}
                            className="absolute right-2 text-[10px] leading-none text-muted-foreground"
                            style={{ top: `${idx * HOUR_HEIGHT - 6}px` }}
                          >
                            {hourLabel(hour)}
                          </div>
                        ))}
                      </div>

                      {/* Day columns */}
                      {weekDays.map((day) => {
                        const dateKey = toDateStr(day)
                        const daySlots = slotsByDate[dateKey] ?? []
                        const isToday = dateKey === today

                        return (
                          <div
                            key={dateKey}
                            className="relative min-w-0 flex-1 border-l border-border/20 cursor-pointer"
                            onClick={(e) => {
                              // Only trigger on direct column click (not on slot buttons)
                              if ((e.target as HTMLElement).closest("button")) return
                              handleEmptyCellClick(day)
                            }}
                          >
                            {isToday && <div className="pointer-events-none absolute inset-0 bg-primary/[0.025]" />}

                            {HOUR_TICKS.map((_, idx) => (
                              <div key={idx} className="absolute left-0 right-0 border-t border-border/25" style={{ top: `${idx * HOUR_HEIGHT}px` }} />
                            ))}
                            {HOUR_TICKS.slice(0, -1).map((_, idx) => (
                              <div key={`half-${idx}`} className="absolute left-0 right-0 border-t border-border/10" style={{ top: `${idx * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }} />
                            ))}

                            {isCurrentWeek && isToday && currentTimePx >= 0 && currentTimePx <= TOTAL_HEIGHT && (
                              <div className="pointer-events-none absolute left-0 right-0 z-10" style={{ top: `${currentTimePx}px` }}>
                                <div className="absolute -left-0.5 -top-1 h-2 w-2 rounded-full bg-red-500" />
                                <div className="w-full border-t-2 border-red-500" />
                              </div>
                            )}

                            {daySlots.map((slot) => (
                              <SlotBlock
                                key={slot.id}
                                slot={slot}
                                selected={selectedSlotId === slot.id}
                                onClick={() => {
                                  setShowAddSlotPanel(false)
                                  setSelectedSlotId((id) => (id === slot.id ? null : slot.id))
                                }}
                              />
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 border-t border-border px-4 py-2.5  text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="h-2.5 w-2.5 rounded-sm bg-green-800 border border-green-300/50" />
                      Open — bookable
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="h-2.5 w-2.5 rounded-sm bg-blue-300 border border-blue-300/50" />
                      Booked — reserved
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="h-2.5 w-2.5 rounded-sm bg-green-200/30 border border-green-200/40" />
                      Past
                    </div>
                    <span className="ml-auto text-xs">Click any empty cell to add a slot</span>
                  </div>
                </CardContent>
              </Card>

              {/* Right sidebar */}
              <div className="space-y-4">
                {renderRightSidebar()}
                <ThisWeekCard metrics={metrics} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === "list" && (
        <div className="">
          <Card className="rounded-lg">
            <CardHeader className="text-left pb-2">
              <CardTitle className="text-xs text-base font-semibold">Your availability</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading && (
                <p className="px-6 py-4 text-sm text-muted-foreground">Loading slots...</p>
              )}
              {!loading && error && (
                <p className="px-6 py-4 text-sm text-destructive">{error}</p>
              )}
              {!loading && !error && sortedSlots.length === 0 && (
                <p className="px-6 py-4 text-sm text-muted-foreground">No slots created yet.</p>
              )}
              {!loading && !error && sortedSlots.map((slot) => {
                const past = isPastSlot(slot)
                const booked = isBookedSlot(slot)
                const status = getStatusLabel(slot)

                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between px-6 py-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-0.5 text-left">
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(slot.slotStartDateTime).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(slot.slotStartDateTime)} · {formatDuration(slot.durationMinutes)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {past ? (
                        <Badge variant="outline" className="text-muted-foreground border-border">Past</Badge>
                      ) : booked ? (
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700 border border-blue-200">
                          Booked
                        </Badge>
                      ) : (
                        <Badge className="bg-green-50 text-green-800 hover:bg-green-50 hover:text-green-800 border border-green-200">
                          Open
                        </Badge>
                      )}

                      {!past && !booked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteSlot(slot.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting && deletingSlotId === slot.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}