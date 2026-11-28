"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Check, Info, AlertCircle } from "lucide-react"
import { Mentor } from "../hooks/hookTypes"
import type { MentorAvailabilitySlot } from "@/hooks/useMentorAvailability"
import { useMentorAvailability } from "@/hooks/useMentorAvailability"
import { useBookMentorSlot } from "@/app/student/hooks/useBookMentorSlot"
import { useMentorProfile } from "@/app/student/hooks/useMentorProfile"
import { useStudentMentorMetrics } from "@/app/student/hooks/useStudentMentorMetrics"
import { useMentorBookingPreview } from "@/app/student/hooks/useMentorBookingPreview"
import BookSlotErrorAlert from "@/app/student/_components/BookSlotErrorAlert"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle  } from "@/components/ui/sheet"
import { getSessionsHref } from "@/utils/studentMentorshipRoutes"
import { formatGapPhrase } from "@/utils/mentorshipRules"

type MentorBookingDrawerProps = {
  mentor: Mentor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId?: string
  orgId?: string
  /** rules.noticeHours from GET /student/mentorship/eligibility; slots closer than this aren't listed */
  noticeHours?: number
  /** rules.gapDays from GET /student/mentorship/eligibility; days between a student's sessions */
  gapDays?: number
  /** Called after a successful booking so the page can refresh credits and mentor counts */
  onBooked?: () => void
}


// Turns email addresses inside API text (e.g. "email team@zuvy.org") into mailto links
const EMAIL_PATTERN = /([\w.+-]+@[\w-]+\.[\w.-]+)/g
const renderWithEmailLinks = (text: string) =>
  text.split(EMAIL_PATTERN).map((part, index) =>
    index % 2 === 1 ? (
      <a key={index} href={`mailto:${part}`} className="hover:underline">
        {part}
      </a>
    ) : (
      part
    )
  )

// e.g. "Fri, 6 Nov 2026"
const formatSlotDate = (value: string | Date) => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" })
  const rest = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  return `${weekday}, ${rest}`
}

