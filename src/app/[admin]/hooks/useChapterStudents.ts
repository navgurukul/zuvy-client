import { useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { UseChapterStudentsOptions } from './hookType'

const inflightRequests = new Map<string, Promise<any>>()

export const useChapterStudents = () => {
  const getChapterStudentsUrl = useCallback((
    chapterId: string | number,
    options: UseChapterStudentsOptions = {}
  ) => {
    const { searchStudent, limit, offset, batchId, orderBy, orderDirection } = options
    const queryParams = new URLSearchParams()
    
    if (searchStudent) queryParams.append('searchStudent', searchStudent)
    if (limit) queryParams.append('limit', limit.toString())
    if (offset) queryParams.append('offset', offset.toString())
    if (batchId && batchId !== 'all') queryParams.append('batchId', batchId)
    if (orderBy) queryParams.append('orderBy', orderBy)
    if (orderDirection) queryParams.append('orderDirection', orderDirection)

    const qs = queryParams.toString()
    return qs 
      ? `/admin/moduleChapter/students/chapter_id${chapterId}?${qs}`
      : `/admin/moduleChapter/students/chapter_id${chapterId}`
  }, [])

  const fetchChapterStudents = useCallback(
      async (
        chapterId: string | number,
        options: UseChapterStudentsOptions = {}
      ) => {
        const url = getChapterStudentsUrl(chapterId, options)

        const cachedRequest = inflightRequests.get(url)
        if (cachedRequest) {
          return cachedRequest
        }

        const request = api.get(url)

        inflightRequests.set(url, request)

        request.finally(() => {
          inflightRequests.delete(url)
        })

        return request
      },
      [getChapterStudentsUrl]
    )

    return { fetchChapterStudents, getChapterStudentsUrl }
  }
