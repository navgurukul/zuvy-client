import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
import { VideoData } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType'

const inflightRequests = new Map<string, Promise<any>>()

interface UseVideoSubmissionsOptions {
  searchAssessment?: string
  enabled?: boolean
}

interface UseVideoSubmissionsResult {
  videoData: VideoData | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

export const useVideoSubmissions = (
  bootcampId: string | number | undefined,
  options: UseVideoSubmissionsOptions = {}
): UseVideoSubmissionsResult => {
  const { searchAssessment = '', enabled = true } = options

  const [videoData, setVideoData] = useState<VideoData | null>(null)
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
      let url = `/admin/bootcampModuleCompletion/bootcamp_id${bootcampId}`
      if (searchAssessment) {
        url += `?searchAssessment=${searchAssessment}`
      }

      const cacheKey = url
      let request = inflightRequests.get(cacheKey)

      if (!request) {
        request = api
          .get<VideoData>(url)
          .then((res) => res.data)
          .finally(() => {
            inflightRequests.delete(cacheKey)
          })
        inflightRequests.set(cacheKey, request)
      }

      const res = await request

      if (mountedRef.current) {
        setVideoData(res)
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err)
        console.error('Error fetching video submissions:', err)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [bootcampId, searchAssessment, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { videoData, loading, error, refetch }
}
