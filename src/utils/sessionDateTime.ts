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
 * The window opens at the backend's `joinOpensAt` (or `joinOpenMinutes` before the
 * start, from the API's `rules`) and closes at the slot end. Neither known: closed,
 * so the screen never guesses the rule. Without an end time it stays open after opening.
 */
export const isJoinWindowOpen = (
  slotStart?: string | null,
  slotEnd?: string | null,
  nowTimestamp: number = Date.now(),
  window: { joinOpensAt?: string | null; joinOpenMinutes?: number | null } = {}
): boolean => {
  const startDate = parseDateValue(slotStart)
  if (!startDate) return false

  const opensAtDate = parseDateValue(window.joinOpensAt ?? null)
  const opensAt = opensAtDate
    ? opensAtDate.getTime()
    : typeof window.joinOpenMinutes === "number"
      ? startDate.getTime() - window.joinOpenMinutes * 60 * 1000
      : null
  if (opensAt === null) return false

  const endDate = parseDateValue(slotEnd)

  if (!endDate) {
    return nowTimestamp >= opensAt
  }

  return nowTimestamp >= opensAt && nowTimestamp <= endDate.getTime()
}
