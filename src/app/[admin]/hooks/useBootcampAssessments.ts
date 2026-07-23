import { useState, useCallback, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { UseBootcampAssessmentsParams, UseBootcampAssessmentsReturn, BootcampAssessmentsResponse } from './hookType'

const useBootcampAssessments = ({
    courseId,
    searchTerm,
}: UseBootcampAssessmentsParams): UseBootcampAssessmentsReturn => {
    const [assessments, setAssessments] =
        useState<BootcampAssessmentsResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAssessments = useCallback(async (): Promise<void> => {
        if (!courseId) return

        setLoading(true)
        setError(null)

        try {
            const url = searchTerm
                ? `/admin/bootcampAssessment/bootcamp_id${courseId}?searchAssessment=${searchTerm}`
                : `/admin/bootcampAssessment/bootcamp_id${courseId}`

            const res = await api.get<BootcampAssessmentsResponse>(url)
            setAssessments(res.data)
        } catch (err: any) {
            console.error('Error fetching bootcamp assessments:', err)
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Failed to fetch bootcamp assessments'
            )
        } finally {
            setLoading(false)
        }
    }, [courseId, searchTerm])

    useEffect(() => {
        fetchAssessments()
    }, [fetchAssessments])

    return {
        assessments,
        loading,
        error,
        fetchAssessments,
        refetch: fetchAssessments,
    }
}

export default useBootcampAssessments
