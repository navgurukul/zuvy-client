import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
// import { UseLiveClassSubmissionsOptions, UseLiveClassSubmissionsResult } from './hookType'

const inflightRequests = new Map<string, Promise<any>>()

interface UseLiveClassSubmissionsOptions {
  searchTerm?: string
  enabled?: boolean
}

interface UseLiveClassSubmissionsResult {
  liveClassData: any[]
  totalStudents: number
  loading: boolean
  error: Error | null
  refetch: () => void
  fetchLiveClassSubmissions: (fetchBootcampId: string | number, fetchSearchTerm?: string) => Promise<any>
}
export const useLiveClassSubmissions = (
  bootcampId: string | number | undefined,
  options: UseLiveClassSubmissionsOptions = {}
): UseLiveClassSubmissionsResult => {
  const { searchTerm = '', enabled = true } = options

  const [liveClassData, setLiveClassData] = useState<any[]>([])
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
      let url = `/submission/livesession/zuvy_livechapter_submissions?bootcamp_id=${bootcampId}`
      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`
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

      const res = await request

      if (mountedRef.current) {
        const trackingData = res?.data?.trackingData || []
        const total = res?.data?.totalStudents || 0
        setLiveClassData(trackingData)
        setTotalStudents(total)
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err)
        console.error('Error fetching live class submissions:', err)
      }
    }
    finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [bootcampId, searchTerm, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  const fetchLiveClassSubmissions = useCallback(async (
    fetchBootcampId: string | number,
    fetchSearchTerm?: string
  ) => {
    let url = `/submission/livesession/zuvy_livechapter_submissions?bootcamp_id=${fetchBootcampId}`
    if (fetchSearchTerm) {
      url += `&searchTerm=${encodeURIComponent(fetchSearchTerm)}`
    }
    const res = await api.get(url)
    return res
  }, [])

  return { liveClassData, totalStudents, loading, error, refetch, fetchLiveClassSubmissions }
}
