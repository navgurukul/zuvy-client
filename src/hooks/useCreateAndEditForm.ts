'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export function useCreateAndEditForm() {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)

  const createAndEditForm = useCallback(
    async (
      chapterId: string | number,
      payload: any
    ) => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.post(
          `Content/createAndEditForm/${chapterId}`,
          payload
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

  return { createAndEditForm, loading, error }
}

export default useCreateAndEditForm
