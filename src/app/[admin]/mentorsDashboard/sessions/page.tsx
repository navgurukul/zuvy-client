"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar, Clock, Loader2, PlayCircle, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  useMyMentorSessions,
  type MentorSessionCardActions,
  type MentorSessionDisplayState,
  type MyMentorSession,
  type SessionFilter,
} from "@/hooks/useMyMentorSessions"
import { useMentorSlotDetails } from "@/app/[admin]/hooks/useMentorSlotDetails"
import { useRescheduleMentorSlotBooking } from "@/hooks/useRescheduleMentorSlotBooking"
import { useMarkMentorSlotAttendance } from "@/app/[admin]/hooks/useMarkMentorSlotAttendance"
import { useCompleteMentorSlotSession } from "@/app/[admin]/hooks/useCompleteMentorSlotSession"
import { useSubmitMentorSlotFeedback } from "@/app/[admin]/hooks/useSubmitMentorSlotFeedback"
import { useCancelMentorSlotBooking } from "@/app/student/hooks/useCancelMentorSlotBooking"
import { useMentorJoinLink } from "@/app/[admin]/hooks/useMentorJoinLink"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SessionsSkeleton } from "@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton"
import { toast } from "@/components/ui/use-toast"
import {
  formatDateOnly,
  formatTimeRange,
  isJoinWindowOpen,
} from "@/utils/sessionDateTime"

type SessionTab = "all" | "upcoming" | "reschedule" | "completed" | "cancelled"

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

// Fallback for the API's `rules.joinOpenMinutes`
const DEFAULT_JOIN_OPEN_MINUTES = 10
const MIN_CANCEL_REASON_LENGTH = 10

// e.g. "Fri, 6 Nov 2026"
const formatPanelDate = (value?: string | null) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  const weekday = date.toLocaleDateString("en-GB", { weekday: "short" })
  const rest = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  return `${weekday}, ${rest}`
}

// e.g. "20 Nov"
const formatDayMonth = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

// The instructor API sends the mentor's card actions (acceptReschedule, declineReschedule, ...)
const getMentorActions = (session?: MyMentorSession | null) =>
  session?.actions as unknown as MentorSessionCardActions | undefined

// ...and the mentor's displayState (UPCOMING | STARTING_SOON | IN_PROGRESS | ACTION_NEEDED | COMPLETED | MISSED | CANCELLED)
const getMentorDisplayState = (session?: MyMentorSession | null) =>
  session?.displayState as MentorSessionDisplayState | undefined

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

const UPCOMING_BADGE = {
  label: "Upcoming",
  className: "border-info/30 bg-info/5 text-info-dark hover:border-info/30 hover:bg-info/5 hover:text-info-dark hover:opacity-100",
}

