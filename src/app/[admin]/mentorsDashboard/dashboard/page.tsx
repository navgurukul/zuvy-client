"use client"

import Link from "next/link"
import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CheckCircle,
  Users,
  Star,
  ArrowRight,
  Clock,
  XCircle,
  BookOpen,
  BarChart3,
  CalendarX,
} from "lucide-react"
import { useMyMentorSlots } from "@/hooks/useMyMentorSlots"
import { useMyMentorSessions, type MyMentorSession } from "@/hooks/useMyMentorSessions"
import { Progress } from "@nextui-org/react"
import { cn } from "@/lib/utils"

const SPARKLINES: Record<string, number[]> = {
  upcoming:  [2, 3, 4, 3, 5, 4, 6],
  completed: [4, 5, 6, 7, 5, 8, 7],
  bookings:  [3, 4, 3, 5, 6, 5, 7],
  rating:    [4, 5, 5, 4, 5, 5, 5],
};

function Sparkline({ bars = [], color }: { bars?: number[]; color: string }) {
  if (!bars.length) return null;

  const max = Math.max(...bars);

  return (
    <div className="flex items-end gap-0.5 h-8">
      {bars.map((h, i) => (
        <div
          key={i}
          className={cn("w-1.5 rounded-sm", color)}
          style={{
            height: `${(h / max) * 100}%`,
            opacity: 0.3 + (i / bars.length) * 0.7,
          }}
        />
      ))}
    </div>
  );
}
const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

const getDateValue = (value: unknown): Date | null => {
  if (typeof value !== "string" || !value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

const getRelativeTime = (value: string | null | undefined) => {
  const parsed = getDateValue(value)
  if (!parsed) {
    return "just now"
  }

  const nowMs = Date.now()
  const diffMs = Math.max(0, nowMs - parsed.getTime())

  const minuteMs = 60 * 1000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs

  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.floor(diffMs / minuteMs))
    return `${minutes}m ago`
  }

  if (diffMs < dayMs) {
    const hours = Math.max(1, Math.floor(diffMs / hourMs))
    return `${hours}h ago`
  }

  const days = Math.max(1, Math.floor(diffMs / dayMs))
  return `${days}d ago`
}

