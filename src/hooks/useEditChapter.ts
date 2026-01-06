import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type EditChapterPayload = {
  title?: string
  articleContent?: string[] | string | null
  links?: any | null
  completionDate?: string | null
  description?: string | null
}

/**
 * Simple hook to call:
 *   PUT /Content/editChapterOfModule/{moduleId}?chapterId={chapterId}
 *
 * Returns { editChapter, loading, error }.
 */
export function useEditChapter() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const editChapter = useCallback(
    async (
      moduleId: string | number,
      chapterId: string | number,
      payload: EditChapterPayload,
      options?: { onSuccess?: (res: any) => void; onError?: (err: any) => void }
    ) => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.put(
          `/Content/editChapterOfModule/${moduleId}?chapterId=${chapterId}`,
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

  return { editChapter, loading, error }
}

export default useEditChapter