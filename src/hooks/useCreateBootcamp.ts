'use client'
import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { CourseData } from '@/app/admin/courses/[courseId]/submissionVideo/submissionVideoIdPageType'

type CreateResponse = {
  status: string
  message: string
  bootcamp: { id: number }
}

export function useCreateBootcamp() {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const createBootcamp = useCallback(async (courseData: CourseData) => {
    setCreating(true)
    setError(null)
    try {
      const res = await api.post<CreateResponse>('/bootcamp', courseData)
      return res.data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  return { createBootcamp, creating, error }
}
