import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
import { getCourseData } from '@/store/store'

const COURSE_CHECK_CACHE_TTL_MS = 300_000
const COURSE_CHECK_POLL_INTERVAL_MS = 30_000

const courseCheckRequests = new Map<string, Promise<boolean>>()
const courseCheckLastFetchedAt = new Map<string, number>()

const normalizeCourseId = (courseId: string | number | undefined) =>
  courseId?.toString()

/**
 * Standalone async utility (not a hook) — can be called from Zustand store
 * actions or anywhere outside React component lifecycle.
 *
 * Fetches /bootcamp/{courseIdKey}, updates the getCourseData store, and
 * returns true on success / throws on error.
 */
export async function fetchCourseById(courseIdKey: string): Promise<boolean> {
    let request = courseCheckRequests.get(courseIdKey)

    if (!request) {
        request = api
            .get(`/bootcamp/${courseIdKey}`)
            .then((response) => {
                getCourseData.setState({
                    courseData: response.data.bootcamp,
                    Permissions: response.data.permissions,
                })
                courseCheckLastFetchedAt.set(courseIdKey, Date.now())
                return true
            })
            .catch((error) => {
                getCourseData.setState({ courseData: null })
                throw error
            })
            .finally(() => {
                courseCheckRequests.delete(courseIdKey)
            })

        courseCheckRequests.set(courseIdKey, request)
    }

    return request
}

export const useCourseExistenceCheck = (
  courseId: string | number | undefined,
  // options: UseCourseExistenceCheckOptions = {}
) => {
  const { courseData, Permissions } = getCourseData()
  const [isCourseDeleted, setIsCourseDeleted] = useState(false)
  const [loadingCourseCheck, setLoadingCourseCheck] = useState(true)
  const hasLoadedCourseDataRef = useRef(false)
  const courseIdKey = normalizeCourseId(courseId)
  // const pollIntervalMs =
  //   options.pollIntervalMs ?? COURSE_CHECK_POLL_INTERVAL_MS
  const currentCourseData =
    courseIdKey && courseData?.id?.toString() === courseIdKey
      ? courseData
      : null

  useEffect(() => {
    hasLoadedCourseDataRef.current = false
    setIsCourseDeleted(false)
    setLoadingCourseCheck(true)
  }, [courseId])

  const checkIfCourseExists = useCallback(async (force = false) => {
    if (!courseIdKey) {
      setLoadingCourseCheck(false)
      return
    }

    try {
      const now = Date.now()
      const lastFetchedAt = courseCheckLastFetchedAt.get(courseIdKey)
      const hasFreshCheck =
        lastFetchedAt && now - lastFetchedAt < COURSE_CHECK_CACHE_TTL_MS

      if (!force && hasFreshCheck) {
        setIsCourseDeleted(false)
        return
      }

      // Delegate to shared utility — handles deduplication and store update
      await fetchCourseById(courseIdKey)
      hasLoadedCourseDataRef.current = true
      setIsCourseDeleted(false)
    } catch (error) {
      setIsCourseDeleted(true)
    } finally {
      setLoadingCourseCheck(false)
    }
  }, [courseIdKey])

  useEffect(() => {
    if (!isCourseDeleted) {
      checkIfCourseExists(false)
    }
  }, [checkIfCourseExists, isCourseDeleted])

  return {
    isCourseDeleted,
    loadingCourseCheck,
    courseData: currentCourseData,
    Permissions,
  }
}
