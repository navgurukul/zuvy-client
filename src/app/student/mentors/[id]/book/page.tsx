"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getMentorDrawerHref, getMentorsHref } from "@/utils/studentMentorshipRoutes";
import { getMentorId } from "@/utils/mentorUtils";

/**
 * Legacy booking page. Booking now happens in the drawer on /student/mentors,
 * which follows the booking preview and credit rules; this route only redirects there.
 */
export default function BookSessionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const mentorId = getMentorId(params["id"] as string | string[] | undefined);
  const courseId = searchParams.get("courseId") || "";
  const orgId = searchParams.get("orgId") || searchParams.get("organizationId") || "";

  useEffect(() => {
    const routeContext = { courseId, orgId };
    router.replace(mentorId ? getMentorDrawerHref(mentorId, routeContext) : getMentorsHref(routeContext));
  }, [router, mentorId, courseId, orgId]);

  return null;
}
