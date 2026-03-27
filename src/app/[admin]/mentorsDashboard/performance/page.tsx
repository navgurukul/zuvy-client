"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useMyMentorSessions } from "@/hooks/useMyMentorSessions"

const formatDateTime = (value?: string | null) => {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const formatCompletedDateTime = (value?: string | null) => {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const getSessionDurationMinutes = (slotStart?: string | null, slotEnd?: string | null) => {
  if (!slotStart || !slotEnd) return 0

  const start = new Date(slotStart)
  const end = new Date(slotEnd)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60)))
}

const getDisplayStudentName = (
  studentName?: string | null,
  studentUserName?: string | null,
  studentFullName?: string | null,
  learnerName?: string | null
) => {
  return studentName || studentFullName || studentUserName || learnerName || "Unknown Student"
}

const renderRatingStars = (rating?: number | null) => {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating || 0)))

  return (
    <div className="flex mt-2 gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={14}
          className={index < normalizedRating ? "text-green-500 fill-green-500" : "text-gray-300"}
        />
      ))}
    </div>
  )
}

export default function PerformanceMetrics() {
  const {
    sessions: allSessions,
    loading: allSessionsLoading,
    error: allSessionsError,
  } = useMyMentorSessions(true, "/mentor-sessions/mentor/my")

  const {
    sessions: completedSessions,
    loading: completedSessionsLoading,
    error: completedSessionsError,
  } = useMyMentorSessions(true, "/mentor-sessions/mentor/my", "completed")

  const {
    sessions: upcomingSlots,
    loading: upcomingSessionsLoading,
    error: upcomingSessionsError,
  } = useMyMentorSessions(true, "/mentor-sessions/mentor/my", "upcoming")

  const completionRate =
    allSessions.length === 0
      ? 0
      : Math.round((completedSessions.length / allSessions.length) * 100)

  const totalScheduledMinutes = useMemo(
    () =>
      allSessions.reduce(
        (sum, session) =>
          sum + getSessionDurationMinutes(session.slotStart, session.slotEnd),
        0
      ),
    [allSessions]
  )

  const averageSessionLength =
    allSessions.length === 0 ? 0 : Math.round(totalScheduledMinutes / allSessions.length)

  const totalScheduledHours = totalScheduledMinutes / 60

  const recentCompleted = useMemo(
    () =>
      [...completedSessions]
        .sort((a, b) => {
          const aTime = new Date(a.completedAt || a.slotEnd || a.slotStart || 0).getTime()
          const bTime = new Date(b.completedAt || b.slotEnd || b.slotStart || 0).getTime()

          return bTime - aTime
        }),
    [completedSessions]
  )

  const averageRating = useMemo(() => {
    const ratedSessions = completedSessions.filter(
      (session) => typeof session.mentorRating === "number"
    )

    if (ratedSessions.length === 0) return null

    const total = ratedSessions.reduce((sum, session) => sum + (session.mentorRating || 0), 0)

    return (total / ratedSessions.length).toFixed(1)
  }, [completedSessions])

  const sessionMix = useMemo(() => {
    const cancelled = allSessions.filter(
      (session) => session.sessionLifecycleState === "CANCELLED"
    ).length

    const reschedulePending = allSessions.filter(
      (session) => session.sessionLifecycleState === "RESCHEDULE_PENDING"
    ).length

    return [
      { label: "Completed", value: completedSessions.length, barClass: "bg-green-600" },
      { label: "Upcoming", value: upcomingSlots.length, barClass: "bg-emerald-400" },
      { label: "Cancelled", value: cancelled, barClass: "bg-gray-400" },
      { label: "Reschedule", value: reschedulePending, barClass: "bg-orange-400" },
    ]
  }, [allSessions, completedSessions.length, upcomingSlots.length])

  const maxSessionMixValue = useMemo(
    () => Math.max(1, ...sessionMix.map((item) => item.value)),
    [sessionMix]
  )

  return (
    <div className="p-6 min-h-screen">
      <div className="text-left mb-6">
        <h1 className="text-xl font-semibold">Performance Metrics</h1>
        <p className="text-sm text-muted-foreground">
          Your mentoring performance from live slot and session data
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className='rounded-3xl'>
          <CardContent className="p-5 text-left">
            <p className="text-2xl font-semibold">{completionRate}%</p>
            <p className="text-sm font-medium">Completion Rate</p>
            <p className="text-xs text-muted-foreground">
              {completedSessions.length} of {allSessions.length} sessions completed
            </p>
          </CardContent>
        </Card>

        <Card className='rounded-3xl'>
          <CardContent className="p-5 text-left">
            <p className="text-2xl font-semibold">{averageRating ? averageRating : "—"}</p>
            <p className="text-sm font-medium">Average Rating</p>
            <p className="text-xs text-muted-foreground">
              {averageRating
                ? "Across completed sessions with rating"
                : "No completed session rating available"}
            </p>
          </CardContent>
        </Card>

        <Card className='rounded-3xl'>
          <CardContent className="p-5 text-left">
            <p className="text-2xl font-semibold">{totalScheduledHours.toFixed(1)}h</p>
            <p className="text-sm font-medium">Scheduled Hours</p>
            <p className="text-xs text-muted-foreground">Across {allSessions.length} sessions</p>
          </CardContent>
        </Card>

        <Card className='rounded-3xl'>
          <CardContent className="p-5 text-left">
            <p className="text-2xl font-semibold">{upcomingSlots.length}</p>
            <p className="text-sm font-medium">Upcoming Slots</p>
            <p className="text-xs text-muted-foreground">Booked + open upcoming schedule</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className='rounded-3xl'>
          <CardHeader>
            <CardTitle className="text-base text-left">Session Summary</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-100 rounded-3xl p-3 text-center">
                <p className="font-semibold">{allSessions.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>

              <div className="bg-gray-100 rounded-3xl p-3 text-center">
                <p className="font-semibold">{completedSessions.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>

              <div className="bg-gray-100 rounded-3xl p-3 text-center">
                <p className="font-semibold">{averageSessionLength}m</p>
                <p className="text-xs text-muted-foreground">Avg duration</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border p-3">
              <p className="text-xs font-medium text-muted-foreground mb-3">Session Mix</p>
              <div className="space-y-3">
                {sessionMix.map((item) => (
                  <div key={item.label} className="grid grid-cols-[88px_1fr_32px] items-center gap-2">
                    <p className="text-xs text-muted-foreground text-left">{item.label}</p>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.barClass}`}
                        style={{ width: `${(item.value / maxSessionMixValue) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium text-right">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2 text-left">
              {(allSessionsLoading || completedSessionsLoading || upcomingSessionsLoading) && (
                <p className="text-xs text-muted-foreground">Loading session analytics...</p>
              )}
              {!allSessionsLoading && allSessionsError && (
                <p className="text-xs text-red-500">{allSessionsError}</p>
              )}
              {!completedSessionsLoading && completedSessionsError && (
                <p className="text-xs text-red-500">{completedSessionsError}</p>
              )}
              {!upcomingSessionsLoading && upcomingSessionsError && (
                <p className="text-xs text-red-500">{upcomingSessionsError}</p>
              )}
              {!allSessionsLoading && !allSessionsError && allSessions.length === 0 && (
                <p className="text-xs text-muted-foreground">No sessions yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-3xl'>
          <CardHeader>
            <CardTitle className="text-base text-left">Recently Completed</CardTitle>
          </CardHeader>

          <CardContent
            className={`space-y-3 text-left ${
              recentCompleted.length > 4 ? "max-h-[26rem] overflow-y-auto pr-1" : ""
            }`}
          >
            {recentCompleted.length === 0 && (
              <p className="text-xs text-muted-foreground">No completed sessions yet.</p>
            )}

            {recentCompleted.map((session) => (
              <div key={session.id} className="rounded-lg border p-3">
                <p className="text-sm font-medium">
                  {getDisplayStudentName(
                    session.studentName,
                    session.studentUserName,
                    session.studentFullName,
                    session.learnerName
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Date: {formatDateTime(session.completedAt || session.slotStart || session.slotEnd)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Completed at: {formatCompletedDateTime(session.completedAt || session.slotEnd)}
                </p>
                {session.mentorRating ? (
                  <p className="text-xs text-muted-foreground mt-1">Rating: {session.mentorRating}/5</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Rating: Not rated</p>
                )}
                {renderRatingStars(session.mentorRating)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className='rounded-3xl'>
          <CardContent className="p-5 text-left">
            <p className="text-xl font-semibold">{upcomingSlots.length}</p>
            <p className="text-sm font-medium">Upcoming Slots</p>
            <p className="text-xs text-muted-foreground">Current future availability</p>
          </CardContent>
        </Card>

        <Card className='rounded-3xl'>
          <CardContent className="p-5 text-left">
            <p className="text-xl font-semibold">{averageSessionLength}m</p>
            <p className="text-sm font-medium">Avg Slot Length</p>
            <p className="text-xs text-muted-foreground">Based on mentor sessions</p>
          </CardContent>
        </Card>

        <Card className='rounded-3xl'>
          <CardContent className="p-5 text-left">
            <p className="text-xl font-semibold">{allSessions.length}</p>
            <p className="text-sm font-medium">Total Sessions</p>
            <p className="text-xs text-muted-foreground">
              {(allSessionsLoading || completedSessionsLoading || upcomingSessionsLoading)
                ? "Loading..."
                : "Fetched from /mentor-sessions/mentor/my"}
            </p>
            {!allSessionsLoading && allSessionsError && (
              <p className="text-xs text-red-500 mt-1">{allSessionsError}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}