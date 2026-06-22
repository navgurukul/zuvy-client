"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, CalendarDays, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/utils/axios.config";
import { useMentorProfile } from "@/hooks/useMentorProfile";
import { getMentorBookHref, getMentorsHref } from "@/utils/studentMentorshipRoutes";

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
  const searchParams = useSearchParams();
  const mentorId = getMentorId(params["id"] as string | string[] | undefined);
  const courseId = searchParams.get("courseId") || "";
  const orgId = searchParams.get("orgId") || "";
  const organizationId = searchParams.get("organizationId") || orgId || undefined;
  const routeContext = { courseId, orgId };
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || localStorage.getItem("token")
      : null

  const { mentorProfile, loading, error } = useMentorProfile(mentorId, true, organizationId);


  const handleGoogleConnect = () => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")

    if (!token) {
      toast.error({
        title: "Error",
        description: "Token not found. Please login again.",
      })
      return
    }

    setIsGoogleConnecting(true)

    // ✅ Direct redirect wi/mentor-sessions/myth token (THIS IS THE FIX)
    const currentPage = encodeURIComponent(window.location.href)

    const API_BASE = process.env.NEXT_PUBLIC_MAIN_URL;

    window.location.href =
      `${API_BASE}/google/connect?token=${token}&redirectUrl=${currentPage}`;

  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)

    const success = params.get("success")
    const error = params.get("error")

    if (success === "true") {
      toast.success({
        title: "Success",
        description: "Google Calendar connected successfully.",
      })
    }

    if (error) {
      setFormError("Google connection failed")
    }
  }, [])
  // const mentorDisplayName = mentorId ? `Mentor ${mentorId}` : "Mentor";
  const mentorDisplayName =
    mentorProfile?.name || (mentorId ? `Mentor ${mentorId}` : "Mentor")
  const initials = getInitials(mentorDisplayName)
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
          href={getMentorsHref(routeContext)}
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
        href={getMentorsHref(routeContext)}
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

            {/* <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <strong>0.0</strong>rating
              </div>

              <span>0 sessions completed</span>
            </div> */}
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
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {mentorProfile.bio}
              </p>
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

          {/* Past Experiences */}
          <div className="border rounded-2xl p-6 bg-white text-left">
            <p className="text-sm font-semibold text-gray-500 mb-2">
              PAST EXPERIENCES
            </p>

            {mentorProfile?.pastExperiences ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {mentorProfile.pastExperiences}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                This mentor has not added past experiences yet.
              </p>
            )}
          </div>

        </div>

        {/* Right */}
        <div className="border rounded-2xl p-6 bg-white space-y-6 h-fit self-start sticky top-6">
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-500 mb-3">
              BOOK A SESSION
            </p>

            <div className="mb-4 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${acceptsNewMentees ? "bg-green-500" : "bg-gray-400"}`}></span>
              <p className={`text-sm ${acceptsNewMentees ? "text-green-700 font-medium" : "text-gray-600"}`}>
                {acceptsNewMentees ? "Accepting new sessions" : "Not accepting new sessions"}
              </p>
            </div>
          </div>

          <Link
            href={mentorId ? getMentorBookHref(mentorId, routeContext) : getMentorsHref(routeContext)}
            className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
              acceptsNewMentees
                ? "bg-green-800 text-white hover:bg-green-900"
                : "bg-gray-200 text-gray-600 cursor-not-allowed"
            }`}
            onClick={(e) => !acceptsNewMentees && e.preventDefault()}
          >
            <CalendarDays size={18} />
            Book a Session
          </Link>
        </div>

      </div>
    </div>
  );
}
