"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils"
import {
  useMyMentorSessions,
  type SessionFilter,
} from "@/hooks/useMyMentorSessions"
import {
  CalendarDays,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  Users,
  ArrowLeft
} from "lucide-react"

type Tab = "upcoming" | "completed" | "cancelled"

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

export default function MySessions() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId") || ""
  const [activeTab, setActiveTab] = useState<Tab>("upcoming")

  const { sessions, loading, error, refetchMySessions } = useMyMentorSessions(
    true,
    "/mentor-sessions/my",
    activeTab as SessionFilter
  )

  const { sessions: upcomingSessionsForCount } = useMyMentorSessions(
    true,
    "/mentor-sessions/my",
    "upcoming"
  )

  const { sessions: completedSessionsForCount } = useMyMentorSessions(
    true,
    "/mentor-sessions/my",
    "completed"
  )

  const { sessions: cancelledSessionsForCount } = useMyMentorSessions(
    true,
    "/mentor-sessions/my",
    "cancelled"
  )

  const counts = {
    upcoming: upcomingSessionsForCount.length,
    completed: completedSessionsForCount.length,
    cancelled: cancelledSessionsForCount.length,
  }

  const totalSessions = counts.upcoming + counts.completed + counts.cancelled

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-sm text-muted-foreground">Loading sessions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-3">
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="outline" onClick={refetchMySessions}>
          Retry
        </Button>
      </div>
    )
  }

  return (

    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <Link
                href={courseId ? `/student/course/${courseId}` : "/student"}
                className="flex items-center mb-6 gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
                <ArrowLeft size={16} />
                Back to {courseId ? "course" : "dashboard"}
            </Link>

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-xl font-semibold">
            My Sessions
          </h1>

          <p className="text-sm text-muted-foreground">
            {counts.upcoming} upcoming · {totalSessions} total
          </p>
        </div>
      </div>

      {/* STATS CARDS */}

      <div className="grid grid-cols-3 gap-4">

        <StatCard
          label="Upcoming"
          count={counts.upcoming}
          color="text-blue-600"
          active={activeTab === "upcoming"}
          onClick={() => setActiveTab("upcoming")}
        />

        <StatCard
          label="Completed"
          count={counts.completed}
          color="text-green-600"
          active={activeTab === "completed"}
          onClick={() => setActiveTab("completed")}
        />

        <StatCard
          label="Cancelled"
          count={counts.cancelled}
          color="text-muted-foreground"
          active={activeTab === "cancelled"}
          onClick={() => setActiveTab("cancelled")}
        />

      </div>

      {/* TABS */}

      <div className="flex items-center bg-muted rounded-full p-1 w-fit gap-1">

        <TabButton
          active={activeTab === "upcoming"}
          icon={CalendarDays}
          label="Upcoming"
          count={counts.upcoming}
          onClick={() => setActiveTab("upcoming")}
        />

        <TabButton
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

      {activeTab === "cancelled" && counts.cancelled > 0 &&
        sessions.map((session) => (
          <Card key={session.id} className="rounded-2xl border shadow-sm">

            <CardContent className="p-6 space-y-4">

              <div className="flex justify-between">

                <div className="flex gap-3">

                  <Avatar className="bg-green-700 text-white">
                    <AvatarFallback>
                      {getMentorAvatarFallback(session.mentorName, session.mentorUserId)}
                    </AvatarFallback>
                  </Avatar>

                  <div>

                    <p className="font-semibold">
                      {getMentorDisplayName(session.mentorName, session.mentorUserId)}
                    </p>

                    <p className="text-sm text-muted-foreground text-left">
                      Slot {session.slotAvailabilityId}
                    </p>

                  </div>

                </div>

                <Badge variant="outline">
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
                href={`/student/mentors/${session.mentorUserId}`}
                className="text-green-600 text-sm font-medium flex items-center gap-2"
              >

                <CalendarDays size={16} />

                Book again with {getMentorDisplayName(session.mentorName, session.mentorUserId)} →

              </Link>

            </CardContent>

          </Card>
        ))}

      {activeTab === "cancelled" && counts.cancelled === 0 && (
        <Card className="rounded-3xl border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <XCircle className="h-6 w-6 text-muted-foreground" size={36} />
            <h1 className="font-semibold text-sm">No cancelled sessions</h1>
          </CardContent>
        </Card>
      )}

      {activeTab === "completed" && counts.completed === 0 && (

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

              <Link href="/student/mentors">
                <Users size={16} />

                Book a Session
              </Link>

            </Button>

          </CardContent>

        </Card>

      )}

      {activeTab === "completed" && counts.completed > 0 &&
        sessions.map((session) => (
          <Card key={session.id} className="rounded-2xl border shadow-sm">
            <CardContent className="p-6 rounded-3xl">
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>{getMentorAvatarFallback(session.mentorName, session.mentorUserId)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold">{getMentorDisplayName(session.mentorName, session.mentorUserId)}</p>
                    <p className="text-sm text-muted-foreground">
                      Slot #{session.slotAvailabilityId}
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
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
              </div>
            </CardContent>
          </Card>
        ))}

      {activeTab === "upcoming" && counts.upcoming > 0 &&
        sessions.map((session) => (
          <Card key={session.id} className="rounded-3xl">
            <CardContent className="p-6 rounded-3xl">

              <div className="flex justify-between">

                <div className="flex gap-3">

                  <Avatar>
                    <AvatarFallback>{getMentorAvatarFallback(session.mentorName, session.mentorUserId)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold">{getMentorDisplayName(session.mentorName, session.mentorUserId)}</p>
                    <p className="text-sm text-muted-foreground text-left">
                      Slot {session.slotAvailabilityId}
                    </p>
                  </div>

                </div>

                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
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

            <CardFooter className="flex gap-3">
              <Button
                className="flex gap-2"
                asChild={!!session.meetingLink}
                disabled={!session.meetingLink}
              >
                {session.meetingLink ? (
                  <Link
                    href={`/student/sessions/${session.id}/join?meetingLink=${encodeURIComponent(session.meetingLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video size={14} />
                    Join Session
                  </Link>
                ) : (
                  <>
                    <Video size={14} />
                    Join Unavailable
                  </>
                )}
              </Button>

              <Button variant="outline" asChild>
                <Link
                  href={`/student/sessions/${session.id}/reschedule?currentSlotId=${session.slotAvailabilityId}&mentorId=${session.mentorUserId}`}
                >
                  Reschedule
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href={`/student/sessions/${session.id}/cancel`}>
                  Cancel
                </Link>
              </Button>

            </CardFooter>
          </Card>
        ))}

      {activeTab === "upcoming" && counts.upcoming === 0 && (
        <Card className="rounded-3xl border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <CalendarDays className="h-6 w-6 text-muted-foreground" size={36} />
            <h1 className="font-semibold text-sm">No upcoming sessions</h1>
          </CardContent>
        </Card>
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


/* TAB BUTTON */

function TabButton({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: any) {

  return (

    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition",
        active
          ? "bg-white shadow-sm"
          : "text-muted-foreground"
      )}
    >

      <Icon size={14} />

      {label}

      {count > 0 && (

        <span
          className={cn(
            "text-xs px-2 rounded-full",
            active
              ? "bg-green-700 text-white"
              : "bg-gray-200 text-gray-700"
          )}
        >
          {count}
        </span>

      )}

    </button>

  )
}