const formatShortDate = (value: string | null | undefined) => {
  const parsed = getDateValue(value)
  if (!parsed) {
    return "—"
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const getInitials = (name: string) => {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return "?"
  }

  const words = trimmedName.split(/\s+/).filter(Boolean)
  const initials = words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")

  return initials || trimmedName.slice(0, 2).toUpperCase()
}

type SessionNotification = {
  id: number
  message: string
  eventTime: string | null
  type: "cancelled" | "booked"
}

const normalizeSessionValue = (value: string | null | undefined) =>
  (value || "").toLowerCase()

const isCancelledSession = (session: MyMentorSession) => {
  const status = normalizeSessionValue(session.status)
  const lifecycle = normalizeSessionValue(session.sessionLifecycleState)

  return status.includes("cancel") || lifecycle.includes("cancel")
}

const isBookedSession = (session: MyMentorSession) => {
  if (isCancelledSession(session)) {
    return false
  }

  const status = normalizeSessionValue(session.status)
  const lifecycle = normalizeSessionValue(session.sessionLifecycleState)

  return (
    status.includes("book") ||
    status.includes("confirm") ||
    lifecycle.includes("schedule") ||
    lifecycle.includes("pending")
  )
}

const isCompletedSession = (session: MyMentorSession) => {
  if (isCancelledSession(session)) {
    return false
  }

  const status = normalizeSessionValue(session.status)
  const lifecycle = normalizeSessionValue(session.sessionLifecycleState)

  return status === "completed" || lifecycle === "completed" || session.completedAt !== null
}

const getFirstValidTimestamp = (
  session: MyMentorSession,
  fields: readonly (keyof MyMentorSession)[]
) => {
  for (const field of fields) {
    const value = session[field]
    if (typeof value === "string" && getDateValue(value)) {
      return value
    }
  }

  return null
}

const getLearnerLabel = (session: MyMentorSession) => {
  const possibleNameFields = [
    "studentName",
    "studentUserName",
    "studentFullName",
    "learnerName",
  ] as const

  for (const field of possibleNameFields) {
    const value = session[field]
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  if (typeof session.studentUserId === "number") {
    return `Student #${session.studentUserId}`
  }

  return "A learner"
}

const getEventTimestamp = (
  session: MyMentorSession,
  eventType: SessionNotification["type"]
) => {
  if (eventType === "cancelled") {
    return getFirstValidTimestamp(session, [
      "cancelledAt",
      "updatedAt",
      "createdAt",
      "bookedAt",
      "completedAt",
      "joinedAt",
    ])
  }

  return getFirstValidTimestamp(session, [
    "bookedAt",
    "createdAt",
    "updatedAt",
    "joinedAt",
    "completedAt",
  ])
}

export default function DashboardPage() {
  const pathname = usePathname()
  const role = pathname.split("/")[1]

  const { slots, loading: slotsLoading, error: slotsError } = useMyMentorSlots()
  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
  } = useMyMentorSessions()

  const now = new Date()

  const upcomingSlots = useMemo(
    () =>
      [...slots]
        .filter((slot) => new Date(slot.slotStartDateTime) > now)
        .sort(
          (left, right) =>
            new Date(left.slotStartDateTime).getTime() -
            new Date(right.slotStartDateTime).getTime()
        ),
    [slots, now]
  )

  const completedSessions = useMemo(
    () => sessions.filter(isCompletedSession),
    [sessions]
  )

  const recentCompletedSessions = useMemo(
    () =>
      completedSessions
        .map((session) => ({
          id: session.id,
          learnerName: getLearnerLabel(session),
          eventTime: getFirstValidTimestamp(session, [
            "completedAt",
            "joinedAt",
            "updatedAt",
            "bookedAt",
            "createdAt",
          ]),
        }))
        .sort((left, right) => {
          const leftTime = getDateValue(left.eventTime)?.getTime() || 0
          const rightTime = getDateValue(right.eventTime)?.getTime() || 0

          return rightTime - leftTime
        })
        .slice(0, 4),
    [completedSessions]
  )

  const openSlots = useMemo(
    () => slots.filter((slot) => slot.status.toLowerCase() === "available").length,
    [slots]
  )

  const completionRate =
    sessions.length === 0
      ? 0
      : Math.round((completedSessions.length / sessions.length) * 100)

  const totalHoursScheduled = useMemo(
    () => slots.reduce((sum, slot) => sum + slot.durationMinutes, 0) / 60,
    [slots]
  )

  const slotDurationById = useMemo(() => {
    const durationById = new Map<number, number>()

    for (const slot of slots) {
      durationById.set(slot.id, slot.durationMinutes)
    }

    return durationById
  }, [slots])

  const hoursDelivered = useMemo(() => {
    const deliveredMinutes = completedSessions.reduce((sum, session) => {
      const slotDuration = slotDurationById.get(session.slotAvailabilityId) || 0
      if (slotDuration > 0) {
        return sum + slotDuration
      }

      const joinedAt = getDateValue(session.joinedAt)
      const completedAt = getDateValue(session.completedAt)

      if (!joinedAt || !completedAt) {
        return sum
      }

      const sessionDurationMinutes = Math.round(
        (completedAt.getTime() - joinedAt.getTime()) / (60 * 1000)
      )

      return sessionDurationMinutes > 0 ? sum + sessionDurationMinutes : sum
    }, 0)

    return deliveredMinutes / 60
  }, [completedSessions, slotDurationById])

  const uniqueLearners = useMemo(() => {
    const learnerKeys = new Set<string>()

    for (const session of sessions) {
      if (typeof session.studentUserId === "number") {
        learnerKeys.add(`id:${session.studentUserId}`)
        continue
      }

      const learnerLabel = getLearnerLabel(session)
      if (learnerLabel !== "A learner") {
        learnerKeys.add(`name:${learnerLabel.toLowerCase()}`)
      }
    }

    return learnerKeys.size
  }, [sessions])

  const notifications = useMemo<SessionNotification[]>(() => {
    return sessions
      .reduce<SessionNotification[]>((items, session) => {
        const learnerLabel = getLearnerLabel(session)

        if (isCancelledSession(session)) {
          items.push({
            id: session.id,
            message: `${learnerLabel} has cancelled their session with you.`,
            eventTime: getEventTimestamp(session, "cancelled"),
            type: "cancelled",
          })

          return items
        }

        if (isBookedSession(session)) {
          items.push({
            id: session.id,
            message: `${learnerLabel} booked a session.`,
            eventTime: getEventTimestamp(session, "booked"),
            type: "booked",
          })
        }

        return items
      }, [])
      .sort((left, right) => {
        const leftTime = getDateValue(left.eventTime)?.getTime() || 0
        const rightTime = getDateValue(right.eventTime)?.getTime() || 0
        return rightTime - leftTime
      })
      .slice(0, 5)
  }, [sessions])

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {upcomingSlots.length} upcoming slots scheduled
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl  gap-4 hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex justify-between items-start">
            <div className="space-y-1">
                <div className="p-3 w-fit rounded-full bg-slate-100 mb-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                    <p className="text-2xl font-bold">{upcomingSlots.length}</p>
                    <p className="text-sm text-muted-foreground">Upcoming Slots</p>
                    <p className="text-sm  mt-4">{openSlots} still open</p>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
            <Sparkline bars={SPARKLINES.upcoming} color="bg-green-800" />
            </div>
        </CardContent>
        </Card>
        <Card className="rounded-3xl  gap-4 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex justify-between items-start">
            <div className="space-y-1">
              <div className="p-3 w-fit rounded-full bg-slate-100 mb-4">
                  <CheckCircle className="w-5 h-5 text-muted-foreground" />
              </div>
            <div className="text-left">
              <p className="text-2xl font-bold">{completedSessions.length}</p>
              <p className="text-sm text-muted-foreground">Completed Sessions</p>
              <p className="text-sm  mt-4">of {sessions.length} total bookings</p>
            </div>
              </div>
              <div className="flex flex-col items-end gap-2">
            <Sparkline bars={SPARKLINES.completed} color="bg-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl  gap-4 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="p-3 w-fit rounded-full bg-slate-100 mb-4">
                  <Users className="w-5 h-5 text-muted-foreground" />
              </div>

            <div className="text-left">
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-sm text-muted-foreground">Bookings Managed</p>
              <p className="text-sm  mt-4">all lifecycle states</p>
            </div>
            </div>
            <div className="flex flex-col items-end gap-2">
            <Sparkline bars={SPARKLINES.bookings} color="bg-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl  gap-4 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex justify-between items-start">
                        <div className="space-y-1">
<div className="p-3 w-fit rounded-full bg-slate-100 mb-4">
                  <Star className="w-5 h-5 text-muted-foreground" />
              </div>
            <div className="text-left">
              <p className="text-2xl font-bold">{completionRate}%</p>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-sm  mt-4">rating data pending</p>
            </div>
            </div>
            <div className="flex flex-col items-end gap-2">
            <Sparkline bars={SPARKLINES.rating} color="bg-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className='rounded-3xl shadow-sm border-slate-200 hover:shadow-md transition-shadow min-h-[300px] flex flex-col'>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Upcoming Slots</CardTitle>
              <Button asChild  size="sm" variant="link" className="text-emerald-700 text-xs font-semibold p-0 h-auto">
                <Link href={`/${role}/mentorsDashboard/availability`}>
                  View all <ArrowRight className="ml-1 w-3 h-3" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="">
              {slotsLoading && <p className="text-sm text-muted-foreground">Loading upcoming slots...</p>}
              {!slotsLoading && slotsError && <p className="text-sm text-red-500">{slotsError}</p>}
              {!slotsLoading && !slotsError && upcomingSlots.length === 0 && (
                 <div className='vv'>  
                      <CalendarX className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm font-semibold text-text-primary">No upcoming sessions</p>
                      <p className="text-xs text-text-muted mt-0.5">Update your availability to let learners book sessions</p>
                    </div>
              )}

              {!slotsLoading &&
                !slotsError &&
                upcomingSlots.slice(0, 5).map((slot) => (
                  <div key={slot.id} className="rounded-full border p-3 flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{formatDateTime(slot.slotStartDateTime)}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot.durationMinutes} min · {slot.currentBookedCount}/{slot.maxCapacity} booked
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">{slot.status}</Badge>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card className='rounded-3xl shadow-sm border-slate-200 hover:shadow-md transition-shadow'>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="space-y-0.5 text-left">
                <CardTitle className="text-sm font-bold text-text-primary">Recent Sessions</CardTitle>
                <p className="text-xs text-text-muted">{completedSessions.length} completed</p>
              </div>
              <Button asChild variant="link" size="sm" className="text-emerald-700 text-xs font-semibold p-0 h-autod">
                <Link href={`/${role}/mentorsDashboard/sessions`}>
                  View all <ArrowRight className="ml-1 w-3 h-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="text-left">
              {sessionsLoading && (
                <p className="py-6 text-center text-sm text-text-muted">Loading recent sessions...</p>
              )}

              {!sessionsLoading && sessionsError && (
                <p className="py-6 text-center text-sm text-red-500">{sessionsError}</p>
              )}

              {!sessionsLoading && !sessionsError && recentCompletedSessions.length === 0 && (
                <p className="py-6 text-center text-sm text-text-muted">No completed sessions yet.</p>
              )}

              {!sessionsLoading && !sessionsError && recentCompletedSessions.length > 0 && (
                <div>
                  {recentCompletedSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 border-b border-border py-3 last:border-0"
                    >
                      <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full bg-success-light text-xs font-bold text-success">
                        {getInitials(session.learnerName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text-primary">{session.learnerName}</p>
                        <p className="truncate text-xs text-text-muted">Learner</p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs text-text-muted">{formatShortDate(session.eventTime)}</p>
                        <span className="mt-0.5 inline-block rounded-full bg-success-light px-2 py-0.5 text-[10px] font-semibold text-success">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-3xl shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row justify-between items-center pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">Performance Snapshot</CardTitle>
                <p className="text-xs text-slate-400 text-left">Your mentoring at a glance</p>
              </div>
              <Button asChild variant="link" className="text-emerald-700 text-xs font-semibold p-0 h-auto">
                <Link href={`/${role}/mentorsDashboard/performance`}>
                  Full report <ArrowRight className="ml-1 w-3 h-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50/50 rounded-xl p-4 border">
                <div className="flex items-center gap-2 mb-2">
                   <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                   <span className="text-xs font-semibold text-slate-600">Completion Rate</span>
                </div>
                <p className="text-2xl font-bold mb-2">{completionRate}%</p>
                <Progress value={completionRate} className="h-1.5 bg-slate-200" />
              </div>
              <div className="bg-slate-50/50 rounded-xl p-4 border ">
                <div className="flex items-center gap-2 mb-2">
                   <Star className="w-3.5 h-3.5 text-emerald-600" />
                   <span className="text-xs font-semibold text-slate-600">Avg Rating</span>
                </div>
                <p className="text-2xl font-bold mb-2">—</p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-emerald-500 text-emerald-500" />)}
                </div>
              </div>
               <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Clock className="h-3.5 w-3.5 text-info" />
                      <p className="text-xs font-medium text-text-secondary">Hours Delivered</p>
                    </div>
                    <p className="text-2xl font-bold text-text-primary tabular-nums">{hoursDelivered}h</p>
                    <p className="text-[10px] text-text-muted mt-1">Across {completedSessions.length} sessions</p>
                </div>
               <div className="bg-slate-50/50 rounded-xl p-4 border">
                <div className="flex items-center gap-1.5 mb-2">
                      <Users className="h-3.5 w-3.5 text-secondary" />
                      <p className="text-xs font-medium text-text-secondary">Learners Helped</p>
                    </div>
                    <p className="text-2xl font-bold text-text-primary tabular-nums">{uniqueLearners}</p>
                    <p className="text-[10px] text-text-muted mt-1">Unique learners</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="rounded-3xl shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-left">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              {sessionsLoading && (
                <p className="text-xs text-muted-foreground text-left">Loading notifications...</p>
              )}

              {!sessionsLoading && sessionsError && (
                <p className="text-xs text-red-500">{sessionsError}</p>
              )}

              {!sessionsLoading && !sessionsError && notifications.length === 0 && (
                <p className="text-xs text-muted-foreground">No notifications available yet.</p>
              )}

              {!sessionsLoading &&
                !sessionsError &&
                notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3">
                    {notification.type === "cancelled" ? (
                      <XCircle className="text-red-500 w-5 h-5" />
                    ) : (
                      <Calendar className="text-green-600 w-5 h-5" />
                    )}

                    <div className="text-sm">
                      <p>{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTime(notification.eventTime)}
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
          <Card className='rounded-3xl shadow-sm border-slate-200 hover:shadow-md transition-shadow'>
            <CardHeader className='text-left pb-3'>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              <button className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg group transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-full"><Calendar className="w-4 h-4 text-emerald-700" /></div>
                  <div className="text-left">
                    <Link href={`/${role}/mentorsDashboard/availability`} className="text-xs font-bold text-slate-800">Manage Availability</Link>
                    <p className="text-[10px] text-slate-400">Set your open slots</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
              </button>

              <button className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg group transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-full"><BookOpen className="w-4 h-4 text-orange-600" /></div>
                  <div className="text-left">
                    <Link href={`/${role}/mentorsDashboard/sessions`} className="text-xs font-bold text-slate-800">View All Sessions</Link>
                    <p className="text-[10px] text-slate-400">Upcoming & past sessions</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
              </button>

              <button className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg group transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-full"><BarChart3 className="w-4 h-4 text-emerald-500" /></div>
                  <div className="text-left">
                    <Link href={`/${role}/mentorsDashboard/performance`} className="text-xs font-bold text-slate-800">Performance Metrics</Link>
                    <p className="text-[10px] text-slate-400">Ratings & session stats</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}