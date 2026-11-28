"use client"

import Link from "next/link"
import { Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type {
  MyMentorSession,
  SessionCardActions,
  SessionDisplayState,
} from "@/hooks/useMyMentorSessions"
import {
  getMentorDrawerHref,
  getSessionCancelHref,
  getSessionJoinHref,
  getSessionRescheduleHref,
} from "@/utils/studentMentorshipRoutes"
import { isJoinWindowOpen } from "@/utils/sessionDateTime"

type RouteContext = { courseId?: string; orgId?: string }

// ─── State helpers ────────────────────────────────────────────────────────────

/** The backend sends displayState; fall back to the booking fields if it's missing. */
export const getSessionDisplayState = (session: MyMentorSession, now: number): SessionDisplayState => {
  if (session.displayState) return session.displayState

  const lifecycle = (session.sessionLifecycleState || "").toUpperCase()
  const status = (session.status || "").toLowerCase()
  const rescheduleStatus = String((session as { rescheduleStatus?: string | null }).rescheduleStatus || "").toLowerCase()

  if (status === "cancelled" || lifecycle === "CANCELLED") return "CANCELLED"
  if (lifecycle === "MISSED") return "MISSED"
  if (lifecycle === "COMPLETED") return "COMPLETED"
  if (lifecycle === "IN_PROGRESS") return "IN_PROGRESS"
  if (lifecycle === "RESCHEDULE_PENDING" || rescheduleStatus === "pending") return "RESCHEDULE_REQUESTED"
  if (isJoinWindowOpen(session.slotStart, session.slotEnd, now, { joinOpensAt: session.joinOpensAt })) return "STARTING_SOON"
  return "UPCOMING"
}

/** The backend sends actions; fall back to the old client-side rules if they're missing. */
const getSessionActions = (
  session: MyMentorSession,
  state: SessionDisplayState,
  now: number,
  noticeHours?: number
): SessionCardActions => {
  if (session.actions) return session.actions

  const joinUrl = session.meetingLink?.trim() || null
  const startMs = session.slotStart ? new Date(session.slotStart).getTime() : NaN
  // Reschedule/cancel close rules.noticeHours before the session (from the backend).
  // No rule sent: leave it to the backend, which refuses with its own message.
  const noticeMs = typeof noticeHours === "number" ? noticeHours * 60 * 60 * 1000 : 0
  const changesOpen = state === "UPCOMING" && Number.isFinite(startMs) && startMs - now > noticeMs
  // The join time comes from the backend (joinOpensAt); without it the button stays off
  const canJoin = Boolean(joinUrl) && (state === "IN_PROGRESS" || isJoinWindowOpen(session.slotStart, session.slotEnd, now, { joinOpensAt: session.joinOpensAt }))
  const feedbackGiven = Boolean(session.studentFeedbackSubmittedAt || session.studentRating)

  return {
    join: { allowed: canJoin, reason: null, url: joinUrl },
    reschedule: { allowed: changesOpen, reason: null },
    cancel: { allowed: changesOpen, reason: null },
    viewRecording: { allowed: false, reason: null, url: null },
    giveFeedback: { allowed: state === "COMPLETED" && !feedbackGiven, reason: null },
  }
}

const STATE_BADGE: Record<SessionDisplayState, { label: string; className: string; dot: string }> = {
  UPCOMING: { label: "Upcoming", className: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300", dot: "bg-blue-500" },
  STARTING_SOON: { label: "Starting soon", className: "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300", dot: "bg-green-600" },
  IN_PROGRESS: { label: "In progress", className: "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300", dot: "bg-green-600" },
  RESCHEDULE_REQUESTED: { label: "Reschedule requested", className: "bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300", dot: "bg-orange-500" },
  COMPLETED: { label: "Completed", className: "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300", dot: "bg-green-600" },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  MISSED: { label: "Missed", className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300", dot: "bg-red-500" },
}

const MESSAGE_TONE = {
  info: "bg-blue-50 dark:bg-blue-950/30",
  warning: "bg-amber-50 dark:bg-amber-950/30",
  success: "bg-green-50 dark:bg-green-950/30",
  danger: "bg-red-50 dark:bg-red-950/30",
} as const

// ─── Formatting ───────────────────────────────────────────────────────────────

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

// "Today" / "Tomorrow" / "Fri, 6 Nov 2026"
const formatSessionDay = (value: string | null | undefined, now: number) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  const today = new Date(now)
  const tomorrow = new Date(now)
  tomorrow.setDate(today.getDate() + 1)
  if (isSameDay(date, today)) return "Today"
  if (isSameDay(date, tomorrow)) return "Tomorrow"
  const weekday = date.toLocaleDateString("en-GB", { weekday: "short" })
  const rest = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  return `${weekday}, ${rest}`
}

const formatTime = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

const formatTimeRange = (start?: string | null, end?: string | null) =>
  [formatTime(start), formatTime(end)].filter(Boolean).join(" - ") || "-"

const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] || "M"}${words[1][0] || ""}`.toUpperCase()
}

// ─── Card ─────────────────────────────────────────────────────────────────────

type MentorSessionCardProps = {
  session: MyMentorSession
  now: number
  /** rules.noticeHours from the API; only used when a session has no `actions` */
  noticeHours?: number
  routeContext: RouteContext
  onGiveFeedback: (bookingId: number) => void
  /** Feedback submitted in this visit, before the list refreshes. */
  feedbackSubmittedLocally?: boolean
}

export default function MentorSessionCard({
  session,
  now,
  noticeHours,
  routeContext,
  onGiveFeedback,
  feedbackSubmittedLocally,
}: MentorSessionCardProps) {
  const state = getSessionDisplayState(session, now)
  const actions = getSessionActions(session, state, now, noticeHours)
  const badge = STATE_BADGE[state]
  const mentorName = session.mentorName?.trim() || `Mentor ${session.mentorUserId}`
  const recordingState = session.recording?.state ?? null

  const isActive = state === "UPCOMING" || state === "STARTING_SOON" || state === "IN_PROGRESS" || state === "RESCHEDULE_REQUESTED"
  const showChangeButtons = state === "UPCOMING" || state === "RESCHEDULE_REQUESTED"
  const changesOpen = actions.reschedule.allowed || actions.cancel.allowed

  // The line under the session, as the backend words it
  const message = session.message?.trim() || ""

  const messageTone =
    state === "UPCOMING"
      ? changesOpen ? MESSAGE_TONE.info : MESSAGE_TONE.warning
      : state === "RESCHEDULE_REQUESTED"
        ? MESSAGE_TONE.warning
        : state === "MISSED"
          ? MESSAGE_TONE.danger
          : MESSAGE_TONE.success

  // Completed sessions show their line next to a camera icon (it's about the recording)
  const showMessageBox = Boolean(message) && state !== "COMPLETED"
  const completedRecordingLine = state === "COMPLETED" ? message : ""

  const joinUrl = actions.join.url || session.meetingLink?.trim() || ""
  const recordingUrl = actions.viewRecording.url || session.recording?.url || ""
  // View recording only when the recording is ready
  const canViewRecording = (recordingState === "READY" || actions.viewRecording.allowed) && Boolean(recordingUrl)
  const feedbackGiven =
    feedbackSubmittedLocally ||
    actions.giveFeedback.reason === "FEEDBACK_GIVEN" ||
    Boolean(session.studentFeedbackSubmittedAt)

  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5 text-left">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-900 text-sm font-bold text-white dark:bg-green-800">
            {getInitials(mentorName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{mentorName}</p>
            {session.mentorTitle && (
              <p className="truncate text-xs text-muted-foreground">{session.mentorTitle}</p>
            )}
          </div>
        </div>
        <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", badge.className)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
          {badge.label}
        </span>
      </div>

      {/* Date · time · booking */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <span>{formatSessionDay(session.slotStart || session.slotEnd, now)}</span>
        <span>{formatTimeRange(session.slotStart, session.slotEnd)}</span>
        <span>Booking #{session.id}</span>
      </div>

      {/* Message */}
      {showMessageBox && (
        <div className={cn("mt-3 rounded-lg px-3 py-2.5 text-sm text-foreground", messageTone)}>
          {message}
        </div>
      )}

      {session.rescheduleOutcome?.message && isActive && (
        <p className="mt-2 text-xs text-muted-foreground">{session.rescheduleOutcome.message}</p>
      )}

      {completedRecordingLine && (
        <div className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
          <Video className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{completedRecordingLine}</span>
        </div>
      )}

      {/* Mentor's feedback on a completed session */}
      {state === "COMPLETED" && (session.mentorFeedback?.notes?.trim() || typeof session.mentorRating === "number") && (
        <div className="mt-3 space-y-1 rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mentor feedback</p>
          {typeof session.mentorRating === "number" && <p className="text-foreground">Rating: {session.mentorRating}/5</p>}
          {session.mentorFeedback?.notes?.trim() && <p className="text-foreground/80">{session.mentorFeedback.notes}</p>}
          {session.mentorFeedback?.areasOfImprovement?.trim() && (
            <p className="text-foreground/80">To improve: {session.mentorFeedback.areasOfImprovement}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {isActive && (
          <Button
            size="sm"
            asChild={actions.join.allowed && Boolean(joinUrl)}
            disabled={!actions.join.allowed || !joinUrl}
            className="bg-green-800 text-white hover:bg-green-900 dark:bg-green-700 dark:hover:bg-green-600"
          >
            {actions.join.allowed && joinUrl ? (
              <Link href={getSessionJoinHref(session.id, joinUrl, routeContext)} target="_blank" rel="noopener noreferrer">
                Join Session
              </Link>
            ) : (
              <span>Join Session</span>
            )}
          </Button>
        )}

        {showChangeButtons && (
          <>
            {actions.reschedule.allowed ? (
              <Button size="sm" variant="outline" asChild>
                <Link
                  href={getSessionRescheduleHref(session.id, routeContext, {
                    currentSlotId: session.slotAvailabilityId,
                    mentorId: session.mentorUserId,
                  })}
                >
                  Reschedule
                </Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled>Reschedule</Button>
            )}
            {actions.cancel.allowed ? (
              <Button size="sm" variant="outline" asChild>
                <Link href={getSessionCancelHref(session.id, routeContext)}>Cancel</Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled>Cancel</Button>
            )}
          </>
        )}

        {state === "COMPLETED" && (
          <>
            {canViewRecording && (
              <Button size="sm" asChild className="bg-green-800 text-white hover:bg-green-900 dark:bg-green-700 dark:hover:bg-green-600">
                <a href={recordingUrl} target="_blank" rel="noopener noreferrer">View Recording</a>
              </Button>
            )}
            {feedbackGiven ? (
              <span className="text-xs text-muted-foreground">Feedback submitted</span>
            ) : actions.giveFeedback.allowed ? (
              <Button size="sm" variant="outline" onClick={() => onGiveFeedback(session.id)}>
                Give feedback
              </Button>
            ) : null}
          </>
        )}

        {state === "CANCELLED" && (
          <Link
            href={getMentorDrawerHref(session.mentorUserId, routeContext)}
            className="text-sm font-medium text-green-800 hover:underline dark:text-green-400"
          >
            Book again with {mentorName} →
          </Link>
        )}
      </div>
    </div>
  )
}
