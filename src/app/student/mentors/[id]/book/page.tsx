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
        className="flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to profile
      </Link>

      {/* Mentor Header */}
      <div className="border rounded-3xl p-4 flex items-center gap-3 bg-white">
        <div className="h-12 w-12 rounded-full bg-green-800 text-white flex items-center justify-center font-semibold">
          {initials}
        </div>

        <div>
          <p className="font-semibold text-lg text-left">{mentorDisplayName}</p>
          <p className="text-sm text-gray-500 text-left">
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
            <p className="text-sm text-gray-500">
              All times shown are in your local timezone.
            </p>
          </div>

          {slotsLoading ? (
            <div className="border rounded-3xl h-[260px] flex items-center justify-center text-sm text-gray-500 bg-white">
              Loading available slots...
            </div>
          ) : slotsError ? (
            <div className="border rounded-3xl h-[260px] flex flex-col items-center justify-center text-center bg-white p-4 gap-3">
              <p className="text-sm text-red-500">{slotsError}</p>
              <button
                onClick={refetchMentorAvailability}
                className="text-xs border px-3 py-1.5 rounded-full"
              >
                Retry
              </button>

              <p className="font-medium mt-3">No available slots right now</p>

              <p className="text-sm text-gray-500 max-w-sm">
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
                        ? "border-green-700 bg-green-50"
                        : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {slot.topic || "Mentoring Session"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Slot ID: {slot.id}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatSlotDate(slot.slotStartDateTime)}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} />
                          {formatSlotTimeRange(slot)}
                        </p>
                      </div>

                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md whitespace-nowrap">
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
        <div className="border rounded-3xl p-5 space-y-4 h-fit bg-white">

          <p className="text-sm font-semibold text-gray-600 text-left">
            YOUR SELECTION
          </p>

          <div className="border-t pt-6 text-center">

            <div className="mx-auto mb-2 bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">
              <CalendarDays size={18} />
            </div>

            <p className="font-medium text-sm">
              {selectedSlot ? "Slot selected" : "No slot selected"}
            </p>

            {selectedSlot ? (
              <div className="text-xs text-gray-500 space-y-1 mt-2">
                <p>{selectedSlot.topic || "Mentoring Session"}</p>
                <p>Slot ID: {selectedSlot.id}</p>
                <p>{formatSlotDate(selectedSlot.slotStartDateTime)}</p>
                <p>{formatSlotTimeRange(selectedSlot)}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Choose an available time from the list to continue
              </p>
            )}

            {!acceptsNewMentees && (
              <p className="text-xs text-red-500 mt-2">
                This mentor is not accepting new mentees.
              </p>
            )}
            <div className="mt-4 space-y-2">
              {isQuotaExhausted && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  <p className="font-medium">Limit reached</p>
                  <p className="mt-0.5">Book from {formatEligibleDate(metrics?.nextEligible || null)}</p>
                </div>
              )}

              <button
                onClick={handleBookSlot}
                disabled={!selectedSlot || isBooking || !acceptsNewMentees || isQuotaExhausted}
                className="w-full bg-green-800 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBooking ? "Booking..." : "Book Selected Slot"}
              </button>
            </div>

            {booking && (
              <div className="mt-3 text-left text-xs p-3 rounded-lg bg-green-50 text-green-700 border border-green-100">
                <p className="font-semibold">Booking confirmed</p>
                <p>Status: {booking.status}</p>
              </div>
            )}

            {bookingError && (
              <p className="text-xs text-red-500 mt-3 text-left">{bookingError}</p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}