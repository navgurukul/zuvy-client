"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils"
import {
  useMyMentorSessions,
  type MyMentorSession,
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

const normalizeSessionValue = (value: string | null | undefined) =>
  (value || "").toLowerCase()

const formatLifecycleValue = (value: string | null | undefined) =>
  (value || "-").replaceAll("_", " ")

const isCancelledSession = (session: MyMentorSession) => {
  const status = normalizeSessionValue(session.status)
  const lifecycle = normalizeSessionValue(session.sessionLifecycleState)

  return status === "cancelled" || lifecycle.includes("cancel")
}

const isCompletedSession = (session: MyMentorSession) => {
  if (isCancelledSession(session)) {
    return false
  }

  const status = normalizeSessionValue(session.status)
  const lifecycle = normalizeSessionValue(session.sessionLifecycleState)

  return status === "completed" || lifecycle === "completed" || session.completedAt !== null
}

const isUpcomingSession = (session: MyMentorSession) =>
  !isCancelledSession(session) && !isCompletedSession(session)

const getMentorAvatarFallback = (mentorUserId: number) =>
  `M${String(mentorUserId).slice(-1)}`

export default function MySessions() {

  const [activeTab, setActiveTab] = useState<Tab>("upcoming")
  const { sessions, loading, error, refetchMySessions } = useMyMentorSessions(
    true,
    "/mentor-sessions/my"
  )

  const upcomingSessions = sessions.filter(isUpcomingSession)
  const completedSessions = sessions.filter(isCompletedSession)
  const cancelledSessions = sessions.filter(isCancelledSession)

  const counts = {
    upcoming: upcomingSessions.length,
    completed: completedSessions.length,
    cancelled: cancelledSessions.length,
  }

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

      <Link
        href="/student"
        className="flex items-center mb-6 gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-xl font-semibold">
            My Sessions
          </h1>

          <p className="text-sm text-muted-foreground">
            {counts.upcoming} upcoming · {sessions.length} total
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
        cancelledSessions.map((session) => (
          <Card key={session.id} className="rounded-2xl border shadow-sm">

            <CardContent className="p-6 space-y-4">

              <div className="flex justify-between">

                <div className="flex gap-3">

                  <Avatar className="bg-green-700 text-white">
                    <AvatarFallback>
                      {getMentorAvatarFallback(session.mentorUserId)}
                    </AvatarFallback>
                  </Avatar>

                  <div>

                    <p className="font-semibold">
                      Mentor {session.mentorUserId}
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
                  Booking #{session.id}
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Clock size={14} />
                  {formatLifecycleValue(session.sessionLifecycleState)}
                </div>

                <div className='text-sm'>{session.status}</div>

              </div>

              <div className="border-t pt-4" />

              <Link
                href={`/student/mentors/${session.mentorUserId}`}
                className="text-green-600 text-sm font-medium flex items-center gap-2"
              >

                <CalendarDays size={16} />

                Book again with Mentor {session.mentorUserId} →

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
        completedSessions.map((session) => (
          <Card key={session.id} className="rounded-2xl border shadow-sm">
            <CardContent className="p-6 rounded-3xl">
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>{getMentorAvatarFallback(session.mentorUserId)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold">Mentor {session.mentorUserId}</p>
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
                  Booking #{session.id}
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Clock size={14} />
                  {formatLifecycleValue(session.sessionLifecycleState)}
                </div>

                <div className="text-sm">{session.status}</div>
              </div>
            </CardContent>
          </Card>
        ))}

      {activeTab === "upcoming" && counts.upcoming > 0 &&
        upcomingSessions.map((session) => (
          <Card key={session.id} className="rounded-3xl">
            <CardContent className="p-6 rounded-3xl">

              <div className="flex justify-between items-start gap-2">

                <div className="flex gap-3">

                  <Avatar>
                    <AvatarFallback>{getMentorAvatarFallback(session.mentorUserId)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold">Mentor {session.mentorUserId}</p>
                    <p className="text-sm text-muted-foreground text-left">
                      Slot {session.slotAvailabilityId}
                    </p>
                  </div>

                </div>

                <span className="inline-flex self-start items-center gap-1.5 px-3 py-2 text-xs font-medium leading-none rounded-full bg-green-100 text-green-700">
                  Upcoming
                </span>

              </div>

              <div className="flex gap-6 text-sm text-muted-foreground mt-3">

                <div className="flex items-center gap-1 text-sm">
                  <Calendar size={14} />
                  Booking {session.id}
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Clock size={14} />
                  {formatLifecycleValue(session.sessionLifecycleState)}
                </div>

                <div className="text-sm">{session.status}</div>

              </div>

              <p className="text-sm text-muted-foreground mt-2 text-left">
                You're all set. We'll remind you before the session.
              </p>

            </CardContent>

            <CardFooter className="flex gap-3">

              <Button className="flex gap-2">
                <Video size={14} />
                Join Session
              </Button>

              <Button variant="outline" asChild>
                <Link href={`/student/sessions/${session.id}/reschedule`}>
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