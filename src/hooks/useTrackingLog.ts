'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/utils/axios.config'
import { getUser } from '@/store/store'
import { UseTrackingLogArgs, UseTrackingLogReturn, TrackingLogResponse, TrackingLogEntry } from './hookType'

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
            if (!orgId) {
                setError(new Error('Organization ID is required'))
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)

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
                
                const res = await api.get<TrackingLogResponse>(`/trackinglog?${queryString}`)
                
                if (res.data?.success && res.data?.data) {
                    const { logs, pagination } = res.data.data
                    
                    setTrackingLogs(logs || [])
                    setTotalRows(pagination?.total || 0)
                    setPagination({
                        offset: pagination?.offset || 0,
                        limit: pagination?.limit || 100,
                        total: pagination?.total || 0
                    })
                } else {
                    setTrackingLogs([])
                    setTotalRows(0)
                }
                setError(null)
            } catch (err) {
                setError(err)
                setTrackingLogs([])
                setTotalRows(0)
                console.error('Error fetching tracking log:', err)
            } finally {
                setLoading(false)
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
        if (initialFetch && orgId) {
            fetchTrackingLog()
        }
    }, [initialFetch, fetchTrackingLog, orgId])

    return {
        trackingLogs,
        loading,
        error,
        totalRows,
        pagination,
        refetch: fetchTrackingLog,
        fetchTrackingLog
    }
}