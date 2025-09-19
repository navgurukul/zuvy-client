'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { Course, CoursesResponse } from '@/app/admin/courses/[courseId]/submissionVideo/submissionVideoIdPageType'

export function useAllCourses(initialFetch = true) {
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState<boolean>(!!initialFetch)
  const [error, setError] = useState<unknown>(null)

  const getAllCourses = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<CoursesResponse>('/bootcamp?limit=1000&offset=0')
      setAllCourses(res.data.data)
      setError(null)
    } catch (err) {
      setError(err)
      // keep previous allCourses on error
      // console.error('Error fetching all courses:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialFetch) getAllCourses()
  }, [initialFetch, getAllCourses])

  return { allCourses, loading, error, refetchAllCourses: getAllCourses }
}
