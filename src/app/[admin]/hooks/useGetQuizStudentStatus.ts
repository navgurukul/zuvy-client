import { useCallback } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

/** Fetch student submission status for a quiz chapter. */
export function useGetQuizStudentStatus() {
  const getQuizStudentStatus = useCallback(
    (bootcampId: string | number, moduleId: string | number, params: URLSearchParams): Promise<AxiosResponse<any>> =>
      api.get(`/submission/quiz/status/${bootcampId}/${moduleId}?${params.toString()}`),
    []
  )

  return { getQuizStudentStatus }
}

export default useGetQuizStudentStatus
