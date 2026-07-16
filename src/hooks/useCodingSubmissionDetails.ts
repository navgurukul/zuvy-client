'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

type FetchCodingSubmissionDetailsParams = {
    questionId: string | number
    studentId?: string | number
    assessmentSubmissionId?: string | number
    codingOutsourseId?: string | number
}

export function useCodingSubmissionDetails() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const fetchCodingSubmissionDetails = useCallback(
        async <TResponse = unknown>({
            questionId,
            studentId,
            assessmentSubmissionId,
            codingOutsourseId,
        }: FetchCodingSubmissionDetailsParams): Promise<TResponse> => {
            const queryParams = new URLSearchParams()

            if (assessmentSubmissionId !== undefined) {
                queryParams.append(
                    'assessmentSubmissionId',
                    assessmentSubmissionId.toString()
                )
            }
            if (studentId !== undefined) {
                queryParams.append('studentId', studentId.toString())
            }
            if (codingOutsourseId !== undefined) {
                queryParams.append(
                    'codingOutsourseId',
                    codingOutsourseId.toString()
                )
            }

            const queryString = queryParams.toString()
            const url = `/codingPlatform/submissions/questionId=${questionId}${
                queryString ? `?${queryString}` : ''
            }`

            try {
                setLoading(true)
                setError(null)

                const res = await api.get<TResponse>(url)

                return res.data
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
        fetchCodingSubmissionDetails,
        loading,
        error,
    }
}

export default useCodingSubmissionDetails
