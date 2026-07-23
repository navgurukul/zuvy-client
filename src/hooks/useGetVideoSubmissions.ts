import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/**
 * Hook to call:
 *   GET /admin/bootcampModuleCompletion/bootcamp_id{courseId}?searchVideos={searchVideos}
 *
 * Returns { getVideoSubmissions, loading, error }.
 */
export function useGetVideoSubmissions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const getVideoSubmissions = useCallback(
    async (courseId: string | number, searchVideos?: string): Promise<AxiosResponse<any>> => {
      setLoading(true)
      setError(null)
      try {
        let url = `/admin/bootcampModuleCompletion/bootcamp_id${courseId}`
        if (searchVideos) {
          url += `?searchVideos=${encodeURIComponent(searchVideos)}`
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

  return { getVideoSubmissions, loading, error }
}

export default useGetVideoSubmissions
