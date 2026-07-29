import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/**
 * Hook to call:
 *   GET /content/allModules/{courseId}
 *
 * Returns { getCourseModules, loading, error }.
 */
export function useGetCourseModules() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const getCourseModules = useCallback(
    async (courseId: string | number): Promise<AxiosResponse<any>> => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/content/allModules/${courseId}`)
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

  return { getCourseModules, loading, error }
}

export default useGetCourseModules
