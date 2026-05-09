"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, Check, X } from "lucide-react"
import type { Mentor } from "@/hooks/useMentors"
import type { MentorAvailabilitySlot } from "@/hooks/useMentorAvailability"
import { useMentorAvailability } from "@/hooks/useMentorAvailability"
import { useBookMentorSlot } from "@/hooks/useBookMentorSlot"
import { useMentorProfile } from "@/hooks/useMentorProfile"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type MentorBookingDrawerProps = {
  mentor: Mentor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId?: string
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
}: MentorBookingDrawerProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const [bookedSlotDetails, setBookedSlotDetails] = useState<MentorAvailabilitySlot | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)

  const { mentorProfile } = useMentorProfile(mentor?.userId, open && !!mentor?.userId)

  const { availability, loading, error, refetchMentorAvailability } = useMentorAvailability(
    mentor?.userId,
    open && !!mentor?.userId
  )
  const { isBooking, error: bookingError, bookSlot } = useBookMentorSlot()

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
  const canBook = !!mentor && isAvailable && selectedSlotId !== null && !isBooking

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full !max-w-[550px] overflow-y-auto p-0">
        {!mentor ? null : (
          <div className="relative flex h-full flex-col">
            {/* Header with mentor info - Hidden when booking success */}
            {!bookingSuccess && (
              <SheetHeader className="border-b border-gray-200 px-6 py-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 shrink-0 border border-gray-300">
                    <AvatarFallback className="bg-green-800 text-xs font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-left text-base font-semibold text-gray-900 leading-tight">
                      {mentor.name}
                    </SheetTitle>
                    <p className="text-left text-xs text-gray-600 mt-0.5">
                      {mentor.title || mentor.role || "Mentor"}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
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
                  <h3 className="text-left text-sm font-semibold text-gray-900 mb-2">Available Slots</h3>
                  <p className="text-left text-xs text-gray-500 mb-3">Select one slot to continue.</p>

                  {loading ? (
                    <p className="text-xs text-gray-500">Loading slots...</p>
                  ) : error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600">
                      {error}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-xs text-gray-500">No available slots.</p>
                  ) : (
                    <div className="space-y-2">
                      {availableSlots.map((slot) => {
                        const selected = selectedSlotId === slot.id
                        return (
                          <label
                            key={slot.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                              selected
                                ? "border-green-600 bg-green-50 shadow-sm"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="mentor-slot"
                              value={slot.id}
                              checked={selected}
                              onChange={() => setSelectedSlotId(slot.id)}
                              className="mt-0.5 h-5 w-5 shrink-0"
                            />
                            <div className="min-w-0 text-left">
                              <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                {formatSlotDate(slot.slotStartDateTime)}
                              </p>
                              <p className="mt-1.5 flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4 text-gray-500" />
                                {formatSlotRange(slot.slotStartDateTime, slot.slotEndDateTime)}
                              </p>
                              {slot.topic ? (
                                <p className="mt-2 text-sm text-gray-500">Topic: {slot.topic}</p>
                              ) : null}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </section>

                {/* About */}
                <section className="border-b border-gray-200 ">
                  <h3 className="text-left text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">About</h3>
                  <p className="max-w-full whitespace-pre-wrap break-words text-left text-sm leading-relaxed text-gray-700 mb-4">
                    {aboutText || "No bio added."}
                  </p>
                </section>

                {/* Expertise */}
                <section className="border-b border-gray-200">
                  <h3 className="text-left text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Areas of Expertise</h3>
                  {expertise.length ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {expertise.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700 border border-gray-200 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-left text-sm text-gray-500 mb-4">No expertise listed.</p>
                  )}
                </section>

                {/* Past Experiences */}
                <section>
                  <h3 className="text-left text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Past Experiences</h3>
                  <p className="max-w-full whitespace-pre-wrap break-words text-left text-sm leading-relaxed text-gray-700">
                    {pastExperiences.length > 0 ? pastExperiences : "No experiences added."}
                  </p>
                </section>
              </div>
            </div>

            {/* Success view - Absolute positioned overlay */}
            {bookingSuccess && (
              <div
                className="absolute inset-0 bg-white"
              >
                <div className="flex h-full flex-col">
                  {/* HEADER */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <p className="truncate text-left text-base font-semibold">
                      Session Booked
                    </p>
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-1 flex-col items-center justify-center px-7">
                    {/* SUCCESS ICON */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e7f5eb]">
                      <Check
                        className="h-11 w-11 text-[#16a34a]"
                        strokeWidth={2.5}
                      />
                    </div>

                    {/* TEXT */}
                    <div className="mt-8 text-center">
                      <h6 className="text-1xl font-semibold tracking-[-0.02em] text-gray-900">
                        You're booked!
                      </h6>

                      <p className="mt-4 text-sm leading-8 text-gray-600">
                        Your session with{" "}
                        <span className="font-semibold text-gray-900">
                          {mentor.name}
                        </span>{" "}
                        is confirmed. You'll get a reminder
                        before the session.
                      </p>
                    </div>

                    {/* SUMMARY CARD */}
                    <div className="mt-10 w-full rounded-2xl bg-[#eef7ee] px-6 py-5 space-y-3">
                      <div className="flex items-center gap-3 border-b border-[#d7e8d7] pb-3">
                        <p className="text-xs font-medium text-gray-600">
                          Mentor
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {mentor.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 border-b border-[#d7e8d7] pb-3">
                        <p className="text-xs font-medium text-gray-600">
                          Date
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {bookedSlotDetails
                            ? formatSlotDate(
                                bookedSlotDetails.slotStartDateTime
                              )
                            : "—"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="text-xs font-medium text-gray-600">
                          Time
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
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
                      href={
                        courseId
                          ? `/student/sessions?courseId=${courseId}`
                          : "/student/sessions"
                      }
                      className="mt-4 w-full"
                    >
                      <Button
                        variant="outline"
                        className="
                          h-14
                          w-full
                          rounded-xl
                          border-gray-200
                          text-sm
                          font-semibold
                          hover:bg-gray-50
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
              <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
                <div className="space-y-2">
                  {bookingError ? <p className="text-xs text-red-500">{bookingError}</p> : null}
                  <Button
                    onClick={handleBook}
                    disabled={!canBook}
                    className="h-10 w-full bg-green-800 text-white hover:bg-green-900 text-sm font-medium"
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
