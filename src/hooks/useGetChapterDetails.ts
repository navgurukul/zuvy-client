import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { AxiosResponse } from 'axios'

export type ChapterDetailsParams = {
  chapterId: string | number
  bootcampId?: string | number
  moduleId?: string | number
  topicId?: string | number
}

export function useGetChapterDetails() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const getChapterDetails = useCallback(
    async ({
      chapterId,
      bootcampId,
      moduleId,
      topicId,
    }: ChapterDetailsParams): Promise<AxiosResponse<any>> => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (bootcampId != null) params.set('bootcampId', String(bootcampId))
        if (moduleId != null) params.set('moduleId', String(moduleId))
        if (topicId != null) params.set('topicId', String(topicId))

        const url = `/Content/chapterDetailsById/${chapterId}${
          params.toString() ? `?${params.toString()}` : ''
        }`

        const res = await api.get(url)
        return res
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { getChapterDetails, loading, error }
}

export default useGetChapterDetails