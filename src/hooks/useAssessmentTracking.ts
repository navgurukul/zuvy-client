import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

type FetchAssessmentTrackingParams = {
    submissionId?: string | number
    studentId?: string | number
}

export default function useAssessmentTracking() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAssessmentTracking = useCallback(
        async <T = any>({
            submissionId,
            studentId,
        }: FetchAssessmentTrackingParams): Promise<T | null> => {
            if (!submissionId || !studentId) {
                return null
            }

            setLoading(true)
            setError(null)

            try {
                const response = await api.get<T>(
                    `/tracking/assessment/submissionId=${submissionId}?studentId=${studentId}`
                )
                setData(response.data)
                return response.data
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message ||
                    err.message ||
                    'Failed to fetch assessment tracking data.'
                setError(errorMessage)
                setData(null)
                throw err
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return {
        data,
        loading,
        error,
        fetchAssessmentTracking,
    }
}
