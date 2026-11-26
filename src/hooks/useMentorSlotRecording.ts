"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/utils/axios.config"

type MentorSlotRecordingItem = {
  status?: string | null
  youtubeUrl?: string | null
  driveLink?: string | null
}

/** Same states as `recording.state` on the student's session cards */
export type MentorSlotRecordingState = "READY" | "PROCESSING" | "NONE"

type MentorSlotRecordingResponse = {
  recordings?: MentorSlotRecordingItem[]
}

type MentorSlotRecordingScope = "student" | "instructor"

const getErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })
    ?.response?.data?.message

  return message || "Failed to fetch recording"
}

// Mirrors the backend's session-card rules (session-card.ts recordingState)
const RECORDING_FAILED_STATUSES = new Set(["PERMANENT_FAILED"])
// No recording row yet within this long after the end still counts as processing
const RECORDING_GRACE_MS = 24 * 60 * 60 * 1000

const getRecordingUrl = (recording: MentorSlotRecordingItem) =>
  recording.youtubeUrl || recording.driveLink || null

/** A finished recording with a link if there is one, otherwise the newest (API sends newest first). */
const pickBestRecording = (recordings: MentorSlotRecordingItem[]) =>
  recordings.find((recording) => recording.status === "COMPLETED" && getRecordingUrl(recording)) ||
  recordings[0] ||
  null

const getRecordingState = (
  recording: MentorSlotRecordingItem | null,
  sessionEnd?: string | null
): MentorSlotRecordingState => {
  if (recording?.status === "COMPLETED" && getRecordingUrl(recording)) return "READY"
  if (recording && !RECORDING_FAILED_STATUSES.has(String(recording.status))) return "PROCESSING"
  const endMs = sessionEnd ? new Date(sessionEnd).getTime() : NaN
  if (!recording && Number.isFinite(endMs) && Date.now() - endMs < RECORDING_GRACE_MS) return "PROCESSING"
  return "NONE"
}

export function useMentorSlotRecording(
  bookingId?: number,
  initialFetch = true,
  scope: MentorSlotRecordingScope = "student",
  /** The session's end time, for the "still processing" grace period */
  sessionEnd?: string | null
) {
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [recordingState, setRecordingState] = useState<MentorSlotRecordingState | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(initialFetch && bookingId))
  const [error, setError] = useState<string | null>(null)

  const fetchRecording = useCallback(async () => {
    if (!bookingId) {
      setRecordingUrl(null)
      setRecordingState(null)
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

      const recordings = Array.isArray(response.data?.recordings) ? response.data.recordings : []
      const best = pickBestRecording(recordings)
      const state = getRecordingState(best, sessionEnd)
      setRecordingState(state)
      setRecordingUrl(state === "READY" && best ? getRecordingUrl(best) : null)
    } catch (error) {
      setRecordingUrl(null)
      setRecordingState(null)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [bookingId, scope, sessionEnd])

  useEffect(() => {
    if (!initialFetch) return
    fetchRecording()
  }, [initialFetch, fetchRecording])

  return {
    recordingUrl,
    /** READY / PROCESSING / NONE, null before it loads or on error */
    recordingState,
    loading,
    error,
    refetchRecording: fetchRecording,
  }
}
