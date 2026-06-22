type MentorshipRouteContext = {
  courseId?: string | number | null
  orgId?: string | number | null
}

type QueryValue = string | number | null | undefined

const appendQuery = (
  path: string,
  context: MentorshipRouteContext = {},
  extraParams: Record<string, QueryValue> = {}
) => {
  const params = new URLSearchParams()

  if (context.courseId) {
    params.set("courseId", String(context.courseId))
  }

  if (context.orgId) {
    params.set("orgId", String(context.orgId))
  }

  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value))
    }
  })

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}

export const getMentorsHref = (context: MentorshipRouteContext = {}) =>
  appendQuery("/student/mentors", context)

export const getSessionsHref = (context: MentorshipRouteContext = {}) =>
  appendQuery("/student/sessions", context)

export const getMentorProfileHref = (
  mentorId: string | number,
  context: MentorshipRouteContext = {}
) => appendQuery(`/student/mentors/${mentorId}`, context)

export const getMentorBookHref = (
  mentorId: string | number,
  context: MentorshipRouteContext = {}
) => appendQuery(`/student/mentors/${mentorId}/book`, context)

export const getSessionJoinHref = (
  sessionId: string | number,
  joinUrl: string,
  context: MentorshipRouteContext = {}
) => appendQuery(`/student/sessions/${sessionId}/join`, context, {
  joinUrl,
})

export const getSessionRescheduleHref = (
  sessionId: string | number,
  context: MentorshipRouteContext = {},
  extraParams: Record<string, QueryValue> = {}
) => appendQuery(`/student/sessions/${sessionId}/reschedule`, context, extraParams)

export const getSessionCancelHref = (
  sessionId: string | number,
  context: MentorshipRouteContext = {}
) => appendQuery(`/student/sessions/${sessionId}/cancel`, context)