// e.g. "20 Nov 2026"
const formatShortDate = (value: string | Date) => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

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
  noticeHours,
  gapDays,
  onBooked,
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
  const { isBooking, errorInfo: bookingError, clearError: clearBookingError, bookSlot } = useBookMentorSlot()

  const { metrics, loading: metricsLoading } = useStudentMentorMetrics(Boolean(open && mentor?.userId))

  useEffect(() => {
    clearBookingError()
    if (!open) {
      setSelectedSlotId(null)
      setBookedSlotDetails(null)
      setBookingSuccess(false)
      return
    }

    setSelectedSlotId(null)
    setBookedSlotDetails(null)
  }, [open, mentor?.userId, clearBookingError])

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


  const selectedSlot = useMemo(
    () => availableSlots.find((slot) => slot.id === selectedSlotId) || null,
    [availableSlots, selectedSlotId]
  )

  // Booking preview: the selected slot, or the first slot so "Good to know" shows before a pick
  const previewSlotId = selectedSlotId ?? availableSlots[0]?.id ?? null
  const { preview, loading: previewLoading } = useMentorBookingPreview(
    previewSlotId,
    open && !bookingSuccess && previewSlotId !== null
  )
  const goodToKnow = preview?.goodToKnow ?? []
  // Preview answers that belong to the slot the student picked
  const selectedPreview =
    preview && selectedSlotId !== null && Number(preview.slot?.id) === selectedSlotId ? preview : null
  const previewBlockedMessage =
    selectedPreview && !selectedPreview.canBook ? selectedPreview.blocked?.message || "You can't book this slot." : null
  const remainingCredits = typeof metrics?.remainingCredits === "number" ? metrics.remainingCredits : null
  const creditsLeftAfter = remainingCredits !== null ? Math.max(remainingCredits - 1, 0) : null
  // Used only when the booking preview hasn't answered; the gap is the backend's rules.gapDays
  const nextBookingOpensOn = useMemo(() => {
    if (!selectedSlot || typeof gapDays !== "number") return null
    const start = new Date(selectedSlot.slotStartDateTime)
    if (Number.isNaN(start.getTime())) return null
    start.setDate(start.getDate() + gapDays)
    return start
  }, [selectedSlot, gapDays])
  const gapPhrase = formatGapPhrase(gapDays)
  const canBook = selectedPreview
    ? !!mentor && isAvailable && !isBooking && selectedPreview.canBook
    : !!mentor && isAvailable && selectedSlotId !== null && !isBooking && !previewLoading && !bookingEligibilityBlocked && !bookingNotYetEligible
  const subtitle = [mentor?.title || mentor?.role || "Mentor", mentor?.orgName].filter(Boolean).join(" · ")

  const handleBook = async () => {
    if (selectedSlotId === null) return

    const slotDetails = availability.find((slot) => slot.id === selectedSlotId) || null

    const booking = await bookSlot(selectedSlotId)
    if (!booking) {
      // Refused (see BookSlotErrorAlert): drop the pick and reload the slots
      setSelectedSlotId(null)
      refetchMentorAvailability()
      return
    }

    setBookedSlotDetails(slotDetails)
    setSelectedSlotId(null)
    refetchMentorAvailability()
    setBookingSuccess(true)
    onBooked?.()
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
              <SheetHeader className="border-b border-border px-6 py-5 pr-20">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-green-800 text-xs font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-left text-base font-semibold leading-tight text-foreground">
                      {mentor.name}
                    </SheetTitle>
                    <p className="mt-1 truncate text-left text-xs text-muted-foreground">
                      {subtitle}
                    </p>
                    <span
                      className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        isAvailable
                          ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isAvailable ? "Available" : "Not available"}
                    </span>
                  </div>
                </div>
              </SheetHeader>
            )}

            {/* Main content */}
            <div className={`flex-1 overflow-y-auto px-6 py-5 transition-all duration-300 ${bookingSuccess ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="space-y-5">
                {/* Available Slots */}
                <section>
                  <h3 className="text-left text-sm font-semibold text-foreground">Available Slots</h3>
                  <p className="mt-1 mb-3 text-left text-xs text-muted-foreground">
                    Select one slot.{typeof noticeHours === "number" ? <> Slots starting in under {noticeHours} hours aren&apos;t shown.</> : null}
                  </p>

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
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                              selected
                                ? "border-green-700 bg-green-50 dark:border-green-500/70 dark:bg-green-950/30"
                                : "border-border bg-card hover:bg-muted/60"
                            }`}
                          >
                            <input
                              type="radio"
                              name="mentor-slot"
                              value={slot.id}
                              checked={selected}
                              onChange={() => {
                                setSelectedSlotId(slot.id)
                                clearBookingError()
                              }}
                              className="h-4 w-4 shrink-0 accent-green-800 dark:accent-green-500"
                            />
                            <div className="min-w-0 text-left">
                              <p className="text-sm font-medium text-foreground">
                                {formatSlotDate(slot.slotStartDateTime)}
                              </p>
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {formatSlotRange(slot.slotStartDateTime, slot.slotEndDateTime)}
                              </p>
                              {slot.topic ? (
                                <p className="mt-0.5 text-xs text-muted-foreground">Topic: {slot.topic}</p>
                              ) : null}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </section>

                {/* Credit summary - shown once a slot is selected */}
                {selectedSlot && selectedPreview?.impact ? (
                  <section className="rounded-lg bg-green-50 px-4 py-3 dark:bg-green-950/30">
                    <p className="text-left text-sm font-semibold text-foreground">
                      {selectedPreview.impact.summary}
                    </p>
                    {selectedPreview.impact.detail ? (
                      <p className="mt-1 text-left text-xs text-muted-foreground">
                        {selectedPreview.impact.detail}
                      </p>
                    ) : null}
                  </section>
                ) : selectedSlot && !selectedPreview && !previewLoading && !metricsLoading && (
                  <section className="rounded-lg bg-green-50 px-4 py-3 dark:bg-green-950/30">
                    <p className="text-left text-sm font-semibold text-foreground">
                      {creditsLeftAfter !== null
                        ? `Uses 1 credit, ${creditsLeftAfter} left after this`
                        : "Uses 1 credit"}
                    </p>
                    {nextBookingOpensOn ? (
                      <p className="mt-1 text-left text-xs text-muted-foreground">
                        Your next booking opens on {formatShortDate(nextBookingOpensOn)}{gapPhrase ? `, ${gapPhrase} after this session` : ""}.
                      </p>
                    ) : null}
                  </section>
                )}

                {/* Good to know */}
                <section className="border-b border-border pb-4">
                  <h3 className="mb-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Good to know</h3>
                  {previewLoading && goodToKnow.length === 0 ? (
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((item) => (
                        <div key={item} className="h-4 w-full animate-pulse rounded bg-muted" />
                      ))}
                    </div>
                  ) : goodToKnow.length === 0 ? (
                    <p className="text-left text-xs text-muted-foreground">
                      {availableSlots.length === 0 ? "Shown when the mentor has open slots." : "Couldn't load the booking rules."}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {goodToKnow.map((item) => (
                        <li key={item.text} className="flex items-start gap-2 text-left text-xs text-foreground/80">
                          {item.tone === "warning" ? (
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
                          ) : (
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/70" />
                          )}
                          <span>{renderWithEmailLinks(item.text)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* About */}
                <section className="border-b border-border pb-4">
                  <h3 className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">About</h3>
                  <p className="max-w-full whitespace-pre-wrap break-words text-left text-sm leading-relaxed text-foreground/80">
                    {aboutText || "No bio added."}
                  </p>
                </section>

                {/* Expertise */}
                <section className="border-b border-border pb-4">
                  <h3 className="mb-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Expertise</h3>
                  {expertise.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {expertise.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-left text-xs text-muted-foreground">No expertise listed.</p>
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
                  {bookingError ? <BookSlotErrorAlert error={bookingError} /> : null}

                  {/* Validation message when user cannot book */}
                  {bookingError ? null : previewBlockedMessage ? (
                    <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-left text-sm text-warning-dark dark:border-warning/50 dark:bg-warning/20 dark:text-warning-dark">
                      {previewBlockedMessage}
                    </div>
                  ) : !selectedPreview && selectedSlotId !== null && (bookingEligibilityBlocked || bookingNotYetEligible) && (
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
                      {isBooking ? "Booking..." : "Book Session"}
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
