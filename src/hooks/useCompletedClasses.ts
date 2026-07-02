import { useCallback } from 'react'
import { api } from '@/utils/axios.config'

export type CompletedClassesResponse = any

export function useCompletedClasses() {
  const fetchCompletedClasses = useCallback(async (courseId: string | number, studentId: string | number) => {
    if (!courseId || !studentId) return null
    const url = `/student/bootcamp/${courseId}/completed-classes?userId=${studentId}`
    const res = await api.get(url)
    return res
  }, [])

  return { fetchCompletedClasses }
}

export default useCompletedClasses
