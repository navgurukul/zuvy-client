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
  BookOpen,
  BarChart3,
  CalendarX,
  Bell,
  BellOff,
  CheckCheck,
} from "lucide-react"
// import { useMyMentorSlots } from "@/hooks/useMyMentorSlots"
import { useMyMentorSessions, type MyMentorSession } from "@/hooks/useMyMentorSessions"
import { useMentorMetrics } from "@/hooks/useMentorMetrics"
import { useNotifications } from "@/hooks/useNotifications"
import { MentorDashboardSkeleton } from "@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton"
import { Progress } from "@nextui-org/react"
import { cn } from "@/lib/utils"

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

const formatDateOnly = (value?: string | null) => {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

const formatTimeOnly = (value?: string | null) => {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

const formatTimeRange = (start?: string | null, end?: string | null) => {
  const startTime = formatTimeOnly(start)
  const endTime = formatTimeOnly(end)

  if (startTime === "-" && endTime === "-") {
    return "-"
  }

  if (startTime === "-") {
    return endTime
  }

  if (endTime === "-") {
    return startTime
  }

  return `${startTime} – ${endTime}`
}

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

export default function DashboardPage() {
  const pathname = usePathname()
  const role = pathname.split("/")[1]
  const {
    sessions: completedSessions,
    loading: completedSessionsLoading,
    error: completedSessionsError,
  } = useMyMentorSessions(true, "/instructor/mentor-sessions/my", "completed", "desc")
  const {
    sessions: upcomingSessions,
    loading: upcomingSessionsLoading,
    error: upcomingSessionsError,
  } = useMyMentorSessions(true, "/instructor/mentor-sessions/my", "upcoming", "asc")
  const {
    metrics,
    loading: metricsLoading,
    error: metricsError,
  } = useMentorMetrics(true)
  const {
    notifications: apiNotifications,
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    markingRead,
  } = useNotifications()

  const isInitialLoading =
    completedSessionsLoading ||
    metricsLoading ||
    notificationsLoading

  const upcomingSessionsCount = Number(metrics?.upcomingSessions) || 0
  const isEmptyDashboard =
  upcomingSessionsCount === 0 &&
  (Number(metrics?.sessions?.total) || 0) === 0 &&
  (Number(metrics?.sessions?.completed) || 0) === 0 &&
  upcomingSessions.length === 0 &&
  apiNotifications.length === 0
  // return isInitialLoading ? (
  //   <MentorDashboardSkeleton />
  // ) : 
  if (isInitialLoading) {
  return <MentorDashboardSkeleton />
}

if (isEmptyDashboard) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Card className="border-slate-200">
        <CardContent className="flex flex-col items-center justify-center text-center py-24">
          <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <Calendar className="h-7 w-7 text-emerald-700" />
          </div>

          <h2 className="text-2xl font-semibold ">
            You're not available for booking yet
          </h2>

          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Add your first open slot so students in your course can
            discover and book a mentoring session with you.
          </p>

          <Button
            asChild
            className="mt-6 bg-emerald-700 hover:bg-emerald-800"
          >
            <Link href={`/${role}/mentorsDashboard/availability`}>
              + Set up availability
            </Link>
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            You can add multiple slots at once and edit them any time.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
   return(
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
      <div className="text-left">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {upcomingSessionsCount} Upcoming Sessions Scheduled
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-lg  gap-4 hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex justify-between items-start">
            <div className="space-y-1">
                <div className="p-3 w-fit rounded-full bg-slate-100 mb-0">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">{upcomingSessionsCount}</p>
                  <p className="text-xs text-muted-foreground">Upcoming Sessions</p>
                  <p className="text-xs  mt-0">Next on your schedule</p>
                </div>
            </div>

            {/* <div className="flex flex-col items-end gap-2">
            <Sparkline bars={SPARKLINES.upcoming} color="bg-green-800" />
            </div> */}
        </CardContent>
        </Card>
        <Card className="rounded-lg  gap-4 hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex justify-between items-start">
            <div className="space-y-1">
              <div className="p-3 w-fit rounded-full bg-slate-100 mb-0">
                  <CheckCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold">{Number(metrics?.sessions.completed) || 0}</p>
                <p className="text-xs text-muted-foreground">Completed Sessions</p>
                <p className="text-xs  mt-0">of {Number(metrics?.sessions.total) || 0} total bookings</p>
              </div>
            </div>
               {/*<div className="flex flex-col items-end gap-2">
            <Sparkline bars={SPARKLINES.completed} color="bg-green-600" />
            </div> */}
          </CardContent>
        </Card>
        <Card className="rounded-lg  gap-4 hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="p-3 w-fit rounded-full bg-slate-100 mb-0">
                  <Users className="w-5 h-5 text-muted-foreground" />
              </div>

            <div className="text-left">
              <p className="text-2xl font-bold">{Number(metrics?.sessions.total) || 0}</p>
              <p className="text-xs text-muted-foreground">Bookings Managed</p>
              <p className="text-xs  mt-0">All session states</p>
            </div>
            </div>
            {/* <div className="flex flex-col items-end gap-2">
            <Sparkline bars={SPARKLINES.bookings} color="bg-orange-600" />
            </div> */}
          </CardContent>
        </Card>

        <Card className="rounded-lg  gap-4 hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex justify-between items-start">
            <div className="space-y-1">
                <div className="p-3 w-fit rounded-full bg-slate-100 mb-0">
                  <Star className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold">{metrics?.ratings.averageRating ? Number(metrics.ratings.averageRating).toFixed(1) : "—"}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
                <p className="text-xs  mt-0">
                  {metrics?.ratings.totalRatings && Number(metrics.ratings.totalRatings) > 0
                    ? `From ${metrics.ratings.totalRatings} rated sessions`
                    : "No ratings yet"}
                </p>
              </div>
            </div>
            {/* <div className="flex flex-col items-end gap-2">
            <Sparkline bars={SPARKLINES.rating} color="bg-green-400" />
            </div> */}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className='rounded-lg shadow-sm border-slate-200 hover:shadow-md transition-shadow min-h-[300px] flex flex-col'>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-sm">Upcoming Sessions</CardTitle>
              <Button asChild  size="sm" variant="link" className="text-emerald-700 text-xs font-semibold p-0 h-auto">
                <Link href={`/${role}/mentorsDashboard/availability`}>
                  View all <ArrowRight className="ml-1 w-3 h-3" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="">
              {upcomingSessionsLoading && <p className="text-sm text-muted-foreground">Loading upcoming sessions...</p>}
              {!upcomingSessionsLoading && upcomingSessionsError && <p className="text-sm text-red-500">{upcomingSessionsError}</p>}
              {!upcomingSessionsLoading && !upcomingSessionsError && upcomingSessions.length === 0 && (
                 <div className='flex flex-col items-center justify-center text-center mt-10'>  
                      <CalendarX className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm font-semibold text-text-primary">No upcoming sessions</p>
                      <p className="text-xs text-text-muted mt-0.5">Update your availability to let learners book sessions</p>
                    </div>
              )}
              {!upcomingSessionsLoading &&
                !upcomingSessionsError &&
                upcomingSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className=" border-b p-3 flex items-center justify-between gap-3 mb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                        {getLearnerLabel(session)
                          .replace(/\s+/g, "")
                          .slice(0, 2)
                          .toUpperCase() || "S"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 text-start">
                          {getLearnerLabel(session)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatDateOnly(session.slotStart || session.slotEnd)} · {formatTimeRange(session.slotStart, session.slotEnd)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700">{session.status}</Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="rounded-lg shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-left">Notifications</CardTitle>
              </div>
              {apiNotifications.some((notification) => !notification.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </CardHeader>
            <CardContent className="space-y-3 text-left">
              {notificationsLoading && (
                <p className="text-xs text-muted-foreground text-left">Loading notifications...</p>
              )}

              {!notificationsLoading && notificationsError && (
                <p className="text-xs text-red-500">{notificationsError}</p>
              )}

              {!notificationsLoading && !notificationsError && apiNotifications.length === 0 && (
                <div className="flex flex-col items-center py-6 gap-2 text-center">
                  <BellOff className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">No notifications yet.</p>
                </div>
              )}

              {!notificationsLoading &&
                !notificationsError &&
                <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                  {apiNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 rounded-xl p-2 transition-colors ${
                        notification.isRead ? "opacity-60" : "bg-slate-50"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notification.isRead ? (
                          <Bell className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Bell className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notification.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {getRelativeTime(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <button
                          disabled={markingRead.has(notification.id)}
                          onClick={() => markAsRead(notification.id)}
                          className="shrink-0 mt-0.5 text-[10px] font-semibold text-emerald-700 hover:underline disabled:opacity-40"
                        >
                          {markingRead.has(notification.id) ? "..." : "Mark read"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>}
            </CardContent>
          </Card>
          <Card className='rounded-lg shadow-sm border-slate-200 hover:shadow-md transition-shadow'>
            <CardHeader className='text-left pb-3'>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              <Link
                href={`/${role}/mentorsDashboard/availability`}
                className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-full"><Calendar className="w-4 h-4 text-emerald-700" /></div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Manage Availability</p>
                    <p className="text-[10px] text-slate-400">Set your open slots</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
              </Link>

              <Link
                href={`/${role}/mentorsDashboard/sessions`}
                className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-full"><BookOpen className="w-4 h-4 text-orange-600" /></div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">View All Sessions</p>
                    <p className="text-[10px] text-slate-400">Upcoming & past sessions</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
              </Link>

              <Link
                href={`/${role}/mentorsDashboard/performance`}
                className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-full"><BarChart3 className="w-4 h-4 text-emerald-500" /></div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Performance Metrics</p>
                    <p className="text-[10px] text-slate-400">Ratings & session stats</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}