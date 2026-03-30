"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function JoinSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const meetingLink = searchParams.get("meetingLink")?.trim() || ""

  useEffect(() => {
    if (!meetingLink) {
      router.replace("/student/sessions")
      return
    }

    try {
      const parsedMeetingUrl = new URL(meetingLink)
      const isHttps = parsedMeetingUrl.protocol === "https:"
      const isAllowedHost = parsedMeetingUrl.hostname === "meet.google.com"

      if (!isHttps || !isAllowedHost) {
        router.replace("/student/sessions")
        return
      }

      window.location.replace(parsedMeetingUrl.toString())
    } catch {
      router.replace("/student/sessions")
    }
  }, [meetingLink, router])

  return null
}
