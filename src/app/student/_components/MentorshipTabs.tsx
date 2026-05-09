// "use client"

// import Link from "next/link"
// import { usePathname, useSearchParams } from "next/navigation"
// import { Button } from "@/components/ui/button"

// type Props = {
//   courseId?: string
// }

// export default function MentorshipTabs({ courseId }: Props) {
//   const searchParams = useSearchParams()
//   const pathname = usePathname()

//   const cid = courseId ?? (searchParams?.get("courseId") || "")
//   const mentorsHref = cid ? `/student/mentors?courseId=${cid}` : "/student/mentors"
//   const sessionsHref = cid ? `/student/sessions?courseId=${cid}` : "/student/sessions"

//   const isMentorsTabActive = pathname?.startsWith("/student/mentors")
//   const isSessionsTabActive = pathname?.startsWith("/student/sessions")

//   return (
//     <div className="w-full border-b border-gray-100">
//       <div className="flex items-end gap-6">
//         <Button
//           variant="ghost"
//           asChild
//           className={`rounded-none px-1 pb-3 pt-2 text-sm shadow-none hover:bg-transparent ${
//             isMentorsTabActive
//               ? 'text-green-800 font-semibold'
//               : 'border-transparent text-muted-foreground hover:text-foreground'
//           }`}
//         >
//           <Link href={mentorsHref} className="inline-flex items-center">
//             <span
//               className={`relative inline-block pb-1 ${
//                 isMentorsTabActive
//                   ? 'text-green-800 font-semibold after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:rounded-full after:bg-green-800'
//                   : ''
//               }`}
//             >
//               Browse Mentors
//             </span>
//           </Link>
//         </Button>

//         <Button
//           variant="ghost"
//           asChild
//           className={`rounded-none px-1 pb-3 pt-2 text-sm shadow-none hover:bg-transparent ${
//             isSessionsTabActive
//               ? 'text-green-800 font-semibold'
//               : 'border-transparent text-muted-foreground hover:text-foreground'
//           }`}
//         >
//           <Link href={sessionsHref} className="inline-flex items-center">
//             <span
//               className={`relative inline-block pb-1 ${
//                 isSessionsTabActive
//                   ? 'text-green-800 font-semibold after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:rounded-full after:bg-green-800'
//                   : ''
//               }`}
//             >
//               My Sessions
//             </span>
//           </Link>
//         </Button>
//       </div>
//     </div>
//   )
// }


"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

type Props = {
  courseId?: string
}

export default function MentorshipTabs({ courseId }: Props) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const cid = courseId ?? searchParams?.get("courseId") ?? ""

  const mentorsHref = cid
    ? `/student/mentors?courseId=${cid}`
    : "/student/mentors"

  const sessionsHref = cid
    ? `/student/sessions?courseId=${cid}`
    : "/student/sessions"

  const isMentorsTabActive = pathname?.startsWith("/student/mentors")
  const isSessionsTabActive = pathname?.startsWith("/student/sessions")

  return (
    <div className="w-full border-b border-[#e8ece8]">
      <div className="flex items-center gap-8">
        <Link
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