"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar, Clock, ChevronRight, User, Video } from "lucide-react"
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

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<SessionTab>("all")
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [joinedAt, setJoinedAt] = useState("")
  const [leftAt, setLeftAt] = useState("")

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
  } = useMyMentorSessions(true, "/mentor-sessions/mentor/my", activeTab as SessionFilter)

  const sessions = apiSessions

  useEffect(() => {
    if (sessions.length === 0) {
      setSelectedBookingId(null)
      return
    }

    if (selectedBookingId === null) {
      return
    }

    const selectedStillExists = sessions.some(
      (session) => session.id === selectedBookingId
    )

    if (!selectedStillExists) {
      setSelectedBookingId(null)
    }
  }, [sessions, selectedBookingId])

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedBookingId) || null,
    [sessions, selectedBookingId]
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
      await refetchMySessions()
      await refetchSlotDetails()
    }
  }

  const handleDeclineReschedule = async () => {
    if (!selectedSession) return

    const ok = await declineReschedule(selectedSession.id)
    if (ok) {
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

  return (
    <div className="p-6">
      <div className="mb-6 text-left">
        <h1 className="text-xl font-semibold">Sessions</h1>
        <p className="text-sm text-muted-foreground">
          Manage your mentoring sessions and session lifecycle actions
        </p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden flex h-[720px]">
        <div className="w-[380px] border-r flex flex-col">
          <div className="flex gap-2 px-3 pt-3 overflow-x-auto whitespace-nowrap border-b-4 [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => {
                setActiveTab("all")
                setSelectedBookingId(null)
              }}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold border-b-2 rounded-t-lg ${activeTab === "all"
                  ? "border-green-600 bg-green-50"
                  : "border-transparent text-muted-foreground"
                }`}
            >
              All
              <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {apiSessions.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("upcoming")
                setSelectedBookingId(null)
              }}
              className={`px-3 py-2 text-sm border-b-2 rounded-t-lg ${activeTab === "upcoming"
                  ? "border-green-600 bg-green-50 font-semibold"
                  : "border-transparent text-muted-foreground"
                }`}
            >
              Upcoming
            </button>

            <button
              onClick={() => {
                setActiveTab("reschedule")
                setSelectedBookingId(null)
              }}
              className={`px-3 py-2 text-sm border-b-2 rounded-t-lg ${activeTab === "reschedule"
                  ? "border-green-600 bg-green-50 font-semibold"
                  : "border-transparent text-muted-foreground"
                }`}
            >
              Reschedule Requests
            </button>

            <button
              onClick={() => {
                setActiveTab("completed")
                setSelectedBookingId(null)
              }}
              className={`px-3 py-2 text-sm border-b-2 rounded-t-lg ${activeTab === "completed"
                  ? "border-green-600 bg-green-50 font-semibold"
                  : "border-transparent text-muted-foreground"
                }`}
            >
              Completed
            </button>
          </div>

          <div className="h-px bg-border" />

          <div className="p-3 space-y-2 overflow-y-auto flex-1">
            {loading && <p className="text-sm text-muted-foreground">Loading sessions...</p>}
            {!loading && error && <p className="text-sm text-red-500">{error}</p>}
            {!loading && !error && sessions.length === 0 && (
              <p className="text-sm text-muted-foreground">No sessions found for this tab.</p>
            )}

            {!loading &&
              !error &&
              sessions.map((session) => {
                const isSelected = selectedBookingId === session.id
                const rescheduleStatus = getRescheduleStatus(session)

                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedBookingId(session.id)}
                    className={`w-full text-left rounded-xl border p-4 ${isSelected
                        ? "border-green-600 bg-green-50"
                        : "border-border bg-card"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-semibold">
                        B{session.id}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold">Booking #{session.id}</p>
                        <p className="text-sm text-muted-foreground">Slot #{session.slotAvailabilityId}</p>
                        <p className="text-sm text-muted-foreground">
                          Student: {session.studentName || session.studentUserName || `#${session.studentUserId ?? "-"}`}
                        </p>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDateTime(session.joinedAt)}
                          </span>

                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {session.sessionLifecycleState}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 hover:text-gray-600">{session.status}</Badge>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-700">
                            {session.sessionLifecycleState}
                          </Badge>
                          {rescheduleStatus && (
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 hover:text-orange-700">
                              Reschedule: {rescheduleStatus}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <ChevronRight size={16} className="text-gray-400 mt-1" />
                    </div>
                  </button>
                )
              })}
          </div>
        </div>

        <div className="flex-1 p-5 overflow-y-auto">
          {!selectedSession ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="hidden lg:flex flex-col items-center justify-center h-full text-center px-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <User className="h-7 w-7 text-text-muted" />
                </div>
                <p className="text-sm font-semibold">Select a session</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click any session on the left to view and manage details.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border p-4 text-left space-y-2">
                <p className="text-base font-semibold">Session Details</p>
                <p className="text-sm text-muted-foreground">Booking #{selectedSession.id}</p>
                <p className="text-sm text-muted-foreground">
                  Slot ID: {selectedSession.slotAvailabilityId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Student: {selectedSession.studentName || selectedSession.studentUserName || `#${selectedSession.studentUserId ?? "-"}`}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 hover:text-gray-600">{selectedSession.status}</Badge>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-700">
                    {selectedSession.sessionLifecycleState}
                  </Badge>
                </div>
                {selectedSession.sessionLifecycleState !== "COMPLETED" && !isReadOnlySession && (
                  selectedSession.meetingLink ? (
                    <Button type="button" className="bg-green-700 hover:bg-green-800" asChild>
                      <a
                        href={selectedSession.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Video size={16} className="mr-2" />
                        Join the Session
                      </a>
                    </Button>
                  ) : (
                    <Button type="button" className="bg-green-700 hover:bg-green-800" disabled>
                      <Video size={16} className="mr-2" />
                      Join unavailable
                    </Button>
                  )
                )}
              </div>

              <div className="rounded-xl border p-4 text-left space-y-2">
                <p className="text-base font-semibold">Slot & Bookings</p>
                {slotDetailsLoading && (
                  <p className="text-sm text-muted-foreground">Loading slot details...</p>
                )}
                {!slotDetailsLoading && slotDetailsError && (
                  <p className="text-sm text-red-500">{slotDetailsError}</p>
                )}
                {!slotDetailsLoading && !slotDetailsError && details?.slot && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Start: {formatDateTime(details.slot.slotStartDateTime as string)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total bookings: {details.bookings.length}
                    </p>
                    <div className="space-y-1">
                      {details.bookings.map((booking) => (
                        <div key={booking.id} className="text-sm text-muted-foreground">
                          Booking #{booking.id} · Student #{booking.studentUserId} · {booking.status}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {!isUpcomingSession && selectedSession.sessionLifecycleState !== "COMPLETED" && !isReadOnlySession && (
                <div className="rounded-xl border p-4 text-left space-y-3">
                  <p className="text-base font-semibold">Reschedule Request</p>
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
                  {rescheduleError && <p className="text-sm text-red-500">{rescheduleError}</p>}
                  {rescheduleResponse?.message && (
                    <p className="text-sm text-green-700">{rescheduleResponse.message}</p>
                  )}
                </div>
              )}

              {!isUpcomingSession && selectedSession.sessionLifecycleState !== "COMPLETED" && !isReadOnlySession && (
                <div className="rounded-xl border p-4 text-left space-y-3">
                  <p className="text-base font-semibold">Mark Attendance</p>
                  <div className="grid sm:grid-cols-2 gap-3">
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

              {!isUpcomingSession && selectedSession.sessionLifecycleState !== "COMPLETED" && !isReadOnlySession && (
                <div className="rounded-xl border p-4 text-left space-y-3">
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

              {!isUpcomingSession && !isReadOnlySession && (
                <div className="rounded-xl border p-4 text-left space-y-3">
                  <p className="text-base font-semibold">Submit Feedback</p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1 space-y-1">
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
                    <div className="sm:col-span-2 space-y-1">
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
          )}
        </div>
      </div>
    </div>
  )
}