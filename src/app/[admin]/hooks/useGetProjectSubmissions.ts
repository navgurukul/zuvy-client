import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/**
 * Hook to call:
 *   GET /submission/submissionsOfProjects/{courseId}?searchProject={searchProject}
 *
 * Returns { getProjectSubmissions, loading, error }.
 */
export function useGetProjectSubmissions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const getProjectSubmissions = useCallback(
    async (courseId: string | number, searchProject?: string): Promise<AxiosResponse<any>> => {
      setLoading(true)
      setError(null)
      try {
        let url = `/submission/submissionsOfProjects/${courseId}`
        if (searchProject) {
          url += `?searchProject=${encodeURIComponent(searchProject)}`
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

  return { getProjectSubmissions, loading, error }
}

export default useGetProjectSubmissions
