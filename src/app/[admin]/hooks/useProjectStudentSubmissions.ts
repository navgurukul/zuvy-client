'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

type FetchProjectStudentSubmissionsParams = {
    projectId: string
    bootcampId: string
    batchId?: string
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
    searchStudent?: string
    limit?: number | string
    offset?: number | string
}

type ProjectStudentSubmissionsResponse = {
    projectTrackingData: any[]
    data: any
}

export function useProjectStudentSubmissions() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const fetchProjectStudentSubmissions = useCallback(
        async ({
            projectId,
            bootcampId,
            batchId,
            orderBy,
            orderDirection,
            searchStudent,
            limit,
            offset,
        }: FetchProjectStudentSubmissionsParams): Promise<ProjectStudentSubmissionsResponse> => {
            const queryParams = new URLSearchParams()

            if (batchId && batchId !== 'all') {
                queryParams.append('batchId', batchId)
            }
            if (orderBy) {
                queryParams.append('orderBy', orderBy)
            }
            if (orderDirection) {
                queryParams.append('orderDirection', orderDirection)
            }
            if (searchStudent) {
                queryParams.append('searchStudent', searchStudent)
            }
            if (limit !== undefined) {
                queryParams.append('limit', limit.toString())
            }
            if (offset !== undefined) {
                queryParams.append('offset', offset.toString())
            }

            try {
                setLoading(true)
                setError(null)

                const res = await api.get(
                    `/submission/projects/students?projectId=${projectId}&bootcampId=${bootcampId}&${queryParams.toString()}`
                )

                return {
                    projectTrackingData:
                        res.data.projectSubmissionData?.projectTrackingData ||
                        [],
                    data: res.data,
                }
            } catch (err) {
                setError(err)
                throw err
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return {
        fetchProjectStudentSubmissions,
        loading,
        error,
    }
}

export default useProjectStudentSubmissions
