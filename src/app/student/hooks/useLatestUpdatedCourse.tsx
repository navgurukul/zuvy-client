import { useEffect, useRef } from 'react'
import { useLatestCourseStore } from '@/store/latestCourseStore'

/**
 * Thin wrapper around the Zustand latestCourseStore.
 *
 * Deduplication guarantee:
 * - All components sharing the same courseId share ONE fetch.
 * - The store's fetchedForId acts as a mutex: the first call sets it
 *   atomically, all subsequent calls in the same render cycle see it
 *   already set and bail out immediately.
 * - On courseId change (navigation), only the FIRST component to detect
 *   the change triggers a new fetch; others see the updated fetchedForId
 *   and skip.
 *
 * Return shape is identical to the original hook — no consumer changes needed.
 */
export const useLatestUpdatedCourse = (courseId: string) => {
  const { latestCourseData, loading, error, fetchLatestCourse, fetchedForId } =
    useLatestCourseStore()

  // Track the previous courseId this hook instance saw, without triggering re-renders
  const prevCourseIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!courseId) return

    const prevCourseId = prevCourseIdRef.current
    prevCourseIdRef.current = courseId

    // If this component instance has seen a different courseId before,
    // and the store is still caching the old one, trigger a fresh fetch.
    // fetchLatestCourse handles the atomic dedup so only one component wins.
    if (prevCourseId && prevCourseId !== courseId) {
      // Force a new fetch by calling fetchLatestCourse —
      // the store will detect fetchedForId !== courseId and reset+fetch
      fetchLatestCourse(courseId)
      return
    }

    fetchLatestCourse(courseId)
  }, [courseId])

  return { latestCourseData, loading, error }
}
