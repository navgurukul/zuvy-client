'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

type UseAssignmentDetailForAUserArgs = {
    chapterId?: number | string
    userId?: number | string
    auto?: boolean
}

export default function useAssignmentDetailForAUser({
    chapterId,
    userId,
    auto = true,
}: UseAssignmentDetailForAUserArgs) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(!!auto)
    const [error, setError] = useState<string | null>(null)

    const fetchAssignmentDetailForAUser = useCallback(async () => {
        if (!chapterId || !userId) {
            setData(null)
            setLoading(false)
            return null
        }

        try {
            setLoading(true)
            setError(null)

            const res = await api.get(
                `/submission/getAssignmentDetailForAUser?chapterId=${chapterId}&userId=${userId}`
            )
            const assignmentDetail = res?.data?.data || null

            setData(assignmentDetail)
            return assignmentDetail
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Error fetching Student Details'
            setError(message)
            setData(null)
            return null
        } finally {
            setLoading(false)
        }
    }, [chapterId, userId])

    useEffect(() => {
        if (auto) {
            fetchAssignmentDetailForAUser()
        }
    }, [auto, fetchAssignmentDetailForAUser])

    return {
        data,
        loading,
        error,
        refetch: fetchAssignmentDetailForAUser,
    }
}
