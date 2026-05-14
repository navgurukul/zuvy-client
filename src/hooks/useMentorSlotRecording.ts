"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/utils/axios.config"

type MentorSlotRecordingItem = {
  youtubeUrl?: string | null
  driveLink?: string | null
}

type MentorSlotRecordingResponse = {
  recordings?: MentorSlotRecordingItem[]
}

type MentorSlotRecordingScope = "student" | "instructor"

const getErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })
    ?.response?.data?.message

  return message || "Failed to fetch recording"
}

const extractRecordingUrl = (data: MentorSlotRecordingResponse): string | null => {
  const recordings = Array.isArray(data?.recordings) ? data.recordings : []
  if (recordings.length === 0) return null

  const firstRecording = recordings[0]
  return firstRecording.youtubeUrl || firstRecording.driveLink || null
}

export function useMentorSlotRecording(
  bookingId?: number,
  initialFetch = true,
  scope: MentorSlotRecordingScope = "student"
) {
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(initialFetch && bookingId))
  const [error, setError] = useState<string | null>(null)

  const fetchRecording = useCallback(async () => {
    if (!bookingId) {
      setRecordingUrl(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const endpoint =
        scope === "instructor"
          ? `/instructor/mentor-slots/bookings/${bookingId}/recordings`
          : `/student/mentor-slots/bookings/${bookingId}/recordings`

      const response = await api.get<MentorSlotRecordingResponse>(endpoint)

      setRecordingUrl(extractRecordingUrl(response.data))
    } catch (error) {
      setRecordingUrl(null)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [bookingId, scope])

  useEffect(() => {
    if (!initialFetch) return
    fetchRecording()
  }, [initialFetch, fetchRecording])

  return {
    recordingUrl,
    loading,
    error,
    refetchRecording: fetchRecording,
  }
}
