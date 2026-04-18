"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function JoinSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const joinUrl = searchParams.get("joinUrl")?.trim() || ""

  const isAllowedMeetingHost = (hostname: string) => {
    const normalizedHost = hostname.toLowerCase()

    return normalizedHost === "zoom.us" || normalizedHost.endsWith(".zoom.us")
  }

  useEffect(() => {
    if (!joinUrl) {
      router.replace("/student/sessions")
      return
    }

    try {
      const parsedMeetingUrl = new URL(joinUrl)
      const isHttps = parsedMeetingUrl.protocol === "https:"
      const isAllowedHost = isAllowedMeetingHost(parsedMeetingUrl.hostname)

      if (!isHttps || !isAllowedHost) {
        router.replace("/student/sessions")
        return
      }

      window.location.replace(parsedMeetingUrl.toString())
    } catch {
      router.replace("/student/sessions")
    }
  }, [joinUrl, router])

  return null
}
