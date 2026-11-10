import { useCallback } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/** Fetch quiz report rows using the quiz report endpoint's query parameters. */
export function useGetQuizReport() {
  const getQuizReport = useCallback(
    (params: URLSearchParams): Promise<AxiosResponse<any>> =>
      api.get(`/submission/quiz/report?${params.toString()}`),
    []
  )

  return { getQuizReport }
}

export default useGetQuizReport
