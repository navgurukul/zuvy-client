"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSessionsHref } from "@/utils/studentMentorshipRoutes"

export default function JoinSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const joinUrl = searchParams.get("joinUrl")?.trim() || ""
  const courseId = searchParams.get("courseId") || ""
  const orgId = searchParams.get("orgId") || ""
  const sessionsHref = getSessionsHref({ courseId, orgId })

  const isAllowedMeetingHost = (hostname: string) => {
    const normalizedHost = hostname.toLowerCase()

    return normalizedHost === "zoom.us" || normalizedHost.endsWith(".zoom.us")
  }

  useEffect(() => {
    if (!joinUrl) {
      router.replace(sessionsHref)
      return
    }

    try {
      const parsedMeetingUrl = new URL(joinUrl)
      const isHttps = parsedMeetingUrl.protocol === "https:"
      const isAllowedHost = isAllowedMeetingHost(parsedMeetingUrl.hostname)

      if (!isHttps || !isAllowedHost) {
        router.replace(sessionsHref)
        return
      }

      window.location.replace(parsedMeetingUrl.toString())
    } catch {
      router.replace(sessionsHref)
    }
  }, [joinUrl, router, sessionsHref])

  return null
}
