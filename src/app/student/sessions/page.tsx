"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { Skeleton } from "@/components/ui/skeleton"
import MentorshipTabs from "@/app/student/_components/MentorshipTabs"
import { cn } from "@/lib/utils"
import {
  useMyMentorSessions,
  type SessionFilter,
} from "@/hooks/useMyMentorSessions"
import { useMentorSlotRecording } from "@/hooks/useMentorSlotRecording"
import {
  CalendarDays,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  Users,
  ArrowLeft,
  Star
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useSubmitStudentFeedback } from "@/hooks/useSubmitStudentFeedback"
import {
  getMentorProfileHref,
  getMentorsHref,
  getSessionCancelHref,
  getSessionJoinHref,
  getSessionRescheduleHref,
} from "@/utils/studentMentorshipRoutes"

type Tab = "all" | "upcoming" | "completed" | "cancelled"

const formatLifecycleValue = (value: string | null | undefined) =>
  (value || "-").replaceAll("_", " ")

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

const getMentorDisplayName = (mentorName: string | null | undefined, mentorUserId: number | string) =>
  mentorName?.trim() || `Mentor ${mentorUserId}`

const getMentorAvatarFallback = (mentorName: string | null | undefined, mentorUserId: number | string) => {
  if (mentorName?.trim()) {
    const words = mentorName.trim().split(/\s+/)
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return `${words[0][0] || "M"}${words[1][0] || ""}`.toUpperCase()
  }

  return `M${String(mentorUserId).slice(-1)}`
}

