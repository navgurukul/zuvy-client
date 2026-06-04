"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar, Clock, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  useMyMentorSessions,
  type MyMentorSession,
  type SessionFilter,
} from "@/hooks/useMyMentorSessions"
import { useMentorSlotDetails } from "@/hooks/useMentorSlotDetails"
import { useRescheduleMentorSlotBooking } from "@/hooks/useRescheduleMentorSlotBooking"
import { useMarkMentorSlotAttendance } from "@/hooks/useMarkMentorSlotAttendance"
import { useCompleteMentorSlotSession } from "@/hooks/useCompleteMentorSlotSession"
import { useSubmitMentorSlotFeedback } from "@/hooks/useSubmitMentorSlotFeedback"
import { useMentorSlotRecording } from "@/hooks/useMentorSlotRecording"
import { SessionsSkeleton } from "@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton"
import { toast } from "@/components/ui/use-toast"

type SessionTab = "all" | "upcoming" | "reschedule" | "completed"

const formatDateTime = (value?: string | null) => {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const formatDateOnly = (value?: string | null) => {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const formatTimeOnly = (value?: string | null) => {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

const formatTimeRange = (start?: string | null, end?: string | null) => {
  const startTime = formatTimeOnly(start)
  const endTime = formatTimeOnly(end)

  if (startTime === "-" && endTime === "-") return "-"
  if (startTime === "-") return endTime
  if (endTime === "-") return startTime

  return `${startTime} - ${endTime}`
}

const parseDateValue = (value?: string | null) => {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date
}

const isJoinWindowOpen = (
  slotStart?: string | null,
  slotEnd?: string | null,
  nowTimestamp: number = Date.now()
) => {
  const startDate = parseDateValue(slotStart)
  if (!startDate) return false

  const tenMinutesBeforeStart = startDate.getTime() - 10 * 60 * 1000
  const endDate = parseDateValue(slotEnd)

  if (!endDate) {
    return nowTimestamp >= tenMinutesBeforeStart
  }

  return nowTimestamp >= tenMinutesBeforeStart && nowTimestamp <= endDate.getTime()
}

const getRescheduleStatus = (session: MyMentorSession) => {
  const maybeSession = session as MyMentorSession & {
    rescheduleStatus?: string | null
  }

  return maybeSession.rescheduleStatus || ""
}

const isCancelledValue = (value?: string | null) => {
  if (!value) return false
  const normalized = value.toLowerCase()
  return normalized === "cancelled" || normalized === "canceled"
}

const isMissedValue = (value?: string | null) => {
  if (!value) return false
  return value.toLowerCase() === "missed"
}

const isUpcomingValue = (value?: string | null) => {
  if (!value) return false
  const normalized = value.toLowerCase()
  return normalized === "scheduled" || normalized === "upcoming"
}

const isRescheduleValue = (value?: string | null) => {
  if (!value) return false
  return value.toLowerCase().includes("reschedule")
}

const getSessionStatusBadge = (session: MyMentorSession) => {
  const lifecycle = (session.sessionLifecycleState || "").toLowerCase()
  const status = (session.status || "").toLowerCase()
  const hasReschedule = Boolean(getRescheduleStatus(session))

  if (isCancelledValue(status) || isCancelledValue(lifecycle)) {
    return {
      label: "Cancelled",
      className: "border-gray-300 bg-gray-100 text-gray-600",
    }
  }

  if (isMissedValue(status) || isMissedValue(lifecycle)) {
    return {
      label: "Missed",
      className: "border-gray-300 bg-gray-100 text-gray-600",
    }
  }

  if (lifecycle === "completed") {
    return {
      label: "Completed",
      className: "border-green-600/30 bg-green-50 text-green-700",
    }
  }

  if (hasReschedule) {
    return {
      label: "Action needed",
      className: "border-orange-500/30 bg-orange-50 text-orange-600",
    }
  }

  return {
    label: "Upcoming",
    className: "border-blue-300 bg-blue-50 text-blue-600",
  }
}

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<SessionTab>("all")
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [joinedAt, setJoinedAt] = useState("")
  const [leftAt, setLeftAt] = useState("")
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now())

  const [feedbackDrafts, setFeedbackDrafts] = useState<
    Record<number, { rating: string; notes: string; areasOfImprovement: string }>
  >({})
  const [locallySubmittedBookingIds, setLocallySubmittedBookingIds] = useState<
    Record<number, true>
  >({})

  const { counts } = useMyMentorSessions(
    true,
    "/instructor/mentor-sessions/my",
    "all"
  )

  const summaryCounts = {
    total: Number(counts.total) || 0,
    upcoming: Number(counts.upcoming) || 0,
    reschedule: Number(counts.reschedule) || 0,
    completed: Number(counts.completed) || 0,
  }

  const {
    sessions: apiSessions,
    loading,
    error,
    refetchMySessions,
  } = useMyMentorSessions(true, "/instructor/mentor-sessions/my", activeTab as SessionFilter)

  const sessions = apiSessions

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTimestamp(Date.now())
    }, 30 * 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (sessions.length === 0) {
      setSelectedBookingId(null)
      return
    }

    const selectedStillExists = sessions.some((session) => session.id === selectedBookingId)
    if (selectedBookingId === null || !selectedStillExists) {
      setSelectedBookingId(sessions[0].id)
    }
  }, [sessions, selectedBookingId])

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedBookingId) || sessions[0] || null,
    [sessions, selectedBookingId]
  )

  const { recordingUrl: completedRecordingUrl } = useMentorSlotRecording(
    selectedSession?.id,
    Boolean(selectedSession && selectedSession.sessionLifecycleState === "COMPLETED"),
    "instructor"
  )

  const isReadOnlySession = Boolean(
    selectedSession &&
      (isCancelledValue(selectedSession.status) ||
        isCancelledValue(selectedSession.sessionLifecycleState) ||
        isMissedValue(selectedSession.status) ||
        isMissedValue(selectedSession.sessionLifecycleState))
  )

  const isUpcomingSession = Boolean(
    selectedSession &&
      (activeTab === "upcoming" ||
        isUpcomingValue(selectedSession.status) ||
        isUpcomingValue(selectedSession.sessionLifecycleState))
  )

  const isRescheduleTab = activeTab === "reschedule"
  const hasRescheduleRequest = Boolean(
    selectedSession &&
      (getRescheduleStatus(selectedSession) ||
        isRescheduleValue(selectedSession.status) ||
        isRescheduleValue(selectedSession.sessionLifecycleState))
  )

  const canJoinSelectedSession = Boolean(
    selectedSession?.meetingLink?.trim() &&
    isJoinWindowOpen(selectedSession?.slotStart, selectedSession?.slotEnd, nowTimestamp)
  )

  const selectedDisplayName = selectedSession
    ? selectedSession.studentName || selectedSession.studentUserName || `Student #${selectedSession.studentUserId ?? "-"}`
    : ""

  const selectedInitials = selectedDisplayName
    .replace(/\s+/g, "")
    .slice(0, 2)
    .toUpperCase() || "S"

  const selectedCourseLabel =
    (selectedSession as any)?.courseName || (selectedSession as any)?.moduleName || ""

  const selectedSlotId = selectedSession?.slotAvailabilityId

  const {
    details,
    loading: slotDetailsLoading,
    error: slotDetailsError,
    refetchSlotDetails,
  } = useMentorSlotDetails(selectedSlotId, Boolean(selectedSlotId))

  const selectedSlotBooking = useMemo(() => {
    if (!selectedBookingId || !details?.bookings?.length) return null
    return details.bookings.find((booking) => booking.id === selectedBookingId) || null
  }, [details, selectedBookingId])

  const backendFeedbackSubmitted = useMemo(() => {
    if (!selectedSlotBooking) return false

    const mentorFeedback = selectedSlotBooking.mentorFeedback
    const hasNotes = typeof mentorFeedback?.notes === "string" && mentorFeedback.notes.trim().length > 0
    const hasAreas =
      typeof mentorFeedback?.areasOfImprovement === "string" &&
      mentorFeedback.areasOfImprovement.trim().length > 0
    const hasRating =
      typeof selectedSlotBooking.mentorRating === "number" &&
      Number.isFinite(selectedSlotBooking.mentorRating)

    return Boolean(
      selectedSlotBooking.mentorFeedbackSubmittedAt ||
      selectedSlotBooking.mentorFeedbackLocked ||
      hasNotes ||
      hasAreas ||
      hasRating
    )
  }, [selectedSlotBooking])

  const isAlreadySubmitted =
    (selectedBookingId ? locallySubmittedBookingIds[selectedBookingId] : undefined) ||
    backendFeedbackSubmitted

  const currentFeedbackDraft = selectedBookingId
    ? feedbackDrafts[selectedBookingId] || {
      rating: "",
      notes: "",
      areasOfImprovement: "",
    }
    : {
      rating: "",
      notes: "",
      areasOfImprovement: "",
    }

  useEffect(() => {
    if (!selectedBookingId) return

    setFeedbackDrafts((prev) => {
      const existingDraft = prev[selectedBookingId]

      if (!backendFeedbackSubmitted) {
        if (existingDraft) return prev

        return {
          ...prev,
          [selectedBookingId]: {
            rating: "",
            notes: "",
            areasOfImprovement: "",
          },
        }
      }

      const mentorFeedback = selectedSlotBooking?.mentorFeedback
      const nextDraft = {
        rating:
          typeof selectedSlotBooking?.mentorRating === "number" &&
            Number.isFinite(selectedSlotBooking.mentorRating)
            ? String(selectedSlotBooking.mentorRating)
            : "",
        notes: mentorFeedback?.notes || "",
        areasOfImprovement: mentorFeedback?.areasOfImprovement || "",
      }

      if (
        existingDraft?.rating === nextDraft.rating &&
        existingDraft?.notes === nextDraft.notes &&
        existingDraft?.areasOfImprovement === nextDraft.areasOfImprovement
      ) {
        return prev
      }

      return {
        ...prev,
        [selectedBookingId]: nextDraft,
      }
    })
  }, [selectedBookingId, selectedSlotBooking, backendFeedbackSubmitted])

  const updateFeedbackDraft = (
    field: "rating" | "notes" | "areasOfImprovement",
    value: string
  ) => {
    if (!selectedBookingId) return

    setFeedbackDrafts((prev) => ({
      ...prev,
      [selectedBookingId]: {
        rating: prev[selectedBookingId]?.rating || "",
        notes: prev[selectedBookingId]?.notes || "",
        areasOfImprovement: prev[selectedBookingId]?.areasOfImprovement || "",
        [field]: value,
      },
    }))
  }

  const {
    isRescheduling,
    error: rescheduleError,
    responseData: rescheduleResponse,
    acceptReschedule,
    declineReschedule,
  } = useRescheduleMentorSlotBooking()

  const {
    isMarkingAttendance,
    error: attendanceError,
    attendanceData,
    markAttendance,
  } = useMarkMentorSlotAttendance()

  const {
    isCompleting,
    error: completeError,
    completionData,
    completeSession,
  } = useCompleteMentorSlotSession()

  const {
    isSubmittingFeedback,
    error: feedbackError,
    feedbackData,
    submitFeedback,
  } = useSubmitMentorSlotFeedback()

  useEffect(() => {
    if (!feedbackError) return

    toast.error({
      title: "Feedback submission failed",
      description: feedbackError,
    })
  }, [feedbackError])

  const handleAcceptReschedule = async () => {
    if (!selectedSession) return

    const ok = await acceptReschedule(selectedSession.id)
    if (ok) {
      toast.success({
        title: "Reschedule accepted",
        description:
          (typeof rescheduleResponse?.message === "string" && rescheduleResponse.message) ||
          "Reschedule request accepted successfully.",
      })
      await refetchMySessions()
      await refetchSlotDetails()
    }
  }

  const handleDeclineReschedule = async () => {
    if (!selectedSession) return

    const ok = await declineReschedule(selectedSession.id)
    if (ok) {
      toast.success({
        title: "Reschedule declined",
        description:
          (typeof rescheduleResponse?.message === "string" && rescheduleResponse.message) ||
          "Reschedule request declined successfully.",
      })
      await refetchMySessions()
      await refetchSlotDetails()
    }
  }

  const handleMarkAttendance = async () => {
    if (!selectedSession || !joinedAt || !leftAt) return

    const ok = await markAttendance(selectedSession.id, {
      joinedAt: new Date(joinedAt).toISOString(),
      leftAt: new Date(leftAt).toISOString(),
    })

    if (ok) {
      await refetchMySessions()
      await refetchSlotDetails()
    }
  }

  const handleCompleteSession = async () => {
    if (!selectedSession) return

    const ok = await completeSession(selectedSession.id)
    if (ok) {
      await refetchMySessions()
    }
  }

  const handleSubmitFeedback = async () => {
    if (!selectedSession || isAlreadySubmitted) return

    const numericRating = Number(currentFeedbackDraft.rating)
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) return

    const ok = await submitFeedback(selectedSession.id, {
      feedback: {
        notes: currentFeedbackDraft.notes,
        areasOfImprovement: currentFeedbackDraft.areasOfImprovement,
      },
      rating: numericRating,
    })

    if (ok) {
      setLocallySubmittedBookingIds((prev) => ({
        ...prev,
        [selectedSession.id]: true,
      }))
      toast.success({
        title: "Feedback submitted successfully",
        description:
          (typeof feedbackData?.message === "string" && feedbackData.message) ||
          "Your feedback has been submitted successfully.",
      })
      await refetchMySessions()
      await refetchSlotDetails()
    }
  }

  useEffect(() => {
    if (!rescheduleError) return

    toast.error({
      title: "Reschedule action failed",
      description: rescheduleError,
    })
  }, [rescheduleError])

  const isInitialLoading = loading && sessions.length === 0
  const showGlobalEmptyState = !loading && sessions.length === 0

  return isInitialLoading ? (
    <SessionsSkeleton />
  ) : (
    // <div className="p-6">
    // <div className="mb-6 text-left">

        <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">

      <div className="mb-4 text-left">
        <h1 className="text-lg font-semibold">Sessions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your mentoring sessions and session lifecycle actions
        </p>
      </div>

      <div className="mb-4 flex items-center gap-6  text-sm">
        <button
          onClick={() => {
            setActiveTab("all")
            setSelectedBookingId(null)
          }}
          className={`relative flex items-center gap-2 pb-2.5 ${
            activeTab === "all"
              ? "font-medium text-[#111827]"
              : "font-normal text-[#6b7280] hover:text-[#111827]"
          }`}
        >
          <span>All</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f3f4f6] px-1.5 text-[11px] font-medium text-[#6b7280]">
            {Number(summaryCounts.total) || 0}
          </span>
          {activeTab === "all" && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#111827]" />}
        </button>

        <button
          onClick={() => {
            setActiveTab("upcoming")
            setSelectedBookingId(null)
          }}
          className={`relative flex items-center gap-2 pb-2.5 ${
            activeTab === "upcoming"
              ? "font-medium text-[#111827]"
              : "font-normal text-[#6b7280] hover:text-[#111827]"
          }`}
        >
          <span>Upcoming</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f3f4f6] px-1.5 text-[11px] font-medium text-[#6b7280]">
            {Number(summaryCounts.upcoming) || 0}
          </span>
          {activeTab === "upcoming" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#111827]" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("reschedule")
            setSelectedBookingId(null)
          }}
          className={`relative flex items-center gap-2 pb-2.5 ${
            activeTab === "reschedule"
              ? "font-medium text-[#111827]"
              : "font-normal text-[#6b7280] hover:text-[#111827]"
          }`}
        >
          <span>Action Needed</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f59e0b] px-1.5 text-[11px] font-medium text-white">
            {Number(summaryCounts.reschedule) || 0}
          </span>
          {activeTab === "reschedule" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#111827]" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("completed")
            setSelectedBookingId(null)
          }}
          className={`relative flex items-center gap-2 pb-2.5 ${
            activeTab === "completed"
              ? "font-medium text-[#111827]"
              : "font-normal text-[#6b7280] hover:text-[#111827]"
          }`}
        >
          <span>Completed</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f3f4f6] px-1.5 text-[11px] font-medium text-[#6b7280]">
            {Number(summaryCounts.completed) || 0}
          </span>
          {activeTab === "completed" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#111827]" />
          )}
        </button>

        <button className="relative flex items-center gap-2 pb-2.5 font-normal text-[#6b7280]">
          <span>Cancelled</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f3f4f6] px-1.5 text-[11px] font-medium text-[#6b7280]">
            0
          </span>
        </button>
      </div>
      <div className="border-b border-gray-200"></div>
      {showGlobalEmptyState ? (
        <div className="flex h-full justify-center pt-20 px-6 text-center">
          <div className="max-w-sm">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-[#d1d5db] bg-[#fafafa">
              <Calendar size={16} className="text-[#9ca3af]" />
            </div>
            

            <p className="text-sm text-gray-400 sm:whitespace-nowrap">
              No sessions yet. Sessions will appear here once students book your open slots.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-[720px] overflow-hidden">
          <div className="flex w-[410px] flex-col border-r border-[#e5e7eb]">
            <div className="flex-1 space-y-0 overflow-y-auto p-0">
              {loading && <p className="text-sm text-muted-foreground">Loading sessions...</p>}
              {!loading && error && <p className="text-sm text-red-500">{error}</p>}
              {!loading && !error && sessions.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No sessions found for this tab.</p>
              )}

              {!loading &&
                !error &&
                sessions.map((session) => {
                  const isSelected = selectedBookingId === session.id
                  const rescheduleStatus = getRescheduleStatus(session)
                  const statusBadge = getSessionStatusBadge(session)
                  const displayName =
                    session.studentName || session.studentUserName || `Student #${session.studentUserId ?? "-"}`
                  const initials =
                    displayName
                      .replace(/\s+/g, "")
                      .slice(0, 2)
                      .toUpperCase() || "S"

                  return (
                    <button
                      key={session.id}
                      onClick={() => setSelectedBookingId(session.id)}
                      className={`w-full border-b border-[#e5e7eb] p-4 text-left transition ${
                        isSelected ? "bg-[#f4faf4]" : "bg-white hover:bg-[#fafafa]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e5efe7] text-xs font-semibold text-[#4b6b50]">
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="mb-1 truncate text-[15px] font-semibold text-[#1f2937]">
                            {displayName}
                          </p>
                          <p className="truncate text-xs text-[#9ca3af]">
                            {formatDateOnly(session.slotStart || session.slotEnd)} · {formatTimeRange(session.slotStart, session.slotEnd)}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {/* <Badge className="bg-gray-100 text-gray-600">{session.status}</Badge> */}
                            {/* <Badge className="bg-blue-100 text-blue-700">
                              {session.sessionLifecycleState}
                            </Badge>
                            {rescheduleStatus && (
                              <Badge className="bg-orange-100 text-orange-700">
                                Reschedule: {rescheduleStatus}
                              </Badge>
                            )} */}
                          </div>
                        </div>

                        <Badge
                          className={`mt-1 flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </button>
                  )
                })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-0">
            {selectedSession ? (
              <div className="space-y-0">
                <div className="p-4 text-left">
                  <div className="flex items-start justify-between gap-3 border-b pb-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#e5efe7] text-xs font-semibold text-[#4b6b50]">
                        {selectedInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {selectedDisplayName}
                        </p>
                        {selectedCourseLabel && (
                          <p className="truncate text-xs text-muted-foreground">{selectedCourseLabel}</p>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getSessionStatusBadge(selectedSession).className}`}
                    >
                      {getSessionStatusBadge(selectedSession).label}
                    </Badge>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                      <p className="text-[11px] font-semibold tracking-wide text-gray-500">DATE</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDateOnly(selectedSession.slotStart || selectedSession.slotEnd)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-wide text-gray-500">TIME</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatTimeRange(selectedSession.slotStart, selectedSession.slotEnd)}
                      </p>
                    </div>
                  </div>

                  {/* <div className="mt-5 flex flex-wrap gap-2">
                    <Badge className="bg-gray-100 text-gray-600">{selectedSession.status}</Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      {selectedSession.sessionLifecycleState}
                    </Badge>
                  </div> */}

                  {!isRescheduleTab && !hasRescheduleRequest && selectedSession.sessionLifecycleState !== "COMPLETED" && !isReadOnlySession && selectedSession.meetingLink && !canJoinSelectedSession && (
                  <p className="text-xs text-muted-foreground pt-4 pb-2">
                    Join opens 10 min before start
                  </p>
                )}

                  {!isRescheduleTab && !hasRescheduleRequest && selectedSession.sessionLifecycleState !== "COMPLETED" && !isReadOnlySession && (
                  selectedSession.meetingLink ? (
                    <Button
                      type="button"
                      className="bg-green-700 hover:bg-green-800"
                      asChild={canJoinSelectedSession}
                      disabled={!canJoinSelectedSession}
                    >
                      {canJoinSelectedSession ? (
                        <a
                          href={selectedSession.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video size={16} className="mr-2" />
                          Join the Session
                        </a>
                      ) : (
                        <>
                          <Video size={16} className="mr-2" />
                          Join the Session
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button type="button" className="bg-green-700 hover:bg-green-800" disabled>
                      <Video size={16} className="mr-2" />
                      Join unavailable
                    </Button>
                  )
                )}

                  {selectedSession.sessionLifecycleState === "COMPLETED" && completedRecordingUrl && (
                    <a
                      href={completedRecordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      View Recording
                    </a>
                  )}
                </div>

                {/* {!isRescheduleTab && !hasRescheduleRequest && (
                  <div className="space-y-2 l border-b p-4 text-left">
                    <p className="text-base font-semibold">Slot & Bookings</p>
                    {slotDetailsLoading && (
                      <p className="text-sm text-muted-foreground">Loading slot details...</p>
                    )}
                    {!slotDetailsLoading && slotDetailsError && (
                      <p className="text-sm text-red-500">{slotDetailsError}</p>
                    )}
                    {!slotDetailsLoading && !slotDetailsError && details?.slot && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <Calendar size={12} />
                            {formatDateOnly(
                              (details.slot.slotStartDateTime as string) ||
                                (details.slot.slotEndDateTime as string)
                            )}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <Clock size={12} />
                            {formatTimeRange(
                              details.slot.slotStartDateTime as string,
                              details.slot.slotEndDateTime as string
                            )}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total bookings: {details.bookings.length}
                        </p>
                      </>
                    )}
                  </div>
                )} */}

                {(isRescheduleTab || hasRescheduleRequest) && (
                  <div className="space-y-3  px-4 py-0 text-left ">
                    <p className="text-sm font-semibold">Reschedule Request</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="bg-green-700 hover:bg-green-800"
                        onClick={handleAcceptReschedule}
                        disabled={isRescheduling}
                      >
                        {isRescheduling ? "Please wait..." : "Accept Reschedule"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDeclineReschedule}
                        disabled={isRescheduling}
                      >
                        Decline Reschedule
                      </Button>
                    </div>
                  </div> 
                )}

                {!isRescheduleTab && !hasRescheduleRequest && !isUpcomingSession && selectedSession.sessionLifecycleState !== "COMPLETED" && !isReadOnlySession && (
                  <div className="space-y-3 rounded-xl border p-4 text-left">
                    <p className="text-base font-semibold">Mark Attendance</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Joined At</p>
                        <Input
                          type="datetime-local"
                          value={joinedAt}
                          onChange={(event) => setJoinedAt(event.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Left At</p>
                        <Input
                          type="datetime-local"
                          value={leftAt}
                          onChange={(event) => setLeftAt(event.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="bg-green-700 hover:bg-green-800"
                      onClick={handleMarkAttendance}
                      disabled={isMarkingAttendance || !joinedAt || !leftAt}
                    >
                      {isMarkingAttendance ? "Saving..." : "Mark Attendance"}
                    </Button>
                    {attendanceError && <p className="text-sm text-red-500">{attendanceError}</p>}
                    {attendanceData?.message && (
                      <p className="text-sm text-green-700">{attendanceData.message}</p>
                    )}
                  </div>
                )}

                {!isRescheduleTab && !hasRescheduleRequest && !isUpcomingSession && selectedSession.sessionLifecycleState !== "COMPLETED" && !isReadOnlySession && (
                  <div className="space-y-3 rounded-xl border p-4 text-left">
                    <p className="text-base font-semibold">Complete Session</p>
                    <Button
                      type="button"
                      className="bg-green-700 hover:bg-green-800"
                      onClick={handleCompleteSession}
                      disabled={isCompleting}
                    >
                      {isCompleting ? "Completing..." : "Complete Session"}
                    </Button>
                    {completeError && <p className="text-sm text-red-500">{completeError}</p>}
                    {completionData?.message && (
                      <p className="text-sm text-green-700">{completionData.message}</p>
                    )}
                  </div>
                )}

                {!isRescheduleTab && !hasRescheduleRequest && !isUpcomingSession && !isReadOnlySession && (
                  <div className="space-y-3 px-4 py-0 text-left">
                    <p className="text-base font-semibold">Submit Feedback</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1 sm:col-span-1">
                        <p className="text-sm text-muted-foreground">Rating (1-5)</p>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={currentFeedbackDraft.rating}
                          onChange={(event) => updateFeedbackDraft("rating", event.target.value)}
                          disabled={isAlreadySubmitted}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <Textarea
                          value={currentFeedbackDraft.notes}
                          onChange={(event) => updateFeedbackDraft("notes", event.target.value)}
                          disabled={isAlreadySubmitted}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Areas of Improvement</p>
                      <Textarea
                        value={currentFeedbackDraft.areasOfImprovement}
                        onChange={(event) =>
                          updateFeedbackDraft("areasOfImprovement", event.target.value)
                        }
                        disabled={isAlreadySubmitted}
                      />
                    </div>
                    <Button
                      type="button"
                      className="bg-green-700 hover:bg-green-800"
                      onClick={handleSubmitFeedback}
                      disabled={
                        isAlreadySubmitted ||
                        isSubmittingFeedback ||
                        Number(currentFeedbackDraft.rating) < 1 ||
                        Number(currentFeedbackDraft.rating) > 5
                      }
                    >
                      {isAlreadySubmitted
                        ? "Feedback Submitted"
                        : isSubmittingFeedback
                          ? "Submitting..."
                          : "Submit Feedback"}
                    </Button>
                    {feedbackError && <p className="text-sm text-red-500">{feedbackError}</p>}
                    {feedbackData?.message && (
                      <p className="text-sm text-green-700">{feedbackData.message}</p>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}