import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type EditModulePayload = {
  moduleDto?: any
  reOrderDto?: any
}

/**
 * Hook to call:
 *   PUT /content/editModuleOfBootcamp/{courseId}?moduleId={moduleId}
 *
 * Returns { editModule, loading, error }.
 */
export function useEditModuleOfBootcamp() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const editModule = useCallback(
    async (
      courseId: string | number,
      moduleId: string | number,
      payload: EditModulePayload,
      options?: { onSuccess?: (res: any) => void; onError?: (err: any) => void }
    ) => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.put(
          `/content/editModuleOfBootcamp/${courseId}?moduleId=${moduleId}`,
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

  return { editModule, loading, error }
}

export default useEditModuleOfBootcamp
