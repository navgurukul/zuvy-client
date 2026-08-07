import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
import { UsePracticeProblemSubmissionsOptions, UsePracticeProblemSubmissionsResult } from './hookType'

// Module-level in-flight request deduplication
// Follows the same pattern as useCourseExistenceCheck
const inflightRequests = new Map<string, Promise<any>>()

export const usePracticeProblemSubmissions = (
  bootcampId: string | number | undefined,
  options: UsePracticeProblemSubmissionsOptions = {}
): UsePracticeProblemSubmissionsResult => {
  const { searchPractiseProblem = '', enabled = true } = options

  const [trackingData, setTrackingData] = useState<any[]>([])
  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const fetchSubmissions = useCallback(async (searchQuery?: string) => {
    if (!bootcampId) {
      return { trackingData: [], totalStudents: 0 }
    }

    let url = `/submission/submissionsOfPractiseProblems/${bootcampId}`
    const term = searchQuery !== undefined ? searchQuery : searchPractiseProblem
    if (term) {
      url += `?searchPractiseProblem=${term}`
    }

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
  }, [bootcampId, searchPractiseProblem])

  const fetchData = useCallback(async () => {
    if (!bootcampId || !enabled) {
      setLoading(false)
      return
    }

    setError(null)

    try {
      const data = await fetchSubmissions()

      if (mountedRef.current) {
        setTrackingData(data.trackingData || [])
        setTotalStudents(data.totalStudents || 0)
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err)
        console.error('Error fetching practice problem submissions:', err)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [bootcampId, enabled, fetchSubmissions])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { trackingData, totalStudents, loading, error, refetch, fetchSubmissions }
}
