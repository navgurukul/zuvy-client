'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

type FetchStudentAssessmentsParams = {
    assessmentId: string
    offset?: number
    limit?: number | string
    searchStudent?: string
    batchId?: string
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
    requester?: (url: string) => Promise<{ data: any }>
}

type StudentAssessmentsResponse = {
    assessments: any[]
    moduleAssessment: any
    passPercentage: number
    totalPages: number
    lastPage: number
}

const emptyResponse: StudentAssessmentsResponse = {
    assessments: [],
    moduleAssessment: {},
    passPercentage: 0,
    totalPages: 0,
    lastPage: 0,
}

const DEDUPE_WINDOW_MS = 1000
const inFlightRequests = new Map<string, Promise<StudentAssessmentsResponse>>()
const recentResponses = new Map<
    string,
    {
        response: StudentAssessmentsResponse
        timestamp: number
    }
>()

export function useStudentAssessments() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const fetchStudentAssessments = useCallback(
        async ({
            assessmentId,
            offset,
            limit,
            searchStudent = '',
            batchId,
            orderBy,
            orderDirection,
            requester,
        }: FetchStudentAssessmentsParams): Promise<StudentAssessmentsResponse> => {
            if (!assessmentId) return emptyResponse

            const queryParams = new URLSearchParams()

            if (batchId && batchId !== 'all') {
                queryParams.append('batchId', batchId)
            }

            if (searchStudent) {
                queryParams.append('searchStudent', searchStudent)
            }

            if (orderBy) {
                queryParams.append('orderBy', orderBy)
            }

            if (orderDirection) {
                queryParams.append('orderDirection', orderDirection)
            }

            if (offset !== undefined) {
                queryParams.append('offset', offset.toString())
            }

            if (limit !== undefined) {
                queryParams.append('limit', limit.toString())
            }

            const queryString = queryParams.toString()
            const endpoint = `/admin/assessment/students/assessment_id${assessmentId}${
                queryString ? `?${queryString}` : ''
            }`

            const inFlightRequest = inFlightRequests.get(endpoint)
            if (inFlightRequest) {
                return inFlightRequest
            }

            const recentResponse = recentResponses.get(endpoint)
            if (
                recentResponse &&
                Date.now() - recentResponse.timestamp < DEDUPE_WINDOW_MS
            ) {
                return recentResponse.response
            }

            try {
                setLoading(true)
                setError(null)

                const request = requester || api.get
                const requestPromise = request(endpoint).then((res) => {
                    const moduleAssessment = res.data.ModuleAssessment || {}
                    const assessments =
                        res.data.submitedOutsourseAssessments || []
                    const calculatedTotalPages = limit
                        ? Math.ceil(
                              (moduleAssessment.totalSubmitedStudents || 0) /
                                  Number(limit)
                          )
                        : 0
                    const totalPages = limit
                        ? calculatedTotalPages
                        : moduleAssessment.totalPages || 0

                    return {
                        assessments,
                        moduleAssessment,
                        passPercentage: moduleAssessment.passPercentage || 0,
                        totalPages,
                        lastPage: totalPages,
                    }
                })

                inFlightRequests.set(endpoint, requestPromise)

                const response = await requestPromise
                recentResponses.set(endpoint, {
                    response,
                    timestamp: Date.now(),
                })
                return response
            } catch (err) {
                setError(err)
                throw err
            } finally {
                inFlightRequests.delete(endpoint)
                setLoading(false)
            }
        },
        []
    )

    return {
        fetchStudentAssessments,
        loading,
        error,
    }
}

export default useStudentAssessments
