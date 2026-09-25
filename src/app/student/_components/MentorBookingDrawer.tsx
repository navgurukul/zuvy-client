"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, Check, X } from "lucide-react"
import { Mentor } from "../hooks/hookTypes"
import type { MentorAvailabilitySlot } from "@/hooks/useMentorAvailability"
import { useMentorAvailability } from "@/hooks/useMentorAvailability"
import { useBookMentorSlot } from "@/app/student/hooks/useBookMentorSlot"
import { useMentorProfile } from "@/app/student/hooks/useMentorProfile"
import { useStudentMentorMetrics } from "@/app/student/hooks/useStudentMentorMetrics"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle  } from "@/components/ui/sheet"
import { getSessionsHref } from "@/utils/studentMentorshipRoutes"

type MentorBookingDrawerProps = {
  mentor: Mentor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId?: string
  orgId?: string
}

const formatSlotDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

const formatSlotTime = (value: string) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

const formatSlotRange = (start: string, end?: string) =>
  end ? `${formatSlotTime(start)} - ${formatSlotTime(end)}` : formatSlotTime(start)

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

export default function MentorBookingDrawer({
  mentor,
  open,
  onOpenChange,
  courseId,
  orgId,
}: MentorBookingDrawerProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const [bookedSlotDetails, setBookedSlotDetails] = useState<MentorAvailabilitySlot | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)

  const { mentorProfile } = useMentorProfile(
    mentor?.userId,
    open && !!mentor?.userId,
    mentor?.organizationId
  )

  const { availability, loading, error, refetchMentorAvailability } = useMentorAvailability(
    mentor?.userId,
    open && !!mentor?.userId,
    mentor?.organizationId
  )
  const { isBooking, error: bookingError, bookSlot } = useBookMentorSlot()

  const { metrics, loading: metricsLoading } = useStudentMentorMetrics(Boolean(open && mentor?.userId))

  useEffect(() => {
    if (!open) {
      setSelectedSlotId(null)
      setBookedSlotDetails(null)
      setBookingSuccess(false)
      return
    }

    setSelectedSlotId(null)
    setBookedSlotDetails(null)
  }, [open, mentor?.userId])

  const availableSlots = useMemo(
    () => availability.filter((slot) => slot.status?.toUpperCase() === "AVAILABLE"),
    [availability]
  )

  const bookedSlot = useMemo(
    () => bookedSlotDetails || null,
    [bookedSlotDetails]
  )

  const isAvailable = mentor?.availabilityStatus?.trim().toLowerCase() === "available"
  const profileExpertise = Array.isArray(mentorProfile?.expertise) ? mentorProfile.expertise : []
  const listExpertise = Array.isArray(mentor?.expertise) ? mentor.expertise : []
  const expertise = profileExpertise.length > 0 ? profileExpertise : listExpertise
  const listPastExperiences =
    (mentor as Mentor & { pastExperiences?: string | null })?.pastExperiences || ""
  const pastExperiences = (mentorProfile?.pastExperiences || listPastExperiences || "").trim()
  const aboutText = (mentorProfile?.bio || mentor?.bio || "").trim()
  const initials = mentor ? getInitials(mentor.name) : "M"
  const bookingEligibilityBlocked = Boolean(metrics && metrics.canBook === false)
  const bookingNotYetEligible = Boolean(metrics && metrics.nextEligible && new Date(metrics.nextEligible).getTime() > Date.now())

  const canBook = !!mentor && isAvailable && selectedSlotId !== null && !isBooking && !bookingEligibilityBlocked && !bookingNotYetEligible

  const handleBook = async () => {
    if (selectedSlotId === null) return

    const slotDetails = availability.find((slot) => slot.id === selectedSlotId) || null

    const booking = await bookSlot(selectedSlotId)
    if (!booking) return

    setBookedSlotDetails(slotDetails)
    setSelectedSlotId(null)
    refetchMentorAvailability()
    setBookingSuccess(true)
  }

  const formatEligibleDate = (dateString?: string | null) => {
    if (!dateString) return ""
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return ""

    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" 
      className="w-full !max-w-[500px] overflow-y-auto bg-background p-0 text-foreground"
      >
        {!mentor ? null : (
          <div className="relative flex h-full flex-col">
            {/* Header with mentor info - Hidden when booking success */}
            {!bookingSuccess && (
              <SheetHeader className="border-b border-border px-6 py-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 shrink-0 border border-border">
                    <AvatarFallback className="bg-green-800 text-xs font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-left text-base font-semibold leading-tight text-foreground">
                      {mentor.name}
                    </SheetTitle>
                    <div className="mt-2 flex flex-col gap-1">
                      {mentor.email ? (
                        <p className="text-left text-xs text-muted-foreground">
                          {mentor.email}
                        </p>
                      ) : null}
                      {mentor.orgName ? (
                        <p className="text-left text-xs text-muted-foreground">{mentor.orgName}</p>
                      ) : null}
                    </div>

                    <p className="text-left text-xs text-muted-foreground mt-0.5">
                      {mentor.title || mentor.role || "Mentor"}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isAvailable
                            ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isAvailable ? "Accepting sessions" : "Not available"}
                      </span>
                    </div>
                  </div>
                </div>
              </SheetHeader>
            )}

            {/* Main content */}
            <div className={`flex-1 overflow-y-auto px-6 py-5 transition-all duration-300 ${bookingSuccess ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              {/* Slot selection view */}
              <div className="space-y-5">
                {/* Available Slots */}
                <section>
                  <h3 className="text-left text-sm font-semibold text-foreground mb-2">Available Slots</h3>
                  <p className="text-left text-xs text-muted-foreground mb-3">Select one slot to continue.</p>

                  {loading ? (
                    <p className="text-xs text-muted-foreground">Loading slots...</p>
                  ) : error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
                      {error}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No available slots.</p>
                  ) : (
                    <div className="space-y-2">
                      {availableSlots.map((slot) => {
                        const selected = selectedSlotId === slot.id
                        return (
                          <label
                            key={slot.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                              selected
                                ? "border-green-600 bg-green-50 shadow-sm dark:border-green-500/70 dark:bg-green-950/30"
                                : "border-border bg-card hover:bg-muted/60"
                            }`}
                          >
                            <input
                              type="radio"
                              name="mentor-slot"
                              value={slot.id}
                              checked={selected}
                              onChange={() => setSelectedSlotId(slot.id)}
                              className="mt-0.5 h-5 w-5 shrink-0 dark:appearance-none dark:rounded-full dark:border-2 dark:border-green-500 dark:bg-transparent dark:checked:border-green-500 dark:checked:bg-green-500 dark:focus-visible:outline-none dark:focus-visible:ring-2 dark:focus-visible:ring-green-500 dark:focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
                            />
                            <div className="min-w-0 text-left">
                              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatSlotDate(slot.slotStartDateTime)}
                              </p>
                              <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {formatSlotRange(slot.slotStartDateTime, slot.slotEndDateTime)}
                              </p>
                              {slot.topic ? (
                                <p className="mt-2 text-sm text-muted-foreground">Topic: {slot.topic}</p>
                              ) : null}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </section>

                {/* About */}
                <section className="border-b border-border ">
                  <h3 className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">About</h3>
                  <p className="max-w-full whitespace-pre-wrap break-words text-left text-sm leading-relaxed text-foreground/80 mb-4">
                    {aboutText || "No bio added."}
                  </p>
                </section>

                {/* Expertise */}
                <section className="border-b border-border">
                  <h3 className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Areas of Expertise</h3>
                  {expertise.length ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {expertise.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-md border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-foreground/80 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-left text-sm text-muted-foreground mb-4">No expertise listed.</p>
                  )}
                </section>

                {/* Past Experiences */}
                <section>
                  <h3 className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Past Experiences</h3>
                  <p className="max-w-full whitespace-pre-wrap break-words text-left text-sm leading-relaxed text-foreground/80">
                    {pastExperiences.length > 0 ? pastExperiences : "No experiences added."}
                  </p>
                </section>
              </div>
            </div>

            {/* Success view - Absolute positioned overlay */}
            {bookingSuccess && (
              <div
                className="absolute inset-0 bg-background"
              >
                <div className="flex h-full flex-col">
                  {/* HEADER */}
                  <div className="flex items-center justify-between border-b border-border px-6 py-5">
                    <p className="truncate text-left text-base font-semibold">
                      Session Booked
                    </p>
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-1 flex-col items-center justify-center px-7">
                    {/* SUCCESS ICON */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
                      <Check
                        className="h-11 w-11 text-green-600 dark:text-green-400"
                        strokeWidth={2.5}
                      />
                    </div>

                    {/* TEXT */}
                    <div className="mt-8 text-center">
                      <h6 className="text-1xl font-semibold tracking-[-0.02em] text-foreground">
                        You&apos;re booked!
                      </h6>

                      <p className="mt-4 text-sm leading-8 text-muted-foreground">
                        Your session with{" "}
                        <span className="font-semibold text-foreground">
                          {mentor.name}
                        </span>{" "}
                        is confirmed. You&apos;ll get a reminder
                        before the session.
                      </p>
                    </div>

                    {/* SUMMARY CARD */}
                    <div className="mt-10 w-full space-y-3 rounded-2xl bg-green-50 px-6 py-5 dark:bg-green-950/30">
                      <div className="flex items-center gap-3 border-b border-green-200 pb-3 dark:border-green-800">
                        <p className="text-xs font-medium text-muted-foreground">
                          Mentor
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {mentor.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 border-b border-green-200 pb-3 dark:border-green-800">
                        <p className="text-xs font-medium text-muted-foreground">
                          Date
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {bookedSlotDetails
                            ? formatSlotDate(
                                bookedSlotDetails.slotStartDateTime
                              )
                            : "—"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Time
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {bookedSlotDetails
                            ? formatSlotRange(
                                bookedSlotDetails.slotStartDateTime,
                                bookedSlotDetails.slotEndDateTime
                              )
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* BUTTON */}
                    <Link
                      href={getSessionsHref({ courseId, orgId })}
                      className="mt-4 w-full"
                    >
                      <Button
                        variant="outline"
                        className="
                          h-14
                          w-full
                          rounded-xl
                          border-border
                          text-sm
                          font-semibold
                          hover:bg-muted
                        "
                      >
                        View in My Sessions →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Footer CTA - Hidden when booking success */}
            {!bookingSuccess && (
              <div className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
                <div className="space-y-2">
                  {bookingError ? <p className="text-xs text-red-500 dark:text-red-300">{bookingError}</p> : null}

                  {/* Validation message when user cannot book */}
                  {selectedSlotId !== null && (bookingEligibilityBlocked || bookingNotYetEligible) && (
                    <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-dark dark:border-warning/50 dark:bg-warning/20 dark:text-warning-dark">
                      {bookingEligibilityBlocked ? (
                        <>
                          You have already booked a session. {metrics?.nextEligible ? `Your next booking will be available on ${formatEligibleDate(metrics.nextEligible)}.` : null}
                        </>
                      ) : bookingNotYetEligible ? (
                        <>You can book your next session from  {formatEligibleDate(metrics?.nextEligible || null)}.</>
                      ) : null}
                    </div>
                  )}
                  <Button
                      onClick={handleBook}
                      disabled={!canBook}
                      className="h-10 w-full bg-green-800 text-white text-sm font-medium cursor-pointer hover:bg-green-900 dark:bg-green-600 dark:hover:bg-green-500 disabled:cursor-not-allowed disabled:hover:bg-green-800 dark:disabled:hover:bg-green-600"
                    >
                      {isBooking ? "Booking..." : "Book this Session"}
                    </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
