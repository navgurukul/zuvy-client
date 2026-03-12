"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMentorProfile } from "@/hooks/useMentorProfile";
import {
  useMentorAvailability,
  type MentorAvailabilitySlot,
} from "@/hooks/useMentorAvailability";
import { useBookMentorSlot } from "@/hooks/useBookMentorSlot";

const getMentorId = (idParam: string | string[] | undefined) => {
  if (Array.isArray(idParam)) {
    return idParam[0];
  }

  return idParam;
};

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

export default function BookSessionPage() {
  const params = useParams();
  const mentorId = getMentorId(params["id"] as string | string[] | undefined);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const {
    mentorProfile,
    loading: mentorLoading,
    error: mentorError,
  } = useMentorProfile(mentorId);
  const {
    availability,
    loading: slotsLoading,
    error: slotsError,
    refetchMentorAvailability,
  } = useMentorAvailability(mentorId);
  const { booking, isBooking, error: bookingError, bookSlot } = useBookMentorSlot();

  const selectedSlot = useMemo(
    () => availability.find((slot) => slot.id === selectedSlotId) || null,
    [availability, selectedSlotId]
  );

  const mentorDisplayName = mentorId ? `Mentor ${mentorId}` : "Mentor";
  const initials = getInitials(mentorDisplayName);
  const acceptsNewMentees = mentorProfile?.acceptsNewMentees ?? true;

  const handleBookSlot = async () => {
    if (selectedSlotId === null) {
      return;
    }

    const bookedSlot = await bookSlot(selectedSlotId);
    if (bookedSlot) {
      setSelectedSlotId(null);
      await refetchMentorAvailability();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* Back */}
      <Link
        href={mentorId ? `/student/mentors/${mentorId}` : "/student/mentors"}
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
          <p className="font-semibold text-lg">{mentorDisplayName}</p>
          <p className="text-sm text-gray-500 text-left">
            {mentorProfile?.title || "Mentor"}
          </p>

          {mentorLoading ? (
            <p className="text-xs text-gray-400 text-left">Loading mentor info...</p>
          ) : mentorError ? (
            <p className="text-xs text-red-500 text-left">{mentorError}</p>
          ) : (
            <p className="text-xs text-gray-400 text-left">
              Timezone: {mentorProfile?.timezone || "-"} · Buffer {mentorProfile?.bufferMinutes ?? 0} mins
            </p>
          )}
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
            </div>
          ) : availability.length === 0 ? (
            <div className="border rounded-3xl h-[260px] flex flex-col items-center justify-center text-center bg-white">

              <div className="bg-green-100 p-3 rounded-full mb-3">
                <CalendarDays className="text-green-700" />
              </div>

              <p className="font-medium">No available slots right now</p>

              <p className="text-sm text-gray-500 max-w-sm">
                This mentor hasn't added upcoming availability yet.
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

            <button
              onClick={handleBookSlot}
              disabled={!selectedSlot || isBooking || !acceptsNewMentees}
              className="w-full mt-4 bg-green-800 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBooking ? "Booking..." : "Book Selected Slot"}
            </button>

            {booking && (
              <div className="mt-3 text-left text-xs p-3 rounded-lg bg-green-50 text-green-700 border border-green-100">
                <p className="font-semibold">Booking confirmed</p>
                <p>Status: {booking.status}</p>
                <p>Session state: {booking.sessionLifecycleState}</p>
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