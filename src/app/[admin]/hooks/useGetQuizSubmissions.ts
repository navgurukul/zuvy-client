import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/** Fetch quiz submission summaries for a course, optionally filtered by quiz title. */
export function useGetQuizSubmissions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const getQuizSubmissions = useCallback(
    async (courseId: string | number, searchQuiz?: string): Promise<AxiosResponse<any>> => {
      setLoading(true)
      setError(null)
      try {
        let url = `/submission/quiz/summary/${courseId}`
        if (searchQuiz?.trim()) {
          url += `?searchQuiz=${encodeURIComponent(searchQuiz.trim())}`
        }
        return await api.get(url)
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { getQuizSubmissions, loading, error }
}

export default useGetQuizSubmissions
