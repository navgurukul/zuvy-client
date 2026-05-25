'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface LearnerRemoteLocation {
    id?: number | string
    name: string
    [key: string]: any
}

interface LearnerRemoteLocationsResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        remoteLocations?: LearnerRemoteLocation[]
    } | LearnerRemoteLocation[] | string[]
}

const normalizeRemoteLocations = (data: LearnerRemoteLocation[] | string[] | undefined): LearnerRemoteLocation[] => {
    if (!Array.isArray(data)) return []

    return data
        .map((item, index) => {
            if (typeof item === 'string') {
                return {
                    id: index,
                    name: item,
                }
            }

            return {
                ...item,
                id: item.id ?? index,
                name: item.name || item.location || item.title || '',
            }
        })
        .filter((item) => item.name)
}

export function useLearnerRemoteLocations(initialFetch = true) {
    const [remoteLocations, setRemoteLocations] = useState<LearnerRemoteLocation[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const fetchLearnerRemoteLocations = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<LearnerRemoteLocationsResponse>('/besic/learner-remote-locations')
            let locationsData: LearnerRemoteLocation[] | string[] | undefined

            if (res.data?.data && typeof res.data.data === 'object' && 'remoteLocations' in res.data.data) {
                locationsData = res.data.data.remoteLocations
            } else {
                locationsData = res.data?.data as LearnerRemoteLocation[] | string[] | undefined
            }

            setRemoteLocations(normalizeRemoteLocations(locationsData))
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setRemoteLocations([])
            console.error('Error fetching learner remote locations:', err)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) fetchLearnerRemoteLocations()
    }, [initialFetch, fetchLearnerRemoteLocations])

    return {
        remoteLocations,
        loading,
        error,
        refetchLearnerRemoteLocations: fetchLearnerRemoteLocations,
    }
}

export default useLearnerRemoteLocations
