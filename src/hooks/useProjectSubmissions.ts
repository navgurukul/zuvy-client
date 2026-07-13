import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'

// Module-level in-flight request deduplication
const inflightRequests = new Map<string, Promise<any>>()

interface UseProjectSubmissionsOptions {
  searchProject?: string
  enabled?: boolean
}

interface UseProjectSubmissionsResult {
  rawResponse: any
  bootcampModules: any[]
  totalStudents: number
  loading: boolean
  error: Error | null
  refetch: () => void
}

export const useProjectSubmissions = (
  bootcampId: string | number | undefined,
  options: UseProjectSubmissionsOptions = {}
): UseProjectSubmissionsResult => {
  const { searchProject = '', enabled = true } = options

  const [rawResponse, setRawResponse] = useState<any>(null)
  const [bootcampModules, setBootcampModules] = useState<any[]>([])
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

  const fetchData = useCallback(async () => {
    if (!bootcampId || !enabled) {
      setLoading(false)
      return
    }

    setError(null)

    try {
      let url = `/submission/submissionsOfProjects/${bootcampId}`
      if (searchProject) {
        url += `?searchProject=${searchProject}`
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

      const data = await request

      if (mountedRef.current) {
        setRawResponse(data)
        setBootcampModules(data?.data?.bootcampModules || [])
        setTotalStudents(data?.totalStudents || 0)
        setLoading(false)
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err)
        console.error('Error fetching project submissions:', err)
      }
    }
  }, [bootcampId, searchProject, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { rawResponse, bootcampModules, totalStudents, loading, error, refetch }
}
