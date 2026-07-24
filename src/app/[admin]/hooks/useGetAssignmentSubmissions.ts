import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/**
 * Hook to call:
 *   GET /submission/submissionsOfAssignment/{courseId}?searchAssignment={searchAssignment}
 *
 * Returns { getAssignmentSubmissions, loading, error }.
 */
export function useGetAssignmentSubmissions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const getAssignmentSubmissions = useCallback(
    async (courseId: string | number, searchAssignment?: string): Promise<AxiosResponse<any>> => {
      setLoading(true)
      setError(null)
      try {
        let url = `/submission/submissionsOfAssignment/${courseId}`
        if (searchAssignment) {
          url += `?searchAssignment=${encodeURIComponent(searchAssignment)}`
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

  return { getAssignmentSubmissions, loading, error }
}

export default useGetAssignmentSubmissions
