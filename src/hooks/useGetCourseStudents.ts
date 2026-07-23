import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/**
 * Hook to call:
 *   GET /bootcamp/students/{courseId}
 *
 * Accepts query parameters as a string or URLSearchParams.
 * Returns { getCourseStudents, loading, error }.
 */
export function useGetCourseStudents() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const getCourseStudents = useCallback(
    async (
      courseId: string | number,
      params?: URLSearchParams | string
    ): Promise<AxiosResponse<any>> => {
      setLoading(true)
      setError(null)
      try {
        let url = `/bootcamp/students/${courseId}`
        if (params) {
          const queryString = typeof params === 'string' ? params : params.toString()
          if (queryString) {
            url += queryString.startsWith('?') ? queryString : `?${queryString}`
          }
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

  return { getCourseStudents, loading, error }
}

export default useGetCourseStudents
