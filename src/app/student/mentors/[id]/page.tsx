"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, CalendarDays, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/utils/axios.config";
import { useMentorProfile } from "@/app/student/hooks/useMentorProfile";
import { getMentorBookHref, getMentorsHref } from "@/utils/studentMentorshipRoutes";
import { getMentorId } from "@/utils/mentorUtils";

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
        <p className="text-sm text-muted-foreground">Loading mentor profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        <Link
          href={getMentorsHref(routeContext)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Find Mentors
        </Link>

        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* Back button */}
      <Link
        href={getMentorsHref(routeContext)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Find Mentors
      </Link>

      {/* Top Card */}
      <div className="flex items-center justify-between rounded-2xl border bg-card p-6">

        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
            {initials}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-left">{mentorDisplayName}</h2>
            <p className="text-left text-sm text-muted-foreground">
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
              ? "bg-success-light text-success-dark dark:bg-primary-light dark:text-primary-foreground"
              : "bg-muted text-muted-foreground"
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
          <div className="rounded-2xl border bg-card p-6 text-left">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              ABOUT
            </p>

            {mentorProfile?.bio ? (
              <p className="text-sm text-foreground whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {mentorProfile.bio}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                This mentor has not added a bio yet.
              </p>
            )}
          </div>

          {/* Expertise */}
          <div className="rounded-2xl border bg-card p-6 text-left">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              AREAS OF EXPERTISE
            </p>

            {expertise.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {expertise.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No expertise areas listed.
              </p>
            )}
          </div>

          {/* Past Experiences */}
          <div className="rounded-2xl border bg-card p-6 text-left">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              PAST EXPERIENCES
            </p>

            {mentorProfile?.pastExperiences ? (
              <p className="text-sm text-foreground whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {mentorProfile.pastExperiences}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                This mentor has not added past experiences yet.
              </p>
            )}
          </div>

        </div>

        {/* Right */}
        <div className="sticky top-6 h-fit self-start space-y-6 rounded-2xl border bg-card p-6">
          <div className="text-left">
            <p className="mb-3 text-sm font-semibold text-muted-foreground">
              BOOK A SESSION
            </p>

            <div className="mb-4 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${acceptsNewMentees ? "bg-success" : "bg-muted-foreground"}`}></span>
              <p className={`text-sm ${acceptsNewMentees ? "font-medium text-success-dark" : "text-muted-foreground"}`}>
                {acceptsNewMentees ? "Accepting new sessions" : "Not accepting new sessions"}
              </p>
            </div>
          </div>

          <Link
            href={mentorId ? getMentorBookHref(mentorId, routeContext) : getMentorsHref(routeContext)}
            className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
              acceptsNewMentees
                ? "bg-primary text-primary-foreground hover:bg-primary-dark"
                : "cursor-not-allowed bg-muted text-muted-foreground"
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
