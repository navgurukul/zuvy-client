'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type LiveClassStudentSubmissionParams = {
    liveClassId: string | number
    limit?: number
    offset?: number
    batchId?: string
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
    searchTerm?: string
}

const inFlightRequests = new Map<string, Promise<any>>()

export function useLiveClassStudentSubmissions() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const fetchLiveClassStudentSubmissions = useCallback(
        async ({
            liveClassId,
            limit = 10,
            offset = 0,
            batchId,
            orderBy,
            orderDirection,
            searchTerm,
        }: LiveClassStudentSubmissionParams) => {
            const queryParams = new URLSearchParams({
                limit: String(limit),
                offset: String(offset),
            })

            if (batchId && batchId !== 'all') queryParams.set('batchId', batchId)
            if (orderBy) queryParams.set('orderBy', orderBy)
            if (orderDirection) queryParams.set('orderDirection', orderDirection)
            if (searchTerm?.trim()) {
                queryParams.set('name', searchTerm)
                queryParams.set('email', searchTerm)
            }

            const url = `/submission/livesession/zuvy_livechapter_student_submission/${liveClassId}?${queryParams.toString()}`
            let request = inFlightRequests.get(url)

            if (!request) {
                request = api.get(url).then((response) => response.data?.data)
                inFlightRequests.set(url, request)
            }

            try {
                setLoading(true)
                setError(null)
                return await request
            } catch (requestError) {
                setError(requestError)
                throw requestError
            } finally {
                if (inFlightRequests.get(url) === request) {
                    inFlightRequests.delete(url)
                }
                setLoading(false)
            }
        },
        []
    )

    return { fetchLiveClassStudentSubmissions, loading, error }
}
