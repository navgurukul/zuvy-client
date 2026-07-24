import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/**
 * Hook to call:
 *   GET /student/bootcamp/{courseId}/completed-classes?{params}
 *
 * Accepts URLSearchParams so callers can pass any combination of
 * userId, searchTerm, attendanceStatus, fromDate, toDate, etc.
 *
 * Returns { getStudentCompletedClasses, loading, error }.
 */
export function useGetStudentCompletedClasses() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const getStudentCompletedClasses = useCallback(
    async (
      courseId: string | number,
      params?: URLSearchParams
    ): Promise<AxiosResponse<any>> => {
      setLoading(true)
      setError(null)
      try {
        let url = `/student/bootcamp/${courseId}/completed-classes`
        if (params) {
          url += `?${params.toString()}`
        }
        const res = await api.get(url)
        return res
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { getStudentCompletedClasses, loading, error }
}

export default useGetStudentCompletedClasses
