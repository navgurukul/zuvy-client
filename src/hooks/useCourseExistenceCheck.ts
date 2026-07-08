import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
import { getCourseData } from '@/store/store'

const COURSE_CHECK_CACHE_TTL_MS = 5_000
const COURSE_CHECK_POLL_INTERVAL_MS = 30_000

const courseCheckRequests = new Map<string, Promise<boolean>>()
const courseCheckLastFetchedAt = new Map<string, number>()

type UseCourseExistenceCheckOptions = {
  pollIntervalMs?: number
}

const normalizeCourseId = (courseId: string | number | undefined) =>
  courseId?.toString()

export const useCourseExistenceCheck = (
  courseId: string | number | undefined,
  options: UseCourseExistenceCheckOptions = {}
) => {
  const { courseData, Permissions } = getCourseData()
  const [isCourseDeleted, setIsCourseDeleted] = useState(false)
  const [loadingCourseCheck, setLoadingCourseCheck] = useState(true)
  const hasLoadedCourseDataRef = useRef(false)
  const courseIdKey = normalizeCourseId(courseId)
  const pollIntervalMs =
    options.pollIntervalMs ?? COURSE_CHECK_POLL_INTERVAL_MS
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

      let request = courseCheckRequests.get(courseIdKey)

      if (!request) {
        request = api
          .get(`/bootcamp/${courseIdKey}`)
          .then((response) => {
            const currentStoreCourse = getCourseData.getState().courseData

            if (
              !hasLoadedCourseDataRef.current ||
              currentStoreCourse?.id?.toString() !== courseIdKey
            ) {
              getCourseData.setState({
                courseData: response.data.bootcamp,
                Permissions: response.data.permissions,
              })
              hasLoadedCourseDataRef.current = true
            }

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

      await request
      setIsCourseDeleted(false)
    } catch (error) {
      setIsCourseDeleted(true)
    } finally {
      setLoadingCourseCheck(false)
    }
  }, [courseIdKey])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (!isCourseDeleted) {
      checkIfCourseExists(false)
      interval = setInterval(() => {
        checkIfCourseExists(true)
      }, pollIntervalMs)
    }

    return () => clearInterval(interval)
  }, [checkIfCourseExists, isCourseDeleted, pollIntervalMs])

  return {
    isCourseDeleted,
    loadingCourseCheck,
    courseData: currentCourseData,
    Permissions,
  }
}
