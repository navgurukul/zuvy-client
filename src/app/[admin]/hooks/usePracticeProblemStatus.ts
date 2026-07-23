import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
import { UsePracticeProblemStatusOptions, UsePracticeProblemStatusResult } from './hookType'

const inflightRequests = new Map<string, Promise<any>>()

export const usePracticeProblemStatus = (
  moduleId: string | number | undefined,
  options: UsePracticeProblemStatusOptions = {}
): UsePracticeProblemStatusResult => {
  const {
    chapterId,
    questionId,
    searchStudent = '',
    batchId = 'all',
    orderBy = '',
    orderDirection = 'asc',
    enabled = true,
  } = options

  const [studentDetails, setStudentDetails] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const buildUrl = useCallback((params: Partial<UsePracticeProblemStatusOptions>) => {
    if (!moduleId) return ''
    const currentChapterId = params.chapterId ?? chapterId
    const currentQuestionId = params.questionId ?? questionId
    const currentSearchStudent = params.searchStudent ?? searchStudent
    const currentBatchId = params.batchId ?? batchId
    const currentOrderBy = params.orderBy ?? orderBy
    const currentOrderDirection = params.orderDirection ?? orderDirection

    let url = `/submission/practiseProblemStatus/${moduleId}`
    const queryParams = new URLSearchParams()

    if (currentChapterId !== undefined) {
      queryParams.append('chapterId', currentChapterId.toString())
    }
    if (currentQuestionId !== undefined) {
      queryParams.append('questionId', currentQuestionId.toString())
    }
    if (currentSearchStudent) {
      queryParams.append('searchStudent', currentSearchStudent)
    }
    if (currentBatchId && currentBatchId !== 'all') {
      queryParams.append('batchId', currentBatchId)
    }
    if (currentOrderBy) {
      queryParams.append('orderBy', currentOrderBy)
    }
    if (currentOrderDirection) {
      queryParams.append('orderDirection', currentOrderDirection)
    }

    const queryString = queryParams.toString()
    return queryString ? `${url}?${queryString}` : url
  }, [moduleId, chapterId, questionId, searchStudent, batchId, orderBy, orderDirection])

  const fetchStatus = useCallback(async (customParams?: Partial<UsePracticeProblemStatusOptions>) => {
    const url = buildUrl(customParams || {})
    if (!url) return { data: [] }

    const cacheKey = url
    let request = inflightRequests.get(cacheKey)

    if (!request) {
      request = api
        .get(url)
        .then((res) => res.data)
        .finally(() => {
          inflightRequests.delete(cacheKey)
        })
      inflightRequests.set(cacheKey, request)
    }

    return await request
  }, [buildUrl])

  const fetchData = useCallback(async () => {
    if (!moduleId || !enabled || chapterId === undefined || questionId === undefined) {
      setLoading(false)
      return
    }

    setError(null)

    try {
      const res = await fetchStatus()

      if (mountedRef.current) {
        setStudentDetails(res?.data || [])
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err)
        console.error('Error fetching practice problem status:', err)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [moduleId, enabled, chapterId, questionId, fetchStatus])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { studentDetails, loading, error, refetch, fetchStatus }
}
