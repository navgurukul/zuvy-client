import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/**
 * Hook to call:
 *   GET /admin/bootcampAssessment/bootcamp_id{courseId}?searchAssessment={searchTerm}
 *
 * Returns { getAssessmentSubmissions, loading, error }.
 */
export function useGetAssessmentSubmissions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const getAssessmentSubmissions = useCallback(
    async (courseId: string | number, searchTerm?: string): Promise<AxiosResponse<any>> => {
      setLoading(true)
      setError(null)
      try {
        let url = `/admin/bootcampAssessment/bootcamp_id${courseId}`
        if (searchTerm) {
          url += `?searchAssessment=${encodeURIComponent(searchTerm)}`
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

  return { getAssessmentSubmissions, loading, error }
}

export default useGetAssessmentSubmissions
