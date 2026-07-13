import { create } from 'zustand'
import { api } from '@/utils/axios.config'
import { LatestUpdatedCourseResponse, LatestUpdatedCourseData } from '@/hooks/hookType'

interface LatestCourseState {
  latestCourseData: LatestUpdatedCourseData | null
  loading: boolean
  error: string | null
  /**
   * Tracks which courseId is currently cached or being fetched.
   * Used to deduplicate concurrent calls from multiple components.
   */
  fetchedForId: string | null

  fetchLatestCourse: (courseId: string) => Promise<void>
  resetForNewCourse: (courseId: string) => void
}

export const useLatestCourseStore = create<LatestCourseState>((set, get) => ({
  latestCourseData: null,
  loading: false,
  error: null,
  fetchedForId: null,

  /**
   * Called when navigating to a different course.
   * Clears cache and immediately marks the new courseId as in-flight
   * so subsequent calls within the same render cycle are also deduped.
   */
  resetForNewCourse: (courseId: string) => {
    set({
      latestCourseData: null,
      loading: true,
      error: null,
      fetchedForId: courseId,
    })
  },

  fetchLatestCourse: async (courseId: string) => {
    if (!courseId) return

    const state = get()

    // Same courseId already cached or in-flight — deduplicate
    if (state.fetchedForId === courseId) return

    // New courseId — clear old data and mark in-flight atomically
    // This single atomic set prevents any concurrent call from slipping through
    set({ loading: true, error: null, fetchedForId: courseId, latestCourseData: null })

    try {
      const response = await api.get<LatestUpdatedCourseResponse>(
        `/tracking/latestUpdatedCourse?bootcampId=${courseId}`
      )

      // Guard: if courseId changed while awaiting, discard this response
      if (get().fetchedForId !== courseId) return

      if (response.data.isSuccess) {
        set({
          latestCourseData: {
            ...response.data.data,
            mentorshipEnabled: response.data.mentorshipEnabled,
            leaderboardEnabled: response.data.leaderboardEnabled,
          },
          loading: false,
        })
      } else {
        set({
          error: response.data.message || 'Failed to fetch latest updated course',
          loading: false,
          // Clear fetchedForId so retries are allowed
          fetchedForId: null,
        })
      }
    } catch (err: any) {
      // Guard: if courseId changed while awaiting, discard this error
      if (get().fetchedForId !== courseId) return

      console.error('Error fetching latest updated course:', err)
      set({
        error: err.response?.data?.message || err.message || 'Failed to fetch latest updated course',
        loading: false,
        // Clear fetchedForId so retries are allowed
        fetchedForId: null,
      })
    }
  },
}))