const getSessionStatusBadge = (session: MyMentorSession) => {
  // displayState from GET /instructor/mentor-sessions/my
  const displayState = getMentorDisplayState(session)
  if (displayState === "UPCOMING" || displayState === "STARTING_SOON" || displayState === "IN_PROGRESS") {
    return UPCOMING_BADGE
  }

  const lifecycle = (session.sessionLifecycleState || "").toLowerCase()
  const status = (session.status || "").toLowerCase()
  const hasReschedule = displayState
    ? displayState === "ACTION_NEEDED"
    : Boolean(getRescheduleStatus(session))

  if (displayState === "CANCELLED" || isCancelledValue(status) || isCancelledValue(lifecycle)) {
    return {
      label: "Cancelled",
      className: "border-border bg-muted/50 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-muted-foreground hover:opacity-100",
    }
  }

  if (displayState === "MISSED" || isMissedValue(status) || isMissedValue(lifecycle)) {
    return {
      label: "Missed",
      className: "border-border bg-muted/50 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-muted-foreground hover:opacity-100",
    }
  }

  if (displayState === "COMPLETED" || lifecycle === "completed") {
    return {
      label: "Completed",
      className: "border-success/30 bg-success/5 text-success-dark hover:border-success/30 hover:bg-success/5 hover:text-success-dark hover:opacity-100",
    }
  }

  if (hasReschedule) {
    return {
      label: "Action needed",
      className: "border-warning/40 bg-warning/5 text-warning-dark hover:border-warning/40 hover:bg-warning/5 hover:text-warning-dark hover:opacity-100",
    }
  }

  return UPCOMING_BADGE
}

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<SessionTab>("all")
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  // const [joinedAt, setJoinedAt] = useState("")
  // const [leftAt, setLeftAt] = useState("")
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now())
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  const [feedbackDrafts, setFeedbackDrafts] = useState<
    Record<number, { rating: string; notes: string; areasOfImprovement: string }>
  >({})
  const [locallySubmittedBookingIds, setLocallySubmittedBookingIds] = useState<
    Record<number, true>
  >({})

  const {
    sessions: apiSessions,
    loading,
    error,
    refetchMySessions,
    counts,
    rules,
  } = useMyMentorSessions(true, "/instructor/mentor-sessions/my", activeTab as SessionFilter)
  // From the backend (GET /instructor/mentor-sessions/my -> rules.noticeHours)
  const noticeHours = rules?.noticeHours
  const joinOpenMinutes = rules?.joinOpenMinutes ?? DEFAULT_JOIN_OPEN_MINUTES

  const summaryCounts = {
    total: Number(counts.total) || 0,
    upcoming: Number(counts.upcoming) || 0,
    reschedule: Number(counts.actionNeeded ?? counts.reschedule) || 0,
    completed: Number(counts.completed) || 0,
    cancelled: Number(counts.cancelled) || 0,
  }

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

  const selectedActions = getMentorActions(selectedSession)
  // The card's line from the backend ("The recording is ready.", "You can cancel until ...", ...)
  const selectedMessage = selectedSession?.message?.trim() || ""
  const isCompletedSession = Boolean(
    selectedSession &&
    (getMentorDisplayState(selectedSession) === "COMPLETED" || selectedSession.sessionLifecycleState === "COMPLETED")
  )
  const completedRecordingUrl =
    selectedActions?.viewRecording?.url || selectedSession?.recording?.url || null
  const canViewRecording = Boolean(
    completedRecordingUrl &&
    (selectedSession?.recording?.state === "READY" || selectedActions?.viewRecording?.allowed)
  )

  const isReadOnlySession = Boolean(
    selectedSession &&
    (isCancelledValue(selectedSession.status) ||
      isCancelledValue(selectedSession.sessionLifecycleState) ||
      isMissedValue(selectedSession.status) ||
      isMissedValue(selectedSession.sessionLifecycleState))
  )

  const isUpcomingSession = useMemo(() => {
    if (!selectedSession) return false
    if (activeTab === "upcoming") return true
    if (activeTab === "completed" || activeTab === "cancelled" || activeTab === "reschedule") return false

    const isCompletedOrCancelled =
      selectedSession.sessionLifecycleState === "COMPLETED" ||
      selectedSession.sessionLifecycleState === "CANCELLED" ||
      selectedSession.status === "cancelled"

    const isFuture = selectedSession.slotStart
      ? new Date(selectedSession.slotStart).getTime() > nowTimestamp
      : false

    return !isCompletedOrCancelled && isFuture
  }, [selectedSession, activeTab, nowTimestamp])

  const isRescheduleTab = activeTab === "reschedule"
  const hasRescheduleRequest = Boolean(
    selectedSession &&
    (getMentorDisplayState(selectedSession)
      ? getMentorDisplayState(selectedSession) === "ACTION_NEEDED"
      : getRescheduleStatus(selectedSession) ||
        isRescheduleValue(selectedSession.status) ||
        isRescheduleValue(selectedSession.sessionLifecycleState))
  )

  // With `actions` the backend decides (it knows about Zoom and Google meetings); else the saved link + time window
  const hasJoinTarget = Boolean(selectedActions?.join || selectedSession?.meetingLink?.trim())
  const canJoinSelectedSession = selectedActions?.join
    ? selectedActions.join.allowed
    : Boolean(
        selectedSession?.meetingLink?.trim() &&
        isJoinWindowOpen(selectedSession?.slotStart, selectedSession?.slotEnd, nowTimestamp)
      )

  const { isFetchingJoinLink, getJoinLink } = useMentorJoinLink()

  const handleJoinSession = async () => {
    if (!selectedSession) return
    // Open the tab now (inside the click) so pop-up blockers allow it, then point it at the link
    const joinWindow = window.open("", "_blank")
    const { data, error: joinError } = await getJoinLink(selectedSession.id)
    const url = data?.url || data?.joinLink || null

    if (!url) {
      joinWindow?.close()
      toast.error({
        title: "Can't join the session",
        description: joinError || "Could not get the join link",
      })
      return
    }

    if (joinWindow) {
      joinWindow.opener = null
      joinWindow.location.href = url
    } else {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  const selectedDisplayName = selectedSession
    ? selectedSession.studentName || selectedSession.studentUserName || `Student #${selectedSession.studentUserId ?? "-"}`
    : ""

  const selectedInitials = selectedDisplayName
    .replace(/\s+/g, "")
    .slice(0, 2)
    .toUpperCase() || "S"

  // e.g. "React Bootcamp · Batch A"
  const selectedCourseLabel = [
    selectedSession?.student?.bootcampName || (selectedSession as any)?.courseName || (selectedSession as any)?.moduleName,
    selectedSession?.student?.batchName || (selectedSession as any)?.batchName,
  ]
    .filter(Boolean)
    .join(" · ")

  // Per-session `studentCredits` from GET /instructor/mentor-sessions/my
  const selectedCredits = selectedSession?.studentCredits ?? null
  const nextBookingOpensLabel = formatDayMonth(selectedCredits?.nextEligibleDate)

  const isCancelWindowOpen = useMemo(() => {
    if (selectedActions?.cancel) return selectedActions.cancel.allowed
    // Older payloads without `actions`: cancel until noticeHours before the start
    const start = selectedSession?.slotStart ? new Date(selectedSession.slotStart).getTime() : NaN
    if (Number.isNaN(start)) return false
    // No rule sent: leave it to the backend, which refuses with its own message
    if (typeof noticeHours !== "number") return start > nowTimestamp
    return start - noticeHours * 60 * 60 * 1000 > nowTimestamp
  }, [selectedActions, selectedSession?.slotStart, noticeHours, nowTimestamp])

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

  const {
    isCancelling,
    error: cancelError,
    cancelBooking,
  } = useCancelMentorSlotBooking()

  const handleCancelSession = async () => {
    if (!selectedSession) return
    const reason = cancelReason.trim()
    if (reason.length < MIN_CANCEL_REASON_LENGTH) return

    const ok = await cancelBooking(selectedSession.id, reason, "mentor", "instructor")
    if (ok) {
      toast.success({
        title: "Session cancelled",
        description: "The student has been notified and gets the credit back.",
      })
      setCancelDialogOpen(false)
      setCancelReason("")
      await refetchMySessions()
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
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

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
          className={`relative flex items-center gap-2 pb-2.5 ${activeTab === "all"
            ? "font-medium text-foreground"
            : "font-normal text-muted-foreground hover:text-foreground"
            }`}
        >
          <span>All</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
            {Number(summaryCounts.total) || 0}
          </span>
          {activeTab === "all" && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />}
        </button>

        <button
          onClick={() => {
            setActiveTab("upcoming")
            setSelectedBookingId(null)
          }}
          className={`relative flex items-center gap-2 pb-2.5 ${activeTab === "upcoming"
            ? "font-medium text-foreground"
            : "font-normal text-muted-foreground hover:text-foreground"
            }`}
        >
          <span>Upcoming</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
            {Number(summaryCounts.upcoming) || 0}
          </span>
          {activeTab === "upcoming" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("reschedule")
            setSelectedBookingId(null)
          }}
          className={`relative flex items-center gap-2 pb-2.5 ${activeTab === "reschedule"
            ? "font-medium text-foreground"
            : "font-normal text-muted-foreground hover:text-foreground"
            }`}
        >
          <span>Action Needed</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1.5 text-[11px] font-medium text-warning-foreground">
            {Number(summaryCounts.reschedule) || 0}
          </span>
          {activeTab === "reschedule" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("completed")
            setSelectedBookingId(null)
          }}
          className={`relative flex items-center gap-2 pb-2.5 ${activeTab === "completed"
            ? "font-medium text-foreground"
            : "font-normal text-muted-foreground hover:text-foreground"
            }`}
        >
          <span>Completed</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
            {Number(summaryCounts.completed) || 0}
          </span>
          {activeTab === "completed" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("cancelled")
            setSelectedBookingId(null)
          }}
          className={`relative flex items-center gap-2 pb-2.5 ${activeTab === "cancelled"
            ? "font-medium text-foreground"
            : "font-normal text-muted-foreground hover:text-foreground"
            }`}
        >
          <span>Cancelled</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
            {Number(summaryCounts.cancelled) || 0}
          </span>
          {activeTab === "cancelled" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
          )}
        </button>
      </div>
      <div className="border-b border-border"></div>
      {showGlobalEmptyState ? (
        <div className="flex h-full justify-center pt-20 px-6 text-center">
          <div className="max-w-sm">
           <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center text-3xl">
              📋
            </div>
            <p className="text-sm text-gray-400 sm:whitespace-nowrap">
              No sessions yet. Sessions will appear here once students book your open slots.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-[600px] overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex w-[410px] flex-col border-r border-border">
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
                      className={`w-full border-b border-border p-4 text-left transition ${isSelected ? "bg-[#f4faf4] dark:bg-muted-foreground/20" : "bg-card hover:bg-[#fafafa] dark:hover:bg-muted-foreground/10"}
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e5efe7] dark:bg-emerald-800/50 text-xs font-semibold text-[#4b6b50] dark:text-emerald-600">
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="mb-1 truncate text-[15px] font-semibold text-foreground">
                            {displayName}
                          </p>
                          <p className="truncate text-xs text-[#9ca3af]">
                            {formatDateOnly(session.slotStart || session.slotEnd)} · {formatTimeRange(session.slotStart, session.slotEnd)}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                          </div>
                        </div>

                        <Badge
                          variant="outline"
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
                <div className="p-6 text-left">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#e5efe7] dark:bg-emerald-800/50 text-sm font-semibold text-[#4b6b50] dark:text-emerald-600">
                        {selectedInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground">
                          {selectedDisplayName}
                        </p>
                        {selectedCourseLabel && (
                          <p className="truncate text-xs text-muted-foreground">{selectedCourseLabel}</p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getSessionStatusBadge(selectedSession).className}`}
                    >
                      {getSessionStatusBadge(selectedSession).label}
                    </Badge>
                  </div>

                  {/* Date & time */}
                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-foreground">
                    <span>{formatPanelDate(selectedSession.slotStart || selectedSession.slotEnd)}</span>
                    <span>{formatTimeRange(selectedSession.slotStart, selectedSession.slotEnd)}</span>
                  </div>

                  {/* Student credits */}
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-foreground">Student credits</p>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                        <p className="text-xs text-muted-foreground">Credits left</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {typeof selectedCredits?.creditsLeft === "number" ? (
                            <>
                              {selectedCredits.creditsLeft}
                              {typeof selectedCredits.creditsAssigned === "number" && (
                                <span className="text-warning-dark"> of {selectedCredits.creditsAssigned}</span>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                        <p className="text-xs text-muted-foreground">Sessions used</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {typeof selectedCredits?.creditsUsed === "number" ? selectedCredits.creditsUsed : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                        <p className="text-xs text-muted-foreground">Next booking opens</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {nextBookingOpensLabel || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedSession && (isCancelledValue(selectedSession.status) || isCancelledValue(selectedSession.sessionLifecycleState)) && (
                    <div className="mt-4 space-y-3  bg-red-50/50 dark:bg-red-900/20 text-left">
                      <p className="text-base font-semibold text-red-950 dark:text-red-400">Cancellation Details</p>
                      <div className="space-y-2 text-sm text-red-800">
                        {/* {selectedSession.cancelledBy && (
                          <div className="flex gap-2">
                            <span className="font-semibold">Cancelled By:</span>
                            <span className="capitalize">{selectedSession.cancelledBy}</span>
                          </div>
                        )}
                        {selectedSession.cancelledAt && (
                          <div className="flex gap-2">
                            <span className="font-semibold">Cancelled Date:</span>
                            <span>{formatDateTime(selectedSession.cancelledAt)}</span>
                          </div>
                        )} */}
                        {selectedSession.cancellationReason && (
                          <div className="mt-2 bg-card p-3 rounded-lg border border-red-100">
                            <p className="font-semibold text-xs text-red-400 uppercase tracking-wider mb-1">Reason</p>
                            <p className="whitespace-pre-wrap text-red-950 dark:text-red-300">{selectedSession.cancellationReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!isRescheduleTab && !hasRescheduleRequest && selectedSession.sessionLifecycleState !== "COMPLETED" && !isReadOnlySession && hasJoinTarget && !canJoinSelectedSession &&
                    (!selectedActions?.join || selectedActions.join.reason === "JOIN_NOT_OPEN") && (
                    <p className="mt-6 text-xs text-muted-foreground">
                      Join opens {joinOpenMinutes} min before start
                    </p>
                  )}

                  {!isRescheduleTab && !hasRescheduleRequest && selectedSession.sessionLifecycleState !== "COMPLETED" && !isReadOnlySession && (
                    <>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {hasJoinTarget ? (
                          // Join fetches a fresh host link: GET /instructor/mentor-slots/bookings/:bookingId/join-link
                          <Button
                            type="button"
                            className="bg-green-700 hover:bg-green-800"
                            onClick={handleJoinSession}
                            disabled={!canJoinSelectedSession || isFetchingJoinLink}
                          >
                            {isFetchingJoinLink && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                            Join the Session
                          </Button>
                        ) : (
                          <Button type="button" className="bg-green-700 hover:bg-green-800" disabled>
                            Join unavailable
                          </Button>
                        )}

                        {isUpcomingSession && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCancelDialogOpen(true)}
                            disabled={!isCancelWindowOpen || isCancelling}
                          >
                            Cancel session
                          </Button>
                        )}
                      </div>

                      {/* Backend message: "You can cancel until ..." / "This session starts in under 72 hours ..." / "Starts in 5 min." */}
                      {selectedMessage && !isCompletedSession && (
                        <div className="mt-3 rounded-lg bg-info/10 px-4 py-3 text-sm text-foreground">
                          {selectedMessage}
                        </div>
                      )}
                    </>
                  )}

                  {/* Completed: the recording, as on the student's session card */}
                  {isCompletedSession && (
                    canViewRecording && completedRecordingUrl ? (
                      <Button type="button" variant="outline" asChild className="mt-4 gap-2">
                        <a href={completedRecordingUrl} target="_blank" rel="noopener noreferrer">
                          <PlayCircle className="h-4 w-4" />
                          View Recording
                        </a>
                      </Button>
                    ) : selectedMessage ? (
                      <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-foreground">
                        <Video className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>{selectedMessage}</span>
                      </div>
                    ) : null
                  )}
                </div>
                {(isRescheduleTab || hasRescheduleRequest) && (
                  <div className="space-y-3  px-4 py-0 text-left ">
                    <p className="text-sm font-semibold">Reschedule Request</p>
                    {/* Backend message: "<Student> asked to move this session to ... Reply by ..., or the session stays as booked." */}
                    {getMentorDisplayState(selectedSession) === "ACTION_NEEDED" && selectedMessage && (
                      <p className="rounded-lg bg-warning/10 px-4 py-3 text-sm text-foreground">{selectedMessage}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="bg-green-700 hover:bg-green-800"
                        onClick={handleAcceptReschedule}
                        disabled={isRescheduling || selectedActions?.acceptReschedule?.allowed === false}
                      >
                        {isRescheduling ? "Please wait..." : "Accept Reschedule"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDeclineReschedule}
                        disabled={isRescheduling || selectedActions?.declineReschedule?.allowed === false}
                      >
                        Decline Reschedule
                      </Button>
                    </div>
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
                  <div className="space-y-4 px-4 py-0 text-left">
                    {isAlreadySubmitted ? (
                      <div className="space-y-3">
                        <p className="text-base font-semibold">Mentor Feedback</p>
                        <div className="rounded-xl border p-4 space-y-3 bg-gray-50/50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Rating:</span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const ratingVal = Number(currentFeedbackDraft.rating)
                                const isFilled = i < ratingVal
                                return (
                                  <svg
                                    key={i}
                                    className={`h-4 w-4 ${isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                )
                              })}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">({currentFeedbackDraft.rating}/5)</span>
                          </div>
                          {currentFeedbackDraft.notes && (
                            <div className="text-sm text-gray-700">
                              <p className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-1 text-muted-foreground">Notes</p>
                              <p className="whitespace-pre-wrap">{currentFeedbackDraft.notes}</p>
                            </div>
                          )}
                          {currentFeedbackDraft.areasOfImprovement && (
                            <div className="text-sm text-gray-700">
                              <p className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-1 text-muted-foreground">Areas of Improvement</p>
                              <p className="whitespace-pre-wrap">{currentFeedbackDraft.areasOfImprovement}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
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
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <Textarea
                              value={currentFeedbackDraft.notes}
                              onChange={(event) => updateFeedbackDraft("notes", event.target.value)}
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
                          />
                        </div>
                        <Button
                          type="button"
                          className="bg-green-700 hover:bg-green-800"
                          onClick={handleSubmitFeedback}
                          disabled={
                            isSubmittingFeedback ||
                            Number(currentFeedbackDraft.rating) < 1 ||
                            Number(currentFeedbackDraft.rating) > 5
                          }
                        >
                          {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                        </Button>
                        {feedbackError && <p className="text-sm text-red-500">{feedbackError}</p>}
                        {feedbackData?.message && (
                          <p className="text-sm text-green-700">{feedbackData.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          if (isCancelling) return
          setCancelDialogOpen(open)
          if (!open) setCancelReason("")
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-left">Cancel session</DialogTitle>
            <DialogDescription className="text-left">
              {selectedDisplayName
                ? `${selectedDisplayName} will be notified and gets the credit back.`
                : "The student will be notified and gets the credit back."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 text-left">
            <label htmlFor="mentor-cancel-reason" className="text-sm font-medium">
              Reason for cancellation
            </label>
            <Textarea
              id="mentor-cancel-reason"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Unable to attend due to schedule conflict"
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Minimum {MIN_CANCEL_REASON_LENGTH} characters. The student will see this.
            </p>
            {cancelError && <p className="text-sm text-destructive">{cancelError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isCancelling}
            >
              Keep session
            </Button>
            <Button
              type="button"
              className="bg-green-700 hover:bg-green-800"
              onClick={handleCancelSession}
              disabled={isCancelling || cancelReason.trim().length < MIN_CANCEL_REASON_LENGTH}
            >
              {isCancelling ? "Cancelling..." : "Confirm cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}