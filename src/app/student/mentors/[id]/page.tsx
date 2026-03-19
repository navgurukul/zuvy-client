"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Star } from "lucide-react";
import { useMentorProfile } from "@/hooks/useMentorProfile";

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

export default function MentorProfilePage() {
  const params = useParams();
  const mentorId = getMentorId(params["id"] as string | string[] | undefined);

  const { mentorProfile, loading, error } = useMentorProfile(mentorId);

  // const mentorDisplayName = mentorId ? `Mentor ${mentorId}` : "Mentor";
const mentorDisplayName =
  mentorProfile?.name || (mentorId ? `Mentor ${mentorId}` : "Mentor");  const initials = getInitials(mentorDisplayName);
  const expertise = mentorProfile?.expertise || [];
  const acceptsNewMentees = mentorProfile?.acceptsNewMentees ?? true;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-sm text-gray-500">Loading mentor profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        <Link
          href="/student/mentors"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to Find Mentors
        </Link>

        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* Back button */}
      <Link
        href="/student/mentors"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to Find Mentors
      </Link>

      {/* Top Card */}
      <div className="flex items-center justify-between border rounded-2xl p-6 bg-white">

        <div className="flex items-center gap-4">
          <div className="h-20 w-20 flex items-center justify-center rounded-full bg-green-800 text-white font-bold">
            {initials}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-left">{mentorDisplayName}</h2>
            <p className="text-sm text-gray-700 text-left">
              {mentorProfile?.title || "Mentor"}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <strong>0.0</strong>rating
              </div>

              <span>0 sessions completed</span>
            </div>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm ${
            acceptsNewMentees
              ? "text-green-700 bg-green-100"
              : "text-gray-600 bg-gray-100"
          }`}
        >
          ● {acceptsNewMentees ? "Accepting sessions" : "Not accepting sessions"}
        </span>

      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left */}
        <div className="lg:col-span-2 space-y-6">

          {/* About */}
          <div className="border rounded-2xl p-6 bg-white text-left">
            <p className="text-sm font-semibold text-gray-500 mb-2">
              ABOUT
            </p>

            {mentorProfile?.bio ? (
              <p className="text-sm text-gray-700">{mentorProfile.bio}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                This mentor has not added a bio yet.
              </p>
            )}
          </div>

          {/* Expertise */}
          <div className="border rounded-2xl p-6 bg-white text-left">
            <p className="text-sm font-semibold text-gray-500 mb-2">
              AREAS OF EXPERTISE
            </p>

            {expertise.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {expertise.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No expertise areas listed.
              </p>
            )}
          </div>

        </div>

        {/* Right */}
        <div className="border rounded-2xl p-6 bg-white space-y-4">

          <p className="text-sm font-semibold text-gray-400 text-left">
            BOOK A SESSION
          </p>

          <p className="text-sm text-green-700 flex items-center gap-2">
            ● {acceptsNewMentees ? "Accepting new sessions" : "Not accepting new sessions"}
          </p>

          <Link
            href={mentorId ? `/student/mentors/${mentorId}/book` : "/student/mentors"}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 ${
              acceptsNewMentees
                ? "bg-green-800 text-white"
                : "bg-gray-300 text-gray-600 pointer-events-none"
            }`}
          >
            <CalendarDays size={16} />
            Book a Session
          </Link>

          <div className="border-t pt-4 text-sm text-gray-500 space-y-1 text-left">
            <p>Timezone: {mentorProfile?.timezone || "-"}</p>
            <p>Buffer: {mentorProfile?.bufferMinutes ?? 0} mins</p>
            <p>Status: {mentorProfile?.status || "-"}</p>
          </div>

          <div className="border-t pt-4  flex justify-between">
            <span className="text-gray-400 text-sm">Rating</span>
            <span className="flex items-center gap-1 text-xs">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              0.0
            </span>
          </div>

          <div className="text-sm flex justify-between">
            <span className="text-gray-400 text-sm">Sessions completed</span>
            <span>0</span>
          </div>

        </div>

      </div>
    </div>
  );
}