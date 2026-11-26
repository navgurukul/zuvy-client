"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Skeleton } from "@/components/ui/skeleton"
import MentorshipTabs from "@/app/student/_components/MentorshipTabs"
import MentorSessionCard, { getSessionDisplayState } from "@/app/student/_components/MentorSessionCard"
import { cn } from "@/lib/utils"
import {
  useMyMentorSessions,
  type MyMentorSession,
  type SessionDisplayState,
  type SessionFilter,
} from "@/hooks/useMyMentorSessions"
import {
  CalendarDays,
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
  Star,
  RefreshCw,
  CircleSlash,
  type LucideIcon,
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
import { useSubmitStudentFeedback } from "@/app/student/hooks/useSubmitStudentFeedback"
import { getMentorsHref } from "@/utils/studentMentorshipRoutes"

type Tab = "all" | "upcoming" | "reschedule" | "completed" | "cancelled" | "missed"

// Upcoming and Reschedule requested both come from the API's `upcoming` filter
// (it includes sessions with a reschedule pending) and are split by displayState.
const RESCHEDULE_STATES: SessionDisplayState[] = ["RESCHEDULE_REQUESTED"]

const TABS: { key: Tab; label: string; icon: LucideIcon; id?: string; emptyTitle: string; emptyText?: string }[] = [
  { key: "all", label: "All", icon: Calendar, id: "tour-all-sessions", emptyTitle: "No sessions yet", emptyText: "Your sessions will appear here once you book them." },
  { key: "upcoming", label: "Upcoming", icon: CalendarDays, id: "tour-upcoming-sessions", emptyTitle: "No upcoming sessions" },
  { key: "reschedule", label: "Reschedule requested", icon: RefreshCw, emptyTitle: "No reschedule requests" },
  { key: "completed", label: "Completed", icon: CheckCircle2, id: "tour-completed-sessions", emptyTitle: "No completed sessions yet", emptyText: "Your completed sessions will appear here after you attend them." },
  { key: "cancelled", label: "Cancelled", icon: XCircle, emptyTitle: "No cancelled sessions" },
  { key: "missed", label: "Missed", icon: CircleSlash, emptyTitle: "No missed sessions" },
]

// "20 Nov 2026"
const formatCreditDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
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
  const [locallySubmittedFeedbackIds, setLocallySubmittedFeedbackIds] = useState<Record<number, true>>({})

  const { isSubmitting, error: submitError, submitFeedback } = useSubmitStudentFeedback()

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTimestamp(Date.now())
    }, 30 * 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const isUpcomingGroupTab = activeTab === "upcoming" || activeTab === "reschedule"

  // Sessions for the All / Completed / Cancelled / Missed tabs
  const {
    sessions: filteredSessions,
    counts,
    credits,
    rules,
    loading: filteredLoading,
    error: filteredError,
    refetchMySessions: refetchFiltered,
  } = useMyMentorSessions(
    !isUpcomingGroupTab,
    "/student/mentor-sessions/my",
    activeTab as SessionFilter
  )

  // Upcoming sessions: the Upcoming and Reschedule requested tabs, and the reschedule count
  const {
    sessions: upcomingGroupSessions,
    counts: upcomingGroupCounts,
    credits: upcomingGroupCredits,
    rules: upcomingGroupRules,
    loading: upcomingLoading,
    error: upcomingError,
    refetchMySessions: refetchUpcoming,
  } = useMyMentorSessions(true, "/student/mentor-sessions/my", "upcoming")

  const isRescheduleSession = (session: MyMentorSession) =>
    RESCHEDULE_STATES.includes(getSessionDisplayState(session, nowTimestamp))

  const rescheduleSessions = useMemo(
    () => upcomingGroupSessions.filter(isRescheduleSession),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [upcomingGroupSessions, nowTimestamp]
  )
  const upcomingSessions = useMemo(
    () => upcomingGroupSessions.filter((session) => !isRescheduleSession(session)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [upcomingGroupSessions, nowTimestamp]
  )

  // Counts are the same in every response; prefer the latest one we have
  const allCounts = Object.keys(counts).length > 0 ? counts : upcomingGroupCounts
  const tabCounts: Record<Tab, number> = {
    all: Number(allCounts.total) || 0,
    upcoming: Math.max((Number(allCounts.upcoming) || 0) - rescheduleSessions.length, upcomingSessions.length),
    reschedule: rescheduleSessions.length,
    completed: Number(allCounts.completed) || 0,
    cancelled: Number(allCounts.cancelled) || 0,
    missed: Number(allCounts.missed) || 0,
  }

  const visibleSessions =
    activeTab === "upcoming" ? upcomingSessions
      : activeTab === "reschedule" ? rescheduleSessions
        : filteredSessions
  const loading = isUpcomingGroupTab ? upcomingLoading : filteredLoading
  const error = isUpcomingGroupTab ? upcomingError : filteredError
  const studentCredits = credits ?? upcomingGroupCredits
  const noticeHours = (rules ?? upcomingGroupRules)?.noticeHours
  const activeTabConfig = TABS.find((tab) => tab.key === activeTab) ?? TABS[0]

  const refetchAll = () => {
    refetchUpcoming()
    if (!isUpcomingGroupTab) refetchFiltered()
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackBookingId) return

    const success = await submitFeedback(feedbackBookingId, {
      rating: tempRating,
      feedback: tempFeedback,
      notes: tempFeedback,
    })

    if (success) {
      setLocallySubmittedFeedbackIds((prev) => ({ ...prev, [feedbackBookingId]: true }))
      toast.success({
        title: "Feedback Submitted",
        description: "Your feedback has been submitted successfully.",
      })
      setFeedbackBookingId(null)
      refetchAll()
    }
  }

  const openFeedback = (bookingId: number) => {
    setFeedbackBookingId(bookingId)
    setTempRating(5)
    setTempFeedback("")
  }

  const nextBookingOpens = formatCreditDate(studentCredits?.nextEligibleDate)

  return (
    <div className="max-w-[90rem] mx-auto p-4 sm:p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-semibold text-left text-foreground">Mentorship</h1>
      </div>

      <MentorshipTabs courseId={courseId} orgId={orgId} />

      {/* Credits */}
      {studentCredits && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm">
          <span>
            <span className="font-semibold text-foreground">Credits:</span>{" "}
            <span className="text-muted-foreground">
              {studentCredits.creditsLeft} of {studentCredits.creditsAssigned} left
            </span>
          </span>
          <span>
            <span className="font-semibold text-foreground">Used:</span>{" "}
            <span className="text-muted-foreground">{studentCredits.creditsUsed}</span>
          </span>
          {nextBookingOpens && (
            <span>
              <span className="font-semibold text-foreground">Next booking opens:</span>{" "}
              <span className="text-muted-foreground">{nextBookingOpens}</span>
            </span>
          )}
        </div>
      )}

      {/* TABS */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
        <div className="flex w-max items-center gap-3 rounded-full p-1 lg:w-auto lg:flex-wrap">
          {TABS.map((tab) => (
            <TabButton
              key={tab.key}
              id={tab.id}
              active={activeTab === tab.key}
              icon={tab.icon}
              label={tab.label}
              count={tabCounts[tab.key]}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>
      </div>

      {/* SESSION CARDS */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="space-y-3 rounded-2xl border bg-card p-6">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={refetchAll}>
            Retry
          </Button>
        </div>
      ) : visibleSessions.length === 0 ? (
        <Card className="rounded-3xl border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <activeTabConfig.icon className="h-6 w-6 text-muted-foreground" />
            <h2 className="font-semibold text-sm">{activeTabConfig.emptyTitle}</h2>
            {activeTabConfig.emptyText && (
              <p className="text-sm text-muted-foreground max-w-sm">{activeTabConfig.emptyText}</p>
            )}
            {(activeTab === "all" || activeTab === "completed") && (
              <Button className="mt-4 text-sm text-primary-foreground px-5 py-2 rounded-lg flex items-center gap-2" asChild>
                <Link href={getMentorsHref(routeContext)}>
                  <Users size={16} />
                  Book a Session
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visibleSessions.map((session) => (
            <MentorSessionCard
              key={session.id}
              session={session}
              now={nowTimestamp}
              noticeHours={noticeHours}
              routeContext={routeContext}
              onGiveFeedback={openFeedback}
              feedbackSubmittedLocally={Boolean(locallySubmittedFeedbackIds[session.id])}
            />
          ))}
        </div>
      )}

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
                <p className="text-sm font-medium text-foreground">Rating</p>
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
                              : "text-muted-foreground"
                          }
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <p className="text-sm font-medium text-foreground">Feedback / Notes</p>
                <Textarea
                  placeholder="Share details about what went well and areas for improvement..."
                  value={tempFeedback}
                  onChange={(e) => setTempFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {submitError && (
                <p className="text-xs text-destructive text-left">{submitError}</p>
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
                className="bg-primary hover:bg-primary-dark text-primary-foreground font-medium"
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

function TabButton({
  id,
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  id?: string
  icon: LucideIcon
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={cn(
        "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-muted-foreground border-border hover:bg-muted"
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
              : "bg-muted text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}
