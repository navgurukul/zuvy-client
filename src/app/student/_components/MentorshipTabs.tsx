"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { getMentorsHref, getSessionsHref } from "@/utils/studentMentorshipRoutes"

type Props = {
  courseId?: string
  orgId?: string
}

export default function MentorshipTabs({ courseId, orgId }: Props) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const cid = courseId ?? searchParams?.get("courseId") ?? ""
  const oid = orgId ?? searchParams?.get("orgId") ?? ""

  const routeContext = { courseId: cid, orgId: oid }
  const mentorsHref = getMentorsHref(routeContext)
  const sessionsHref = getSessionsHref(routeContext)

  const isMentorsTabActive = pathname?.startsWith("/student/mentors")
  const isSessionsTabActive = pathname?.startsWith("/student/sessions")

  return (
    <div className="w-full border-b border-[#e8ece8]">
      <div className="flex items-center gap-8">
        <Link
          id="tour-browse-mentors"
          href={mentorsHref}
          className={`
            relative flex items-center gap-2 px-3 py-2  text-sm transition-all
            ${
              isMentorsTabActive
                ? "font-semibold text-[#2f6b3d]"
                : "font-medium text-[#7b857b] hover:text-[#2f6b3d]"
            }
          `}
        >
          Browse Mentors

          {/* <span
            className={`
              flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-medium
              ${
                isMentorsTabActive
                  ? "bg-[#e7f3e8] text-[#2f6b3d]"
                  : "bg-[#f3f4f6] text-[#7b857b]"
              }
            `}
          >
            1
          </span> */}

          {isMentorsTabActive && (
            <div className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#2f6b3d]" />
          )}
        </Link>

        <Link
          id="tour-my-sessions"
          href={sessionsHref}
          className={`
            relative flex items-center gap-2 px-3 py-2  text-sm transition-all
            ${
              isSessionsTabActive
                ? "font-semibold text-[#2f6b3d]"
                : "font-medium text-[#7b857b] hover:text-[#2f6b3d]"
            }
          `}
        >
          My Sessions

          {/* <span
            className={`
              flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-medium
              ${
                isSessionsTabActive
                  ? "bg-[#e7f3e8] text-[#2f6b3d]"
                  : "bg-[#f3f4f6] text-[#7b857b]"
              }
            `}
          >
            0
          </span> */}

          {isSessionsTabActive && (
            <div className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#2f6b3d]" />
          )}
        </Link>
      </div>
    </div>
  )
}
