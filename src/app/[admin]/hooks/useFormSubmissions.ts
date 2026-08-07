import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/**
 * Hook to call:
 *   GET /submission/submissionsOfForms/{courseId}?searchForm={searchForm}
 *
 * Returns { getFormSubmissions, loading, error }.
 */
export function useFormSubmissions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const getFormSubmissions = useCallback(
    async (courseId: string | number, searchForm?: string): Promise<AxiosResponse<any>> => {
      setLoading(true)
      setError(null)
      try {
        let url = `/submission/submissionsOfForms/${courseId}`
        if (searchForm) {
          url += `?searchForm=${encodeURIComponent(searchForm)}`
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

  return { getFormSubmissions, loading, error }
}

export default useFormSubmissions
