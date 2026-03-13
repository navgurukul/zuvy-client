"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import {
  AlertTriangle,
  CalendarDays,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Lock,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useDeleteMentorSlot } from "@/hooks/useDeleteMentorSlot"
import { useMyMentorSlots, type MentorCreatedSlot } from "@/hooks/useMyMentorSlots"
import { cn } from "@/lib/utils"

const START_HOUR = 7
const END_HOUR = 22
const HOURS_COUNT = END_HOUR - START_HOUR
const HOUR_HEIGHT = 56
const TOTAL_HEIGHT = HOURS_COUNT * HOUR_HEIGHT
const HOUR_TICKS = Array.from({ length: HOURS_COUNT + 1 }, (_, index) => START_HOUR + index)
const minimumDeleteLeadTimeMs = 12 * 60 * 60 * 1000

const toDateStr = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const getMonday = (referenceDate: Date) => {
  const date = new Date(referenceDate)
  date.setHours(0, 0, 0, 0)

  const day = date.getDay()
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1))

  return date
}

const hourLabel = (hour: number) => {
  if (hour === 0 || hour === 24) return "12am"
  if (hour === 12) return "12pm"
  return hour > 12 ? `${hour - 12}pm` : `${hour}am`
}

const formatLongDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

const formatDuration = (durationMinutes: number) => {
  if (durationMinutes % 60 === 0) {
    const hours = durationMinutes / 60
    return `${hours} hr`
  }

  return `${durationMinutes} min`
}

const normalizeStatus = (status: string) => status.toLowerCase()

const isOpenSlot = (slot: MentorCreatedSlot) => {
  const status = normalizeStatus(slot.status)
  return status === "available" || status === "open"
}

const isBookedSlot = (slot: MentorCreatedSlot) =>
  slot.currentBookedCount > 0 || normalizeStatus(slot.status) === "booked"

const getStatusLabel = (slot: MentorCreatedSlot) => {
  if (isBookedSlot(slot)) return "Booked"
  if (isOpenSlot(slot)) return "Open"
  return slot.status
}

const isPastSlot = (slot: MentorCreatedSlot) => new Date(slot.slotEndDateTime) <= new Date()

const canDeleteSlot = (slot: MentorCreatedSlot) => {
  if (isBookedSlot(slot) || isPastSlot(slot)) {
    return false
  }

  return new Date(slot.slotStartDateTime).getTime() - Date.now() >= minimumDeleteLeadTimeMs
}

const getDeleteBlockReason = (slot: MentorCreatedSlot) => {
  if (isBookedSlot(slot)) {
    return "Booked slots cannot be removed."
  }

  if (isPastSlot(slot)) {
    return "Past slots can no longer be removed."
  }

  if (!canDeleteSlot(slot)) {
    return "Slot can be removed only if start time is at least 12 hours away."
  }

  return null
}

const getSlotDateKey = (slot: MentorCreatedSlot) => toDateStr(new Date(slot.slotStartDateTime))

const slotTop = (slot: MentorCreatedSlot) => {
  const start = new Date(slot.slotStartDateTime)
  const startMinutes = start.getHours() * 60 + start.getMinutes()
  return ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT
}

const slotHeight = (slot: MentorCreatedSlot) =>
  Math.max((slot.durationMinutes / 60) * HOUR_HEIGHT, 22)

