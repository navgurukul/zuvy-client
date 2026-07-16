'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/utils/axios.config'
import { getUser } from '@/store/store'
import { UseTrackingLogArgs, UseTrackingLogReturn, TrackingLogResponse, TrackingLogEntry } from './hookType'

interface TrackingLogFetchResult {
    logs: TrackingLogEntry[]
    pagination: {
        offset: number
        limit: number
        total: number
    }
}

const pendingTrackingLogRequests = new Map<string, Promise<TrackingLogFetchResult>>()

export function useTrackingLog({
    orgId: propOrgId,
    actorUserId,
    action,
    role,
    status,
    offset = 0,
    limit = 100,
    timeRange = 'all',
    search = '',
    initialFetch = true
}: UseTrackingLogArgs = {}): UseTrackingLogReturn {
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin'
    
    // Determine orgId from props, URL params, or user data
    const orgId = propOrgId || (isSuperAdmin ? Number(organizationId) : user?.orgId)

    const [trackingLogs, setTrackingLogs] = useState<TrackingLogEntry[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)
    const [totalRows, setTotalRows] = useState(0)
    const [pagination, setPagination] = useState({
        offset: 0,
        limit: 100,
        total: 0
    })

    const stableLimit = useMemo(() => {
        const n = typeof limit === 'string' ? Number(limit) : limit
        return Number.isFinite(n) ? n : 100
    }, [limit])

    const stableOffset = useMemo(() => {
        const n = typeof offset === 'string' ? Number(offset) : offset
        return Number.isFinite(n) ? n : 0
    }, [offset])

    const initialFetchState = useRef({ fetchedOrgId: orgId, hasFetched: false })

    const buildQueryString = useCallback((params: {
        orgId?: number | string
        actorUserId?: number | string
        action?: string
        role?: string
        status?: string
        offset: number
        limit: number
        timeRange: string
        search?: string
    }) => {
        const queryParams = new URLSearchParams()
        
        if (params.orgId) queryParams.append('orgId', String(params.orgId))
        if (params.actorUserId) queryParams.append('actorUserId', String(params.actorUserId))
        if (params.action) queryParams.append('action', params.action)
        if (params.role) queryParams.append('role', params.role)
        if (params.status) queryParams.append('status', params.status)
        queryParams.append('offset', String(params.offset))
        queryParams.append('limit', String(params.limit))
        queryParams.append('timeRange', params.timeRange)
        if (params.search) queryParams.append('search', params.search)

        return queryParams.toString()
    }, [])

    const fetchTrackingLog = useCallback(
        async (params?: Partial<UseTrackingLogArgs>) => {
            const updateState = params?.updateState !== false

            if (!orgId) {
                if (updateState) {
                    setError(new Error('Organization ID is required'))
                    setLoading(false)
                }
                return []
            }

            try {
                if (updateState) {
                    setLoading(true)
                    setError(null)
                }

                const finalParams = {
                    orgId,
                    actorUserId: params?.actorUserId || actorUserId,
                    action: params?.action || action,
                    role: params?.role || role,
                    status: params?.status || status,
                    offset: params?.offset !== undefined ? params.offset : stableOffset,
                    limit: params?.limit !== undefined ? params.limit : stableLimit,
                    timeRange: params?.timeRange || timeRange,
                    search: params?.search !== undefined ? params.search : search
                }

                const queryString = buildQueryString(finalParams)

                if (pendingTrackingLogRequests.has(queryString)) {
                    const existingRequest = pendingTrackingLogRequests.get(queryString)
                    if (existingRequest) {
                        const existingResult = await existingRequest
                        if (updateState) {
                            setTrackingLogs(existingResult.logs)
                            setTotalRows(existingResult.pagination.total)
                            setPagination(existingResult.pagination)
                        }
                        return existingResult.logs
                    }
                }

                const requestPromise = (async () => {
                    const res = await api.get<TrackingLogResponse>(`/trackinglog?${queryString}`)

                    const result: TrackingLogFetchResult = {
                        logs: [],
                        pagination: {
                            offset: 0,
                            limit: 100,
                            total: 0
                        }
                    }

                    if (res.data?.success && res.data?.data) {
                        const { logs: responseLogs, pagination } = res.data.data

                        result.logs = responseLogs || []
                        result.pagination = {
                            offset: pagination?.offset || 0,
                            limit: pagination?.limit || 100,
                            total: pagination?.total || 0
                        }
                    }

                    return result
                })()

                pendingTrackingLogRequests.set(queryString, requestPromise)

                try {
                    const result = await requestPromise
                    if (updateState) {
                        setTrackingLogs(result.logs)
                        setTotalRows(result.pagination.total)
                        setPagination(result.pagination)
                    }
                    return result.logs
                } finally {
                    if (pendingTrackingLogRequests.get(queryString) === requestPromise) {
                        pendingTrackingLogRequests.delete(queryString)
                    }
                }
            } catch (err) {
                if (updateState) {
                    setError(err)
                    setTrackingLogs([])
                    setTotalRows(0)
                }
                console.error('Error fetching tracking log:', err)
                return []
            } finally {
                if (updateState) {
                    setLoading(false)
                }
            }
        },
        [
            orgId,
            actorUserId,
            action,
            role,
            status,
            stableOffset,
            stableLimit,
            timeRange,
            search,
            buildQueryString
        ]
    )

    useEffect(() => {
        if (!initialFetch || !orgId) {
            return
        }

        if (
            initialFetchState.current.hasFetched &&
            initialFetchState.current.fetchedOrgId === orgId
        ) {
            return
        }

        initialFetchState.current = {
            hasFetched: true,
            fetchedOrgId: orgId
        }

        fetchTrackingLog()
    }, [initialFetch, fetchTrackingLog, orgId])

    const refetch = useCallback(async (params?: Partial<UseTrackingLogArgs>) => {
        await fetchTrackingLog(params)
    }, [fetchTrackingLog])

    return {
        trackingLogs,
        loading,
        error,
        totalRows,
        pagination,
        refetch,
        fetchTrackingLog
    }
}