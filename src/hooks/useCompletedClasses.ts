import { useState, useEffect, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import {
  CompletedClassesData,
  UseCompletedClassesReturn,
} from '@/hooks/hookType'

export function useCompletedClasses(courseId?: string | number): UseCompletedClassesReturn {
  const [completedClassesData, setCompletedClassesData] = useState<CompletedClassesData | null>(null)
  const [loading, setLoading] = useState(Boolean(courseId))
  const [error, setError] = useState<string | null>(null)

  // Imperative fetch used by attendanceColumns — accepts courseId + studentId explicitly
  const fetchCompletedClasses = useCallback(async (fetchCourseId: string | number, studentId: string | number) => {
    if (!fetchCourseId || !studentId) return null
    const url = `/student/bootcamp/${fetchCourseId}/completed-classes?userId=${studentId}`
    const res = await api.get(url)
    return res
  }, [])

  // Auto-fetch when courseId is provided (used by CourseDashboardPage)
  const fetchForCourse = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/student/bootcamp/${courseId}/completed-classes`)
      setCompletedClassesData(res.data ?? null)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load completed classes')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchForCourse()
  }, [fetchForCourse])

  return { completedClassesData, loading, error, fetchCompletedClasses }
}

export default useCompletedClasses
