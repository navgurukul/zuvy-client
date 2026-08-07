import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/**
 * Hook to call:
 *   GET /bootcamp/students/{courseId}?userId={studentId}
 *
 * Returns { getStudentInfo, loading, error }.
 */
export function useGetStudentInfo() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const getStudentInfo = useCallback(
    async (courseId: string | number, studentId: string | number): Promise<AxiosResponse<any>> => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/bootcamp/students/${courseId}?userId=${studentId}`)
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

  return { getStudentInfo, loading, error }
}

export default useGetStudentInfo
