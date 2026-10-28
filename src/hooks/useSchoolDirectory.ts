import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface School {
  udiseCode: string
  schoolName: string
  village: string
  block: string
  pincode: string
  management: string
  classFrom: number
  classTo: number
}

interface ListResponse<T> {
  status: 'success' | 'error' | string
  data: T
}

export interface SchoolsResponse {
  status: 'success' | 'error' | string
  data: School[]
  total: number
  limit: number
  offset: number
}

export interface UseSchoolsOptions {
  state?: string
  city?: string
  search?: string
  limit?: number
  offset?: number
  enabled?: boolean
}

interface UseListResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }

  return fallback
}

export const useSchoolStates = (): UseListResult<string> => {
  const [states, setStates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get<ListResponse<string[]>>('/schools/states')
      setStates(Array.isArray(response.data?.data) ? response.data.data : [])
    } catch (requestError) {
      console.error('Error fetching school states:', requestError)
      setStates([])
      setError(getErrorMessage(requestError, 'Failed to fetch school states'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStates()
  }, [fetchStates])

  return { data: states, loading, error, refetch: fetchStates }
}

export const useSchoolCities = (state: string): UseListResult<string> => {
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCities = useCallback(async () => {
    if (!state) {
      setCities([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.get<ListResponse<string[]>>('/schools/cities', {
        params: { state },
      })
      setCities(Array.isArray(response.data?.data) ? response.data.data : [])
    } catch (requestError) {
      console.error('Error fetching school cities:', requestError)
      setCities([])
      setError(getErrorMessage(requestError, 'Failed to fetch school cities'))
    } finally {
      setLoading(false)
    }
  }, [state])

  useEffect(() => {
    void fetchCities()
  }, [fetchCities])

  return { data: cities, loading, error, refetch: fetchCities }
}

export const useSchools = ({
  state = '',
  city = '',
  search = '',
  limit = 50,
  offset = 0,
  enabled = true,
}: UseSchoolsOptions = {}) => {
  const [schools, setSchools] = useState<School[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentOffsetRef = useRef(offset)
  const requestInFlightRef = useRef(false)

  const fetchSchools = useCallback(async () => {
    if (!enabled || !state || !city) {
      setSchools([])
      setTotal(0)
      currentOffsetRef.current = offset
      requestInFlightRef.current = false
      setLoading(false)
      setError(null)
      return
    }

    requestInFlightRef.current = true
    setLoading(true)
    setError(null)

    try {
      const response = await api.get<SchoolsResponse>('/schools', {
        params: { state, city, search: search || undefined, limit, offset },
      })
      setSchools(Array.isArray(response.data?.data) ? response.data.data : [])
      setTotal(response.data?.total ?? 0)
      currentOffsetRef.current = offset
    } catch (requestError) {
      console.error('Error fetching schools:', requestError)
      setSchools([])
      setTotal(0)
      currentOffsetRef.current = offset
      setError(getErrorMessage(requestError, 'Failed to fetch schools'))
    } finally {
      requestInFlightRef.current = false
      setLoading(false)
    }
  }, [city, enabled, limit, offset, search, state])

  useEffect(() => {
    void fetchSchools()
  }, [fetchSchools])

  const loadMore = useCallback(async () => {
    if (
      !enabled ||
      !state ||
      !city ||
      requestInFlightRef.current ||
      schools.length >= total
    ) {
      return
    }

    const nextOffset = currentOffsetRef.current + limit
    requestInFlightRef.current = true
    setLoadingMore(true)
    setError(null)

    try {
      const response = await api.get<SchoolsResponse>('/schools', {
        params: { state, city, search: search || undefined, limit, offset: nextOffset },
      })
      const nextSchools = Array.isArray(response.data?.data) ? response.data.data : []

      setSchools(currentSchools => {
        const existingCodes = new Set(currentSchools.map(school => school.udiseCode))
        return [
          ...currentSchools,
          ...nextSchools.filter(school => !existingCodes.has(school.udiseCode)),
        ]
      })
      setTotal(response.data?.total ?? total)
      currentOffsetRef.current = nextOffset
    } catch (requestError) {
      console.error('Error loading more schools:', requestError)
      setError(getErrorMessage(requestError, 'Failed to load more schools'))
    } finally {
      requestInFlightRef.current = false
      setLoadingMore(false)
    }
  }, [city, enabled, limit, search, state, schools.length, total])

  return {
    data: schools,
    total,
    limit,
    offset,
    loading,
    loadingMore,
    hasMore: schools.length < total,
    error,
    refetch: fetchSchools,
    loadMore,
  }
}