const formatHoursLabel = (slots: MentorCreatedSlot[]) => {
  const hours = slots.reduce((total, slot) => total + slot.durationMinutes, 0) / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`
}

function DayHeader({ day, today }: { day: Date; today: string }) {
  const dateString = toDateStr(day)
  const isToday = dateString === today

  return (
    <div className={cn("select-none py-2.5 text-center", isToday && "relative")}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
        {day.toLocaleDateString("en-US", { weekday: "short" })}
      </p>
      <div
        className={cn(
          "mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
          isToday ? "bg-primary text-primary-foreground" : "text-text-primary"
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
            ? "cursor-default border-info/20 bg-info-light/30 text-info/50"
            : "border-info/30 bg-info-light text-info hover:brightness-95"
          : past
            ? "cursor-default border-success/20 bg-success-light/25 text-success-dark/40"
            : "border-success/30 bg-success-light text-success-dark hover:brightness-95",
        selected && !past && "z-10 ring-2 ring-primary ring-offset-1"
      )}
      style={{ top: `${top}px`, height: `${height}px` }}
    >
      <p className="truncate text-[10px] font-bold leading-none">
        {formatTime(slot.slotStartDateTime)}
      </p>
      {tall && (
        <p className="mt-0.5 truncate text-[9px] leading-none opacity-80">
          {booked ? "Booked" : "Open"}
        </p>
      )}
    </button>
  )
}

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

    const timeout = setTimeout(() => setConfirmDelete(false), 4000)
    return () => clearTimeout(timeout)
  }, [confirmDelete])

  const handleDelete = async () => {
    const removed = await onDelete(slot.id)

    if (removed) {
      onClose()
    }
  }

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Slot Details</h3>
            <p className="mt-0.5 text-xs text-text-muted">
              {past ? "This slot has passed" : "Active availability slot"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            past
              ? "bg-muted text-text-muted"
              : booked
                ? "bg-info-light text-info"
                : "bg-success-light text-success-dark"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              past ? "bg-text-muted" : booked ? "bg-info" : "bg-success"
            )}
          />
          {past ? "Past" : booked ? "Booked" : "Open"}
        </span>

        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium text-text-muted">Date</p>
              <p className="mt-0.5 text-sm font-semibold text-text-primary">
                {formatLongDate(slot.slotStartDateTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium text-text-muted">Time</p>
              <p className="mt-0.5 text-sm font-semibold text-text-primary">
                {formatTime(slot.slotStartDateTime)} — {formatTime(slot.slotEndDateTime)}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">{formatDuration(slot.durationMinutes)}</p>
            </div>
          </div>
        </div>

        {slot.currentBookedCount > 0 && (
          <div className="rounded-lg bg-info-light px-3 py-2.5 text-xs text-info-dark">
            {slot.currentBookedCount} learner{slot.currentBookedCount !== 1 ? "s" : ""} booked this slot.
          </div>
        )}

        {booked && !past && (
          <div className="flex items-start gap-2 rounded-lg bg-info-light px-3 py-2.5 text-xs text-info-dark">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>This slot is reserved by a learner and cannot be deleted.</p>
          </div>
        )}

        {past && (
          <div className="rounded-lg bg-muted px-3 py-2.5 text-xs text-text-muted">
            This slot is in the past and is no longer active.
          </div>
        )}

        {!booked && !past && deleteBlockedReason && (
          <div className="flex items-start gap-2 rounded-lg bg-warning-light px-3 py-2.5 text-xs text-warning-dark">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>{deleteBlockedReason}</p>
          </div>
        )}

        {deleteError && (
          <p className="text-xs font-medium text-destructive">{deleteError}</p>
        )}

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
                <p className="text-xs font-medium text-destructive">
                  Delete this slot? This cannot be undone.
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground transition-colors hover:bg-destructive-dark disabled:opacity-60"
                  >
                    {deleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    {deleting ? "Deleting..." : "Confirm Delete"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive-light"
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

function EmptyDetailPanel() {
  return (
    <Card className="rounded-xl border border-dashed border-border bg-card shadow-sm">
      <CardContent className="space-y-3 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <CalendarDays className="h-5 w-5 text-text-muted" />
        </div>

        <div>
          <p className="text-sm font-semibold text-text-primary">No slot selected</p>
          <p className="mt-0.5 text-xs text-text-muted">
            Click any slot on the calendar to view its details
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CalendarPage() {
  const pathname = usePathname()
  const role = pathname.split("/")[1]
  const today = toDateStr(new Date())

  const { slots, loading, error, refetchMySlots } = useMyMentorSlots()
  const { isDeleting, deletingSlotId, error: deleteError, deleteSlot } = useDeleteMentorSlot()

  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()))
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedMobileDay, setSelectedMobileDay] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + index)
        return date
      }),
    [weekStart]
  )

  const weekEnd = weekDays[6]
  const weekEndExclusive = useMemo(() => addDays(weekStart, 7), [weekStart])

  const weekSlots = useMemo(
    () =>
      slots
        .filter((slot) => {
          const start = new Date(slot.slotStartDateTime)
          return start >= weekStart && start < weekEndExclusive
        })
        .sort(
          (left, right) =>
            new Date(left.slotStartDateTime).getTime() -
            new Date(right.slotStartDateTime).getTime()
        ),
    [slots, weekStart, weekEndExclusive]
  )

  const slotsByDate = useMemo(() => {
    const map: Record<string, MentorCreatedSlot[]> = {}

    for (const slot of weekSlots) {
      const dateKey = getSlotDateKey(slot)
      if (!map[dateKey]) {
        map[dateKey] = []
      }

      map[dateKey].push(slot)
    }

    return map
  }, [weekSlots])

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId) || null,
    [slots, selectedSlotId]
  )

  const isCurrentWeek = useMemo(
    () => toDateStr(weekStart) <= today && today <= toDateStr(weekEnd),
    [today, weekEnd, weekStart]
  )

  const currentTimePx = useMemo(() => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    return ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT
  }, [currentTime])

  const totalSlots = weekSlots.length
  const openSlots = weekSlots.filter((slot) => isOpenSlot(slot) && !isBookedSlot(slot)).length
  const bookedSlots = weekSlots.filter(isBookedSlot).length
  const totalHours = formatHoursLabel(weekSlots)

  const weekLabel = `${weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollTop = HOUR_HEIGHT
    }
  }, [loading])

  useEffect(() => {
    const todayInWeek = weekDays.findIndex((day) => toDateStr(day) === today)
    setSelectedMobileDay(todayInWeek >= 0 ? todayInWeek : 0)
    setSelectedSlotId(null)
  }, [today, weekDays])

  useEffect(() => {
    if (selectedSlotId !== null && !selectedSlot) {
      setSelectedSlotId(null)
    }
  }, [selectedSlot, selectedSlotId])

  const prevWeek = () => {
    setWeekStart((currentWeekStart) => addDays(currentWeekStart, -7))
  }

  const nextWeek = () => {
    setWeekStart((currentWeekStart) => addDays(currentWeekStart, 7))
  }

  const goToToday = () => {
    setWeekStart(getMonday(new Date()))
  }

  const handleDelete = async (slotId: number) => {
    const removed = await deleteSlot(slotId)

    if (removed) {
      await refetchMySlots()
      setSelectedSlotId(null)
    }

    return removed
  }

  return (
    <div className="min-h-screen space-y-4 p-6">
      <div className="text-left">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          {!loading
            ? `${totalSlots} slot${totalSlots !== 1 ? "s" : ""} this week`
            : "Your availability at a glance."}
        </p>
      </div>

      {!loading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive-light/40 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="max-w-7xl space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-3xl" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon"  className="rounded-3xl" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <span className="ml-1 text-sm font-semibold text-text-primary">{weekLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            {!isCurrentWeek && (
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            )}

            <Button asChild size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-dark">
              <Link href={`/${role}/mentorsDashboard/availability`}>
                <Plus className="h-3.5 w-3.5" />
                Add Slot
              </Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse rounded-xl border border-border bg-card" style={{ height: "520px" }} />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <Card className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-3">
              <CardContent className="p-0">
                <div className="flex border-b border-border bg-card">
                  <div className="w-12 shrink-0" />
                  {weekDays.map((day) => (
                    <div
                      key={toDateStr(day)}
                      className="min-w-0 flex-1 border-l border-border/30 first:border-l-0"
                    >
                      <DayHeader day={day} today={today} />
                    </div>
                  ))}
                </div>

                <div className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2 lg:hidden">
                  {weekDays.map((day, index) => {
                    const dateKey = toDateStr(day)
                    const hasSlotsOnDay = (slotsByDate[dateKey] ?? []).length > 0
                    const isToday = dateKey === today

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => setSelectedMobileDay(index)}
                        className={cn(
                          "flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          selectedMobileDay === index
                            ? "bg-primary text-primary-foreground"
                            : isToday
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-text-secondary hover:bg-muted/80"
                        )}
                      >
                        <span className="text-[9px] font-semibold">
                          {day.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <span className="font-bold">{day.getDate()}</span>
                        {hasSlotsOnDay && <span className="h-1 w-1 rounded-full bg-current opacity-60" />}
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-2 p-3 lg:hidden">
                  {(slotsByDate[toDateStr(weekDays[selectedMobileDay])] ?? []).length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <CalendarX className="h-8 w-8 text-text-muted" />
                      <p className="text-sm text-text-muted">No slots on this day</p>
                      <Link
                        href={`/${role}/mentorsDashboard/availability`}
                        className="text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
                      >
                        + Add availability
                      </Link>
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
                            selectedSlotId === slot.id
                              ? "border-primary/40 bg-primary/5"
                              : "border-border bg-card hover:bg-muted",
                            past && "opacity-60"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              booked ? "bg-info-light" : "bg-success-light"
                            )}
                          >
                            <Clock className={cn("h-4 w-4", booked ? "text-info" : "text-success")} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-text-primary">
                              {formatTime(slot.slotStartDateTime)} — {formatTime(slot.slotEndDateTime)}
                            </p>
                            <p className="text-xs text-text-muted">{formatDuration(slot.durationMinutes)}</p>
                          </div>

                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              booked ? "bg-info-light text-info" : "bg-success-light text-success-dark"
                            )}
                          >
                            {booked ? "Booked" : "Open"}
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>

                <div ref={scrollRef} className="hidden overflow-y-auto lg:block" style={{ maxHeight: "580px" }}>
                  <div className="flex" style={{ height: `${TOTAL_HEIGHT}px` }}>
                    <div className="relative w-12 shrink-0 select-none">
                      {HOUR_TICKS.map((hour, index) => (
                        <div
                          key={hour}
                          className="absolute right-2 text-[10px] leading-none text-text-muted"
                          style={{ top: `${index * HOUR_HEIGHT - 6}px` }}
                        >
                          {hourLabel(hour)}
                        </div>
                      ))}
                    </div>

                    {weekDays.map((day) => {
                      const dateKey = toDateStr(day)
                      const daySlots = slotsByDate[dateKey] ?? []
                      const isToday = dateKey === today

                      return (
                        <div key={dateKey} className="relative min-w-0 flex-1 border-l border-border/20">
                          {isToday && <div className="pointer-events-none absolute inset-0 bg-primary/[0.025]" />}

                          {HOUR_TICKS.map((hour, index) => (
                            <div
                              key={hour}
                              className="absolute left-0 right-0 border-t border-border/25"
                              style={{ top: `${index * HOUR_HEIGHT}px` }}
                            />
                          ))}

                          {HOUR_TICKS.slice(0, -1).map((hour, index) => (
                            <div
                              key={`half-${hour}`}
                              className="absolute left-0 right-0 border-t border-border/10"
                              style={{ top: `${index * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
                            />
                          ))}

                          {isCurrentWeek &&
                            isToday &&
                            currentTimePx >= 0 &&
                            currentTimePx <= TOTAL_HEIGHT && (
                              <div
                                className="pointer-events-none absolute left-0 right-0 z-10"
                                style={{ top: `${currentTimePx}px` }}
                              >
                                <div className="absolute -left-0.5 -top-1 h-2 w-2 rounded-full bg-red-500" />
                                <div className="w-full border-t-2 border-red-500" />
                              </div>
                            )}

                          {daySlots.map((slot) => (
                            <SlotBlock
                              key={slot.id}
                              slot={slot}
                              selected={selectedSlotId === slot.id}
                              onClick={() =>
                                setSelectedSlotId((currentSlotId) =>
                                  currentSlotId === slot.id ? null : slot.id
                                )
                              }
                            />
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {selectedSlot ? (
                <SlotDetailPanel
                  slot={selectedSlot}
                  onClose={() => setSelectedSlotId(null)}
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
                  deletingSlotId={deletingSlotId}
                  deleteError={deleteError}
                />
              ) : (
                <EmptyDetailPanel />
              )}

              <Card className="rounded-xl border border-border bg-card shadow-sm">
                <CardContent className="space-y-3 p-4 text-left">
                  <p className="text-sm font-bold text-text-primary ">Legend</p>

                  <div className="space-y-2">
                    {[
                      {
                        color: "bg-success-light border border-success/30",
                        label: "Open",
                        description: "Available for booking",
                      },
                      {
                        color: "bg-info-light border border-info/30",
                        label: "Booked",
                        description: "Reserved by a learner",
                      },
                      {
                        color: "bg-success-light/25 border border-success/20",
                        label: "Past (open)",
                        description: "Passed, not booked",
                      },
                      {
                        color: "bg-info-light/30 border border-info/20",
                        label: "Past (booked)",
                        description: "Passed session",
                      },
                    ].map(({ color, label, description }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className={cn("h-3 w-5 shrink-0 rounded-sm", color)} />
                        <div>
                          <p className="text-[10px] font-semibold text-text-secondary">{label}</p>
                          <p className="text-[9px] text-text-muted">{description}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-5 shrink-0 bg-red-500" />
                      <div>
                        <p className="text-[10px] font-semibold text-text-secondary">Now</p>
                        <p className="text-[9px] text-text-muted">Current time</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-border bg-card shadow-sm">
                <CardContent className="space-y-2 p-4 text-left">
                  <p className="text-xs font-bold text-text-primary">This Week</p>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Total slots", value: totalSlots },
                      { label: "Open", value: openSlots },
                      { label: "Booked", value: bookedSlots },
                      { label: "Hours", value: totalHours },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg bg-muted p-2 text-center">
                        <p className="text-base font-bold tabular-nums text-text-primary">{value}</p>
                        <p className="text-[9px] text-text-muted">{label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!loading && !error && slots.length === 0 && (
          <Card className="rounded-xl border border-dashed border-border bg-card shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <CalendarX className="h-7 w-7 text-text-muted" />
              </div>

              <div>
                <p className="text-sm font-semibold text-text-primary">No availability slots yet</p>
                <p className="mt-1 text-xs text-text-muted">
                  Create slots so learners can book sessions with you
                </p>
              </div>

              <Button asChild className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-dark">
                <Link href={`/${role}/mentorsDashboard/availability`}>
                  <Plus className="h-4 w-4" />
                  Create Availability
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
