import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type CreateModulePayload = {
  name: string
  description: string
  timeAlloted: number
}

/**
 * Hook to call:
 *   POST /content/modules/{courseId}?typeId={typeId}
 *
 * Returns { createModule, loading, error }.
 */
export function useCreateModule() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const createModule = useCallback(
    async (
      courseId: string | number,
      typeId: string | number,
      payload: CreateModulePayload,
      options?: { onSuccess?: (res: any) => void; onError?: (err: any) => void }
    ) => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.post(
          `/content/modules/${courseId}?typeId=${typeId}`,
          payload
        )
        options?.onSuccess?.(res)
        return res
      } catch (err) {
        setError(err)
        options?.onError?.(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createModule, loading, error }
}

export default useCreateModule
