"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMentorProfile } from "@/app/student/hooks/useMentorProfile";
import {
  useMentorAvailability,
  type MentorAvailabilitySlot,
} from "@/hooks/useMentorAvailability";
import { useBookMentorSlot } from "@/app/student/hooks/useBookMentorSlot";
import { useStudentMentorMetrics } from "@/app/student/hooks/useStudentMentorMetrics";
import { getMentorProfileHref, getMentorsHref } from "@/utils/studentMentorshipRoutes";
import { getMentorId } from "@/utils/mentorUtils";

const getInitials = (label: string) =>
  label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatSlotDate = (dateTime: string) =>
  new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatSlotTimeRange = (slot: MentorAvailabilitySlot) => {
  const start = new Date(slot.slotStartDateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const end = new Date(slot.slotEndDateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${start} — ${end}`;
};

const formatEligibleDate = (dateString: string | null): string => {
  if (!dateString) return "Soon";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function BookSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const mentorId = getMentorId(params["id"] as string | string[] | undefined);
  const courseId = searchParams.get("courseId") || "";
  const orgId = searchParams.get("orgId") || "";
  const organizationId = searchParams.get("organizationId") || orgId || undefined;
  const routeContext = { courseId, orgId };
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const {
    mentorProfile,
    loading: mentorLoading,
    error: mentorError,
  } = useMentorProfile(mentorId, true, organizationId);
  const {
    availability,
    loading: slotsLoading,
    error: slotsError,
    refetchMentorAvailability,
  } = useMentorAvailability(mentorId, true, organizationId);
  const { booking, isBooking, error: bookingError, bookSlot } = useBookMentorSlot();
  const { metrics, refetchStudentMentorMetrics } = useStudentMentorMetrics(true);

  const selectedSlot = useMemo(
    () => availability.find((slot) => slot.id === selectedSlotId) || null,
    [availability, selectedSlotId]
  );

  const mentorDisplayName =
    mentorProfile?.name?.trim() || (mentorId ? `Mentor ${mentorId}` : "Mentor");
  const initials = getInitials(mentorDisplayName);
  const acceptsNewMentees = mentorProfile?.acceptsNewMentees ?? true;
  const isQuotaExhausted = metrics?.isQuotaExhausted ?? false;
  const cannotBook = metrics
    ? (
        metrics.canBook === false ||
        (typeof metrics.remainingCredits === 'number' && metrics.remainingCredits <= 0) ||
        (metrics.nextEligible && new Date(metrics.nextEligible) > new Date())
      )
    : false;

  const handleBookSlot = async () => {
    if (selectedSlotId === null) {
      return;
    }

    if (cannotBook) return;

    const bookedSlot = await bookSlot(selectedSlotId);
    if (bookedSlot) {
      setSelectedSlotId(null);
      await refetchMentorAvailability();
      await refetchStudentMentorMetrics();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* Back */}
      <Link
        href={mentorId ? getMentorProfileHref(mentorId, routeContext) : getMentorsHref(routeContext)}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to profile
      </Link>

      {/* Mentor Header */}
      <div className="flex items-center gap-3 rounded-3xl border bg-card p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          {initials}
        </div>

        <div>
          <p className="font-semibold text-lg text-left">{mentorDisplayName}</p>
          <p className="text-left text-sm text-muted-foreground">
            {mentorProfile?.title || "Mentor"}
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side */}
        <div className="lg:col-span-2 space-y-4">

          <div className="text-left">
            <p className="font-semibold text-lg">Select a time slot</p>
            <p className="text-sm text-muted-foreground">
              All times shown are in your local timezone.
            </p>
          </div>

          {slotsLoading ? (
            <div className="flex h-[260px] items-center justify-center rounded-3xl border bg-card text-sm text-muted-foreground">
              Loading available slots...
            </div>
          ) : slotsError ? (
            <div className="flex h-[260px] flex-col items-center justify-center gap-3 rounded-3xl border bg-card p-4 text-center">
              <p className="text-sm text-destructive">{slotsError}</p>
              <button
                onClick={refetchMentorAvailability}
                className="text-xs border px-3 py-1.5 rounded-full"
              >
                Retry
              </button>

              <p className="font-medium mt-3">No available slots right now</p>

              <p className="max-w-sm text-sm text-muted-foreground">
                This mentor hasn&apos;t added upcoming availability yet.
                Check back soon or explore other mentors.
              </p>

            </div>
          ) : (
            <div className="space-y-3">
              {availability.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const availableCapacity = slot.maxCapacity - slot.currentBookedCount;

                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full border rounded-2xl p-4 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary-light"
                        : "border-border bg-card hover:border-primary"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {slot.topic || "Mentoring Session"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Slot ID: {slot.id}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatSlotDate(slot.slotStartDateTime)}
                        </p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock size={14} />
                          {formatSlotTimeRange(slot)}
                        </p>
                      </div>

                      <span className="whitespace-nowrap rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {availableCapacity} spot{availableCapacity === 1 ? "" : "s"} left
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Side */}
        <div className="h-fit space-y-4 rounded-3xl border bg-card p-5">

          <p className="text-left text-sm font-semibold text-muted-foreground">
            YOUR SELECTION
          </p>

          <div className="border-t pt-6 text-center">

            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <CalendarDays size={18} />
            </div>

            <p className="font-medium text-sm">
              {selectedSlot ? "Slot selected" : "No slot selected"}
            </p>

            {selectedSlot ? (
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>{selectedSlot.topic || "Mentoring Session"}</p>
                <p>Slot ID: {selectedSlot.id}</p>
                <p>{formatSlotDate(selectedSlot.slotStartDateTime)}</p>
                <p>{formatSlotTimeRange(selectedSlot)}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Choose an available time from the list to continue
              </p>
            )}

            {!acceptsNewMentees && (
              <p className="mt-2 text-xs text-destructive">
                This mentor is not accepting new mentees.
              </p>
            )}
            <div className="mt-4 space-y-2">
              {isQuotaExhausted && (
                <div className="rounded-lg border border-destructive/30 bg-destructive-light p-2 text-xs text-destructive-dark dark:bg-destructive-dark dark:text-destructive-foreground">
                  <p className="font-medium">Limit reached</p>
                  <p className="mt-0.5">Book from {formatEligibleDate(metrics?.nextEligible || null)}</p>
                </div>
              )}

              <button
                onClick={handleBookSlot}
                disabled={!selectedSlot || isBooking || !acceptsNewMentees || isQuotaExhausted}
                className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBooking ? "Booking..." : "Book Selected Slot"}
              </button>
            </div>

            {booking && (
              <div className="mt-3 rounded-lg border border-success/30 bg-success-light p-3 text-left text-xs text-success-dark dark:bg-success-dark dark:text-success-foreground">
                <p className="font-semibold">Booking confirmed</p>
                <p>Status: {booking.status}</p>
              </div>
            )}

            {bookingError && (
              <p className="mt-3 text-left text-xs text-destructive">{bookingError}</p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}