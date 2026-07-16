/**
 * Shared session date/time helpers.
 *
 * Extracted from the duplicate implementations in:
 *   - src/app/student/sessions/page.tsx
 *   - src/app/[admin]/mentorsDashboard/sessions/page.tsx
 *   - src/app/student/sessions/[id]/reschedule/page.tsx
 *   - src/app/student/_pages/CourseDashboardPage.tsx
 */

/**
 * Safely parse a date string, returning `null` for falsy or invalid values.
 */
export const parseDateValue = (value?: string | null): Date | null => {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date
}

/**
 * Format a date string to a short date label (e.g. "Jan 5, 2025").
 * Returns "-" for falsy or invalid values.
 */
export const formatDateOnly = (value?: string | null): string => {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Format a date string to a time label (e.g. "2:30 PM").
 * Returns "-" for falsy or invalid values.
 */
export const formatTimeOnly = (value?: string | null): string => {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

/**
 * Format a start–end pair into a time range string (e.g. "2:30 PM - 3:30 PM").
 * Falls back gracefully when one or both values are missing/invalid.
 */
export const formatTimeRange = (start?: string | null, end?: string | null): string => {
  const startTime = formatTimeOnly(start)
  const endTime = formatTimeOnly(end)

  if (startTime === "-" && endTime === "-") return "-"
  if (startTime === "-") return endTime
  if (endTime === "-") return startTime

  return `${startTime} - ${endTime}`
}

/**
 * Check whether the current time falls within the join window of a session slot.
 * The window opens 10 minutes before the slot start and closes at the slot end.
 * If no end time is provided, the window stays open indefinitely after opening.
 */
export const isJoinWindowOpen = (
  slotStart?: string | null,
  slotEnd?: string | null,
  nowTimestamp: number = Date.now()
): boolean => {
  const startDate = parseDateValue(slotStart)
  if (!startDate) return false

  const tenMinutesBeforeStart = startDate.getTime() - 10 * 60 * 1000
  const endDate = parseDateValue(slotEnd)

  if (!endDate) {
    return nowTimestamp >= tenMinutesBeforeStart
  }

  return nowTimestamp >= tenMinutesBeforeStart && nowTimestamp <= endDate.getTime()
}
