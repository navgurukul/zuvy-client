"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useMyMentorSessions } from "@/hooks/useMyMentorSessions"
import { useMentorMetrics } from "@/hooks/useMentorMetrics"
import { useStudentMentorFeedbacks } from "@/hooks/useStudentMentorFeedbacks"
import { PerformanceSkeleton } from "@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton"
import { Button } from "@/components/ui/button"

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

const renderRatingStars = (rating?: number | null) => {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating || 0)))

  return (
    <div className="flex mt-2 gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={14}
          className={index < normalizedRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  )
}

export default function PerformanceMetrics() {
  const {
    sessions: completedSessions,
    loading: completedSessionsLoading,
    error: completedSessionsError,
  } = useMyMentorSessions(true, "/instructor/mentor-sessions/my", "completed", "desc")

  const {
    metrics,
    loading: metricsLoading,
    error: metricsError,
  } = useMentorMetrics(true)

  const [feedbackFilter, setFeedbackFilter] = useState<"30days" | "3months" | "all">("30days")
  const {
    feedbacks,
    loading: feedbacksLoading,
    error: feedbacksError,
  } = useStudentMentorFeedbacks(feedbackFilter, true)

  const completionRate = Number(metrics?.sessions.completionRate) || 0
  const cancellationRate = Number(metrics?.sessions.cancellationRate) || 0
  const utilizationRate = Number(metrics?.utilization.utilizationRate) || 0

  const recentCompleted = completedSessions

  const averageRating = useMemo(() => {
    if (!metrics?.ratings.averageRating) return null
    return Number(metrics.ratings.averageRating).toFixed(1)
  }, [metrics?.ratings.averageRating])

  const sessionMix = useMemo(() => {
    const completedCount = Number(metrics?.sessions.completed) || 0
    const cancelledCount = Number(metrics?.sessions.cancelled) || 0
    const upcomingCount = Number(metrics?.upcomingSessions) || 0
    const missedCount = Number(metrics?.sessions.missed) || 0

    return [
      { label: "Completed", value: completedCount, barClass: "bg-green-600" },
      { label: "Upcoming", value: upcomingCount, barClass: "bg-emerald-400" },
      { label: "Cancelled", value: cancelledCount, barClass: "bg-gray-400" },
      { label: "Missed", value: missedCount, barClass: "bg-orange-400" },
    ]
  }, [metrics?.sessions.cancelled, metrics?.sessions.completed, metrics?.sessions.missed, metrics?.upcomingSessions])

  const maxSessionMixValue = useMemo(
    () => Math.max(1, ...sessionMix.map((item) => item.value)),
    [sessionMix]
  )

  const isInitialLoading =
    completedSessionsLoading &&
    metricsLoading &&
    completedSessions.length === 0

  return isInitialLoading ? (
    <PerformanceSkeleton />
  ) : (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
      <div className="text-left mb-6">
        <h1 className="text-lg font-semibold">Performance Metrics</h1>
        <p className="text-sm text-muted-foreground">
          Your mentoring performance from live slot and session data
        </p>
      </div>

      <div className="flex items-center gap-3">
        {[
          { value: "30days", label: "Last 30 days" },
          { value: "3months", label: "Last 3 months" },
          { value: "all", label: "All time" },
        ].map((item) => (
          <Button
            key={item.value}
            variant="outline"
            onClick={() =>
              setFeedbackFilter(item.value as "30days" | "3months" | "all")
            }
            //       className={`
            //   h-10 rounded-full px-5 text-sm
            //   ${feedbackFilter === item.value
            //           ? "border-slate-900 bg-white text-slate-900 font-semibold"
            //           : "border-slate-200 text-slate-500 hover:text-slate-900"
            //         }
            // `}
            className={`
  h-10 rounded-full px-5 text-sm
  ${feedbackFilter === item.value
                ? "border-slate-900 bg-white text-slate-900 font-semibold hover:bg-white hover:text-slate-900"
                : "border-slate-200 bg-white text-slate-500 hover:bg-white hover:text-slate-500"
              }
`}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"> */}
      <div className="grid gap-5 md:grid-cols-3 mb-8">
        <Card className='rounded-lg'>
          <CardContent className="p-6 text-left">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Completion Rate
            </p>

            <p className="text-3xl leading-none font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground mt-3">
              {Number(metrics?.sessions.completed) || 0} of {Number(metrics?.sessions.total) || 0} sessions completed
            </p>
          </CardContent>
        </Card>

        <Card className='rounded-lg'>
          <CardContent className="p-6 text-left">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Average Rating
            </p>

            <p className="text-3xl font-semibold">{averageRating ? averageRating : "—"}</p>
            {/* <p className="text-sm font-medium">Average Rating</p> */}
            <p className="text-xs text-muted-foreground">
              {averageRating
                ? "Across completed sessions with rating"
                : "No completed session rating available"}
            </p>
          </CardContent>
        </Card>

        <Card className='rounded-lg'>
          <CardContent className="p-6 text-left">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Utilization Rate
            </p>
            <p className="text-3xl leading-none font-bold">
              {utilizationRate}%
            </p>
            <div className="mt-5 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-green-800"
                style={{ width: `${utilizationRate}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {Number(metrics?.utilization.usedSlots) || 0} of{" "}
              {Number(metrics?.utilization.totalSlots) || 0} slots booked
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-1">
        <Card className="rounded-lg shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base text-left">Student Feedback</CardTitle>
          </CardHeader>
          <CardContent
            className={`space-y-3 text-left ${feedbacks.length > 4 ? "max-h-[26rem] overflow-y-auto pr-1" : ""
              }`}
          >
            {feedbacksLoading ? (
              <p className="text-xs text-muted-foreground">Loading feedback...</p>
            ) : feedbacksError ? (
              <p className="text-xs text-red-500">{feedbacksError}</p>
            ) : feedbacks.length === 0 ? (
              <p className="text-xs text-muted-foreground">No feedback received for this period.</p>
            ) : (
              feedbacks.map((entry) => {
                const nameLabel =
                  entry.studentName ||
                  entry.studentFullName ||
                  entry.studentUserName ||
                  entry.learnerName ||
                  "Student"

                const dateVal = entry.createdAt || entry.submittedAt || entry.date
                const feedbackText = entry.feedback || entry.notes || ""

                return (
                  <div key={entry.id || entry.bookingId} className="rounded-lg border p-3 bg-white space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{nameLabel}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Date: {formatDateTime(dateVal)}
                        </p>
                      </div>
                      {renderRatingStars(entry.studentRating)}
                    </div>
                    {feedbackText && (
                      <p className="text-xs text-slate-600 bg-slate-50/50 p-2 rounded italic mt-1 font-normal leading-normal">
                        &ldquo;{feedbackText}&rdquo;
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}