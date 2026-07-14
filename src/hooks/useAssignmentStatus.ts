'use client'

import { useCallback } from 'react'
import { api } from '@/utils/axios.config'

type FetchAssignmentStatusArgs = {
    chapterId: number | string
    limit?: number | string
    offset?: number | string
    batchId?: number | string
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
}

export default function useAssignmentStatus() {
    const fetchAssignmentStatus = useCallback(
        async ({
            chapterId,
            limit,
            offset,
            batchId,
            orderBy,
            orderDirection,
        }: FetchAssignmentStatusArgs) => {
            const queryParams = new URLSearchParams()

            if (limit !== undefined) {
                queryParams.append('limit', String(limit))
            }

            if (offset !== undefined) {
                queryParams.append('offset', String(offset))
            }

            if (batchId !== undefined) {
                queryParams.append('batchId', String(batchId))
            }

            if (orderBy) {
                queryParams.append('orderBy', orderBy)
            }

            if (orderDirection) {
                queryParams.append('orderDirection', orderDirection)
            }

            const res = await api.get(
                `/submission/assignmentStatus?chapterId=${chapterId}&${queryParams.toString()}`
            )

            return res?.data?.data
        },
        []
    )

    return { fetchAssignmentStatus }
}
