import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
import {
  AssignmentApiResponse,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType'

// Module-level in-flight request deduplication
const inflightRequests = new Map<string, Promise<any>>()

interface UseAssignmentSubmissionsOptions {
  searchAssignment?: string
  enabled?: boolean
}

interface UseAssignmentSubmissionsResult {
  assignmentData: any[]
  totalStudents: number
  loading: boolean
  error: Error | null
  refetch: () => void
}

export const useAssignmentSubmissions = (
  bootcampId: string | number | undefined,
  options: UseAssignmentSubmissionsOptions = {}
): UseAssignmentSubmissionsResult => {
  const { searchAssignment = '', enabled = true } = options

  const [assignmentData, setAssignmentData] = useState<any[]>([])
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
      let url = `/submission/submissionsOfAssignment/${bootcampId}`
      if (searchAssignment) {
        url += `?searchAssignment=${searchAssignment}`
      }

      const cacheKey = url
      let request = inflightRequests.get(cacheKey)

      if (!request) {
        request = api
          .get<AssignmentApiResponse>(url)
          .then((res) => res.data)
          .finally(() => {
            inflightRequests.delete(cacheKey)
          })
        inflightRequests.set(cacheKey, request)
      }

      const res = await request

      if (mountedRef.current) {
        setAssignmentData(res.data.trackingData || [])
        setTotalStudents(res.data.totalStudents || 0)
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err)
        console.error('Error fetching assignment submissions:', err)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [bootcampId, searchAssignment, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { assignmentData, totalStudents, loading, error, refetch }
}
