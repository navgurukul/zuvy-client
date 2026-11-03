'use client'

import { useCallback } from 'react'
import { api } from '@/utils/axios.config'

type FetchFormsStatusArgs = {
    courseId: number | string
    moduleId: number | string
    chapterId: number | string
    limit?: number | string
    offset?: number | string
    searchStudent?: string
    batchId?: number | string
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
}

export default function useFormsStatus() {
    const fetchFormsStatus = useCallback(
        async ({
            courseId,
            moduleId,
            chapterId,
            limit,
            offset,
            searchStudent,
            batchId,
            orderBy,
            orderDirection,
        }: FetchFormsStatusArgs) => {
            const queryParams = new URLSearchParams()
            queryParams.append('chapterId', String(chapterId))

            if (limit !== undefined) {
                queryParams.append('limit', String(limit))
            }

            if (offset !== undefined) {
                queryParams.append('offset', String(offset))
            }

            if (searchStudent) {
                queryParams.append('searchStudent', searchStudent)
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

            const response = await api.get(
                `/submission/formsStatus/${courseId}/${moduleId}?${queryParams.toString()}`
            )

            return response.data
        },
        []
    )

    return { fetchFormsStatus }
}
