'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export function useEditAssessment() {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)

  const editAssessment = useCallback(
    async (
      assessmentOutsourceId: string | number,
      chapterId: string | number,
      data: any
    ) => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.put(
          `Content/editAssessment/${assessmentOutsourceId}/${chapterId}`,
          data
        )
        return response
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { editAssessment, loading, error }
}

export default useEditAssessment
