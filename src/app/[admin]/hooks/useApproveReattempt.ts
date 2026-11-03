'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

type ApproveReattemptResponse = {
    message?: string
    [key: string]: unknown
}

export function useApproveReattempt() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const approveReattempt = useCallback(
        async (assessmentSubmissionId: number | string) => {
            try {
                setLoading(true)
                setError(null)

                const response = await api.post<ApproveReattemptResponse>(
                    `admin/assessment/approve-reattempt?assessmentSubmissionId=${assessmentSubmissionId}`
                )
                return response
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
        approveReattempt,
        loading,
        error,
    }
}

export default useApproveReattempt
