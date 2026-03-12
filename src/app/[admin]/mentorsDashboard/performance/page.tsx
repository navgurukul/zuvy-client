"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useMyMentorSessions } from "@/hooks/useMyMentorSessions"
import { useMyMentorSlots } from "@/hooks/useMyMentorSlots"

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

export default function PerformanceMetrics() {
  const { sessions, loading: sessionsLoading, error: sessionsError } = useMyMentorSessions()
  const { slots, loading: slotsLoading, error: slotsError } = useMyMentorSlots()

  const completedSessions = useMemo(
    () => sessions.filter((session) => session.sessionLifecycleState === "COMPLETED"),
    [sessions]
  )

  const upcomingSlots = useMemo(
    () => slots.filter((slot) => new Date(slot.slotStartDateTime) > new Date()),
    [slots]
  )

  const completionRate =
    sessions.length === 0
      ? 0
      : Math.round((completedSessions.length / sessions.length) * 100)

  const totalScheduledMinutes = useMemo(
    () => slots.reduce((sum, slot) => sum + slot.durationMinutes, 0),
    [slots]
  )

  const averageSessionLength =
    slots.length === 0 ? 0 : Math.round(totalScheduledMinutes / slots.length)

  const totalScheduledHours = totalScheduledMinutes / 60

  const recentCompleted = useMemo(
    () => completedSessions.slice(0, 5),
    [completedSessions]
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
        <Card>
          <CardContent className="p-5 text-left">
            <p className="text-2xl font-semibold">{completionRate}%</p>
            <p className="text-sm font-medium">Completion Rate</p>
            <p className="text-xs text-muted-foreground">
              {completedSessions.length} of {sessions.length} sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 text-left">
            <p className="text-2xl font-semibold">—</p>
            <p className="text-sm font-medium">Average Rating</p>
            <p className="text-xs text-muted-foreground">Feedback analytics pending API</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 text-left">
            <p className="text-2xl font-semibold">{totalScheduledHours.toFixed(1)}h</p>
            <p className="text-sm font-medium">Scheduled Hours</p>
            <p className="text-xs text-muted-foreground">Across {slots.length} slots</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 text-left">
            <p className="text-2xl font-semibold">{upcomingSlots.length}</p>
            <p className="text-sm font-medium">Upcoming Slots</p>
            <p className="text-xs text-muted-foreground">Booked + open upcoming schedule</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-left">Session Summary</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="font-semibold">{sessions.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>

              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="font-semibold">{completedSessions.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>

              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="font-semibold">{averageSessionLength}m</p>
                <p className="text-xs text-muted-foreground">Avg duration</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-left">
              {sessionsLoading && (
                <p className="text-xs text-muted-foreground">Loading session analytics...</p>
              )}
              {!sessionsLoading && sessionsError && (
                <p className="text-xs text-red-500">{sessionsError}</p>
              )}
              {!sessionsLoading && !sessionsError && sessions.length === 0 && (
                <p className="text-xs text-muted-foreground">No sessions yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-left">Recent Completed</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-left">
            {recentCompleted.length === 0 && (
              <p className="text-xs text-muted-foreground">No completed sessions yet.</p>
            )}

            {recentCompleted.map((session) => (
              <div key={session.id} className="rounded-lg border p-3">
                <p className="text-sm font-medium">Booking #{session.id}</p>
                <p className="text-xs text-muted-foreground">
                  Completed at: {formatDateTime(session.completedAt || session.joinedAt || "")}
                </p>
                <div className="flex text-green-500 mt-2">
                  <Star size={14} />
                  <Star size={14} />
                  <Star size={14} />
                  <Star size={14} />
                  <Star size={14} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-left">
            <p className="text-xl font-semibold">{upcomingSlots.length}</p>
            <p className="text-sm font-medium">Upcoming Slots</p>
            <p className="text-xs text-muted-foreground">Current future availability</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 text-left">
            <p className="text-xl font-semibold">{averageSessionLength}m</p>
            <p className="text-sm font-medium">Avg Slot Length</p>
            <p className="text-xs text-muted-foreground">Based on created slots</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 text-left">
            <p className="text-xl font-semibold">{slots.length}</p>
            <p className="text-sm font-medium">Total Slots</p>
            <p className="text-xs text-muted-foreground">{slotsLoading ? "Loading..." : "Fetched from /mentor-slots/my"}</p>
            {!slotsLoading && slotsError && (
              <p className="text-xs text-red-500 mt-1">{slotsError}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}