function RecordingLink({ bookingId }: { bookingId: number }) {
  const { recordingUrl } = useMentorSlotRecording(bookingId, true)

  if (!recordingUrl) {
    return null
  }

  return (
    <Button  size="sm" asChild>
      <a
        href={recordingUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        View Recording
      </a>
    </Button>
  )
}

export default function MySessions() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId") || ""
  const orgId = searchParams.get("orgId") || ""
  const routeContext = { courseId, orgId }
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now())
  const [feedbackBookingId, setFeedbackBookingId] = useState<number | null>(null)
  const [tempRating, setTempRating] = useState(5)
  const [tempFeedback, setTempFeedback] = useState("")
  const [locallySubmittedFeedbackIds, setLocallySubmittedFeedbackIds] = useState<
    Record<number, { rating: number; feedback: string }>
  >({})

  const { isSubmitting, error: submitError, submitFeedback } = useSubmitStudentFeedback()

  const handleSubmitFeedback = async () => {
    if (!feedbackBookingId) return

    const success = await submitFeedback(feedbackBookingId, {
      rating: tempRating,
      feedback: tempFeedback,
      notes: tempFeedback,
    })

    if (success) {
      setLocallySubmittedFeedbackIds((prev) => ({
        ...prev,
        [feedbackBookingId]: { rating: tempRating, feedback: tempFeedback },
      }))
      toast.success({
        title: "Feedback Submitted",
        description: "Your feedback has been submitted successfully.",
      })
      setFeedbackBookingId(null)
      refetchMySessions()
    }
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTimestamp(Date.now())
    }, 30 * 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const { sessions, loading, error, refetchMySessions } = useMyMentorSessions(
    true,
    "/student/mentor-sessions/my",
    activeTab as SessionFilter
  )

  const { counts: upcomingCounts } = useMyMentorSessions(
    true,
    "/student/mentor-sessions/my",
    "upcoming"
  )

  const { counts: completedCounts } = useMyMentorSessions(
    true,
    "/student/mentor-sessions/my",
    "completed"
  )

  const { counts: cancelledCounts } = useMyMentorSessions(
    true,
    "/student/mentor-sessions/my",
    "cancelled"
  )

  const { counts: allCounts } = useMyMentorSessions(
    true,
    "/student/mentor-sessions/my",
    "all"
  )

  const counts = {
    all: Number(allCounts.total) || 0,
    upcoming: Number(upcomingCounts.upcoming) || 0,
    completed: Number(completedCounts.completed) || 0,
    cancelled: Number(cancelledCounts.cancelled) || 0,
  }

  const totalSessions = counts.upcoming + counts.completed + counts.cancelled

  return (

    <div className="max-w-[90rem] mx-auto p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-semibold text-left text-gray-900">Mentorship</h1>
        {/* <p className="mt-1 text-sm text-gray-500 text-left">Browse mentors or manage your sessions.</p> */}
      </div>

      <MentorshipTabs courseId={courseId} orgId={orgId} />
      {/* TABS */}

      <div className="flex items-center  rounded-full p-1 w-fit gap-3">

        <TabButton
          id="tour-all-sessions"
          active={activeTab === "all"}
          icon={Calendar}
          label="All"
          count={counts.all}
          onClick={() => setActiveTab("all")}
        />

        <TabButton
          id="tour-upcoming-sessions"
          active={activeTab === "upcoming"}
          icon={CalendarDays}
          label="Upcoming"
          count={counts.upcoming}
          onClick={() => setActiveTab("upcoming")}
        />

        <TabButton
          id="tour-completed-sessions"
          active={activeTab === "completed"}
          icon={CheckCircle2}
          label="Completed"
          count={counts.completed}
          onClick={() => setActiveTab("completed")}
        />

        <TabButton
          active={activeTab === "cancelled"}
          icon={XCircle}
          label="Cancelled"
          count={counts.cancelled}
          onClick={() => setActiveTab("cancelled")}
        />

      </div>

      {/* SESSION CARD */}

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>

          <Skeleton className="h-11 w-fit rounded-full px-24" />

          <div className="space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      ) : error ? (
        <div className="space-y-3 rounded-2xl border bg-card p-6">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" onClick={refetchMySessions}>
            Retry
          </Button>
        </div>
      ) : activeTab === "all" ? (
        counts.all === 0 ? (
          <Card className="rounded-3xl border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <CalendarDays className="h-6 w-6 text-muted-foreground" size={36} />
              <h1 className="font-semibold text-sm">No sessions yet</h1>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your sessions will appear here once you book them.
              </p>
              <Button className="mt-4 text-sm text-white px-5 py-2 rounded-lg flex items-center gap-2" asChild>
                <Link href={getMentorsHref(routeContext)}>
                  <Users size={16} />
                  Book a Session
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => {
            const lifecycle = (session.sessionLifecycleState || "").toUpperCase()
            const isInProgress = lifecycle === "IN_PROGRESS"
            const isCompleted = lifecycle === "COMPLETED"
            const isCancelled = lifecycle === "CANCELLED" || session.status === "cancelled"
            const isUpcoming = !isInProgress && !isCompleted && !isCancelled
            const joinUrl = session.meetingLink?.trim() || ""
            const canJoinNow = !!joinUrl && isJoinWindowOpen(session.slotStart, session.slotEnd, nowTimestamp)

            const hasStudentFeedback = Boolean(
              (session as any).studentRating ||
              (session as any).studentFeedback ||
              (session as any).studentFeedbackNotes ||
              locallySubmittedFeedbackIds[session.id]
            )
            const studentRating = Number((session as any).studentRating || locallySubmittedFeedbackIds[session.id]?.rating || 0)
            const studentFeedback = (session as any).studentFeedback || (session as any).studentFeedbackNotes || (session as any).studentNotes || locallySubmittedFeedbackIds[session.id]?.feedback || ""

            const statusBadge = isInProgress ? (
              <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 leading-none text-xs font-medium rounded-full bg-blue-100 text-blue-700">In Progress</span>
            ) : isCompleted ? (
              <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 leading-none text-xs font-medium rounded-full bg-green-100 text-green-700">Completed</span>
            ) : isCancelled ? (
              <Badge className="bg-destructive-light text-destructive">Cancelled</Badge>
            ) : (
              <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 leading-none text-xs font-medium rounded-full bg-green-100 text-green-700">Upcoming</span>
            )

            // Cancelled card
            if (isCancelled) {
              return (
                <Card key={session.id} className="rounded-2xl border shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-center">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {getMentorAvatarFallback(session.mentorName, session.mentorUserId)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{getMentorDisplayName(session.mentorName, session.mentorUserId)}</p>
                        </div>
                      </div>
                      {statusBadge}
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 text-sm"><Calendar size={14} />{formatDateOnly(session.slotStart || session.slotEnd)}</div>
                      <div className="flex items-center gap-1 text-sm"><Clock size={14} />{formatTimeRange(session.slotStart, session.slotEnd)}</div>
                      <div className="text-sm">Booking #{session.id}</div>
                      <div className="text-sm">{session.status}</div>
                    </div>
                    <div className="border-t pt-4" />
                    <Link href={getMentorProfileHref(session.mentorUserId, routeContext)} className="text-green-600 text-sm font-medium flex items-center gap-2">
                      <CalendarDays size={16} />
                      Book again with {getMentorDisplayName(session.mentorName, session.mentorUserId)} →
                    </Link>
                  </CardContent>
                </Card>
              )
            }

            // Completed card
            if (isCompleted) {
              return (
                <Card key={session.id} className="rounded-2xl border shadow-sm">
                  <CardContent className="p-6 rounded-3xl">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-center">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getMentorAvatarFallback(session.mentorName, session.mentorUserId)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{getMentorDisplayName(session.mentorName, session.mentorUserId)}</p>
                        </div>
                      </div>
                      {statusBadge}
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground mt-3">
                      <div className="flex items-center gap-1 text-sm"><Calendar size={14} />{formatDateOnly(session.slotStart || session.slotEnd)}</div>
                      <div className="flex items-center gap-1 text-sm"><Clock size={14} />{formatTimeRange(session.slotStart, session.slotEnd)}</div>
                      <div className="text-sm">Booking #{session.id}</div>
                      <div className="text-sm">{session.status}</div>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground text-left">
                      <p>Mentor rating: {typeof session.mentorRating === "number" ? session.mentorRating : "-"}</p>
                      <p>Feedback notes: {session.mentorFeedback?.notes?.trim() || "-"}</p>
                      <p>Areas of improvement: {session.mentorFeedback?.areasOfImprovement?.trim() || "-"}</p>
                      <RecordingLink bookingId={session.id} />
                    </div>
                    {hasStudentFeedback ? (
                      <div className="mt-4 border-t pt-4 space-y-1 text-left">
                        <p className="text-sm font-semibold text-slate-800">Your Feedback to Mentor</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>Rating:</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star key={idx} size={12} className={idx < studentRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                            ))}
                          </div>
                        </div>
                        {studentFeedback && <p className="text-xs text-muted-foreground italic">&ldquo;{studentFeedback}&rdquo;</p>}
                      </div>
                    ) : (
                      <div className="mt-4 border-t pt-4 flex justify-end">
                        <Button size="sm" className="bg-[#2F6B2F] hover:bg-[#204a20] text-white font-medium" onClick={() => { setFeedbackBookingId(session.id); setTempRating(5); setTempFeedback("") }}>
                          Submit Feedback
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            }

            // Upcoming + In Progress card
            return (
              <Card key={session.id} className="rounded-3xl">
                <CardContent className="p-6 rounded-3xl">
                  <div className="flex justify-between">
                    <div className="flex gap-3 items-center">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getMentorAvatarFallback(session.mentorName, session.mentorUserId)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{getMentorDisplayName(session.mentorName, session.mentorUserId)}</p>
                      </div>
                    </div>
                    {statusBadge}
                  </div>
                  <div className="flex gap-6 text-sm text-muted-foreground mt-3">
                    <div className="flex items-center gap-1 text-sm"><Calendar size={14} />{formatDateOnly(session.slotStart || session.slotEnd)}</div>
                    <div className="flex items-center gap-1 text-sm"><Clock size={14} />{formatTimeRange(session.slotStart, session.slotEnd)}</div>
                    <div className="text-sm">Booking #{session.id}</div>
                    <div className="text-sm">{session.status}</div>
                  </div>
                  {isUpcoming && (
                    <p className="text-sm text-muted-foreground mt-2 text-left">
                      You&apos;re all set. We&apos;ll remind you before the session.
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex gap-3 flex-wrap">
                  {!canJoinNow && !isInProgress && !!joinUrl && (
                    <p className="basis-full text-xs text-muted-foreground text-left">Join opens 10 min before start</p>
                  )}
                  <Button className="flex gap-2" asChild={canJoinNow || isInProgress} disabled={!canJoinNow && !isInProgress}>
                    {canJoinNow || isInProgress ? (
                      <Link href={getSessionJoinHref(session.id, joinUrl, routeContext)} target="_blank" rel="noopener noreferrer">
                        <Video size={14} />
                        Join Session
                      </Link>
                    ) : joinUrl ? (
                      <><Video size={14} />Join Session</>
                    ) : (
                      <><Video size={14} />Join Unavailable</>
                    )}
                  </Button>
                  {isUpcoming && (
                    <>
                      <Button variant="outline" asChild>
                        <Link href={getSessionRescheduleHref(session.id, routeContext, { currentSlotId: session.slotAvailabilityId, mentorId: session.mentorUserId })}>
                          Reschedule
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={getSessionCancelHref(session.id, routeContext)}>Cancel</Link>
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            )
          })
        )
      ) : activeTab === "cancelled" && counts.cancelled > 0 ? (
        sessions.map((session) => (
          <Card key={session.id} className="rounded-2xl border shadow-sm">

            <CardContent className="p-6 space-y-4">

              <div className="flex justify-between items-start">

                <div className="flex gap-3 items-center">

                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {getMentorAvatarFallback(session.mentorName, session.mentorUserId)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {getMentorDisplayName(session.mentorName, session.mentorUserId)}
                    </p>
                  </div>

                </div>

                <Badge className="bg-destructive-light text-destructive">
                  Cancelled
                </Badge>

              </div>

              <div className="flex gap-6 text-sm text-muted-foreground">

                <div className="flex items-center gap-1 text-sm">
                  <Calendar size={14} />
                  {formatDateOnly(session.slotStart || session.slotEnd)}
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Clock size={14} />
                  {formatTimeRange(session.slotStart, session.slotEnd)}
                </div>

                <div className="text-sm">Booking #{session.id}</div>

                <div className='text-sm'>{session.status}</div>

              </div>

              <div className="border-t pt-4" />

              <Link
                href={getMentorProfileHref(session.mentorUserId, routeContext)}
                className="text-green-600 text-sm font-medium flex items-center gap-2"
              >

                <CalendarDays size={16} />

                Book again with {getMentorDisplayName(session.mentorName, session.mentorUserId)} →

              </Link>

            </CardContent>

          </Card>
        ))
      ) : activeTab === "cancelled" && counts.cancelled === 0 ? (
        <Card className="rounded-3xl border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <XCircle className="h-6 w-6 text-muted-foreground" size={36} />
            <h1 className="font-semibold text-sm">No cancelled sessions</h1>
          </CardContent>
        </Card>
      ) : activeTab === "completed" && counts.completed === 0 ? (

        <Card className="rounded-3xl border">

          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">

              <CheckCircle2 className="h-6 w-6 text-primary" size={36} />
            </div>
            <h1 className="font-semibold text-sm">
              No completed sessions yet
            </h1>

            <p className="text-sm text-muted-foreground max-w-sm">
              Your completed sessions will appear here after you attend them.
            </p>

            <Button className="mt-4 text-sm text-white px-5 py-2 rounded-lg flex items-center gap-2" asChild>

              <Link href={getMentorsHref(routeContext)}>
                <Users size={16} />

                Book a Session
              </Link>

            </Button>

          </CardContent>

        </Card>

      ) : activeTab === "completed" && counts.completed > 0 ?
        sessions.map((session) => (
          <Card key={session.id} className="rounded-2xl border shadow-sm">
            <CardContent className="p-6 rounded-3xl">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getMentorAvatarFallback(session.mentorName, session.mentorUserId)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">{getMentorDisplayName(session.mentorName, session.mentorUserId)}</p>
                  </div>
                </div>

                <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 leading-none text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Completed
                </span>
              </div>

              <div className="flex gap-6 text-sm text-muted-foreground mt-3">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar size={14} />
                  {formatDateOnly(session.slotStart || session.slotEnd)}
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Clock size={14} />
                  {formatTimeRange(session.slotStart, session.slotEnd)}
                </div>

                <div className="text-sm">Booking #{session.id}</div>

                <div className="text-sm">{session.status}</div>
              </div>

              <div className="mt-3 space-y-2 text-sm text-muted-foreground text-left">
                <p>
                  Mentor rating: {typeof session.mentorRating === "number" ? session.mentorRating : "-"}
                </p>
                <p>
                  Feedback notes: {session.mentorFeedback?.notes?.trim() || "-"}
                </p>
                <p>
                  Areas of improvement: {session.mentorFeedback?.areasOfImprovement?.trim() || "-"}
                </p>
                <RecordingLink bookingId={session.id} />
              </div>

              {(() => {
                const hasStudentFeedback = Boolean(
                  (session as any).studentRating ||
                  (session as any).studentFeedback ||
                  (session as any).studentFeedbackNotes ||
                  locallySubmittedFeedbackIds[session.id]
                )

                const studentRating = Number((session as any).studentRating || locallySubmittedFeedbackIds[session.id]?.rating || 0)
                const studentFeedback = (session as any).studentFeedback || (session as any).studentFeedbackNotes || (session as any).studentNotes || locallySubmittedFeedbackIds[session.id]?.feedback || ""

                return hasStudentFeedback ? (
                  <div className="mt-4 border-t pt-4 space-y-1 text-left">
                    <p className="text-sm font-semibold text-slate-800">Your Feedback to Mentor</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Rating:</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={12}
                            className={
                              idx < studentRating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    {studentFeedback && (
                      <p className="text-xs text-muted-foreground italic">
                        &ldquo;{studentFeedback}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 border-t pt-4 flex justify-end">
                    <Button
                      size="sm"
                      className="bg-[#2F6B2F] hover:bg-[#204a20] text-white font-medium"
                      onClick={() => {
                        setFeedbackBookingId(session.id)
                        setTempRating(5)
                        setTempFeedback("")
                      }}
                    >
                      Submit Feedback
                    </Button>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        ))
      : activeTab === "upcoming" && counts.upcoming > 0 ?
        sessions.map((session) => {
          const joinUrl = session.meetingLink?.trim() || ""
          const canJoinNow = !!joinUrl && isJoinWindowOpen(session.slotStart, session.slotEnd, nowTimestamp)

          return (
          <Card key={session.id} className="rounded-3xl">
            <CardContent className="p-6 rounded-3xl">

              <div className="flex justify-between">

                <div className="flex gap-3 items-center">

                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getMentorAvatarFallback(session.mentorName, session.mentorUserId)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">{getMentorDisplayName(session.mentorName, session.mentorUserId)}</p>
                  </div>

                </div>

                <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 leading-none text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Upcoming
                </span>

              </div>

              <div className="flex gap-6 text-sm text-muted-foreground mt-3">

                <div className="flex items-center gap-1 text-sm">
                  <Calendar size={14} />
                  {formatDateOnly(session.slotStart || session.slotEnd)}
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Clock size={14} />
                  {formatTimeRange(session.slotStart, session.slotEnd)}
                </div>

                <div className="text-sm">Booking #{session.id}</div>

                <div className="text-sm">{session.status}</div>

              </div>

              <p className="text-sm text-muted-foreground mt-2 text-left">
                You&apos;re all set. We&apos;ll remind you before the session.
              </p>

            </CardContent>

            <CardFooter className="flex gap-3 flex-wrap">
              {!canJoinNow && !!joinUrl && (
                <p className="basis-full text-xs text-muted-foreground text-left">
                  Join opens 10 min before start
                </p>
              )}
              <Button
                className="flex gap-2"
                asChild={canJoinNow}
                disabled={!canJoinNow}
              >
                {canJoinNow ? (
                  <Link
                    href={getSessionJoinHref(session.id, joinUrl, routeContext)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video size={14} />
                    Join Session
                  </Link>
                ) : joinUrl ? (
                  <>
                    <Video size={14} />
                    Join Session
                  </>
                ) : (
                  <>
                    <Video size={14} />
                    Join Unavailable
                  </>
                )}
              </Button>

              <Button variant="outline" asChild>
                <Link
                  href={getSessionRescheduleHref(session.id, routeContext, {
                    currentSlotId: session.slotAvailabilityId,
                    mentorId: session.mentorUserId,
                  })}
                >
                  Reschedule
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href={getSessionCancelHref(session.id, routeContext)}>
                  Cancel
                </Link>
              </Button>

            </CardFooter>
          </Card>
          )
        })
      : activeTab === "upcoming" && counts.upcoming === 0 ? (
        <Card className="rounded-3xl border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <CalendarDays className="h-6 w-6 text-muted-foreground" size={36} />
            <h1 className="font-semibold text-sm">No upcoming sessions</h1>
          </CardContent>
        </Card>
      ) : null}

      {feedbackBookingId !== null && (
        <Dialog open={feedbackBookingId !== null} onOpenChange={(open) => !open && setFeedbackBookingId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-left">Submit Feedback for Mentor</DialogTitle>
              <DialogDescription className="text-sm text-left text-muted-foreground">
                Please share your experience with your mentor. Your feedback helps improve mentoring quality.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5 text-left">
                <p className="text-sm font-medium text-gray-700">Rating</p>
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const starValue = index + 1
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setTempRating(starValue)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          size={28}
                          className={
                            starValue <= tempRating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <p className="text-sm font-medium text-gray-700">Feedback / Notes</p>
                <Textarea
                  placeholder="Share details about what went well and areas for improvement..."
                  value={tempFeedback}
                  onChange={(e) => setTempFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {submitError && (
                <p className="text-xs text-red-500 text-left">{submitError}</p>
              )}
            </div>

            <DialogFooter className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFeedbackBookingId(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-[#2F6B2F] hover:bg-[#204a20] text-white font-medium"
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || tempRating < 1 || tempRating > 5}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  )
}


/* STAT CARD */

function StatCard({
  label,
  count,
  color,
  active,
  onClick,
}: any) {

  return (

    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-2xl border transition",
        active && "border-green-700 bg-green-50"
      )}
    >

      <CardContent className="p-4">

        <p className={cn("text-2xl font-semibold", color)}>
          {count}
        </p>

        <p className="text-sm text-muted-foreground">
          {label}
        </p>

      </CardContent>

    </Card>

  )
}

function TabButton({
  id,
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: any) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all duration-200",
        active
          ? "bg-[#2F6B2F] text-white border-[#2F6B2F]"
          : "bg-white text-[#5F6D5F] border-[#D9DED9] hover:bg-[#F8F9F8]"
      )}
    >
      <Icon size={14} strokeWidth={2.2} />

      <span className="leading-none">{label}</span>

      {count > 0 && (
        <span
          className={cn(
            "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-none",
            active
              ? "bg-white/20 text-white"
              : "bg-[#EEF1EE] text-[#5F6D5F]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}
