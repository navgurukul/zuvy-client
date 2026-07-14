import { useState, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { AssessmentSubmissions } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType'

export interface BootcampAssessmentsResponse {
    totalStudents: number
    [moduleKey: string]: AssessmentSubmissions[] | number
}

export interface UseBootcampAssessmentsParams {
    courseId: string | number
    searchTerm?: string
}

export interface UseBootcampAssessmentsReturn {
    assessments: BootcampAssessmentsResponse | null
    loading: boolean
    error: string | null
    fetchAssessments: () => Promise<void>
    refetch: () => Promise<void>
}

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

    return {
        assessments,
        loading,
        error,
        fetchAssessments,
        refetch: fetchAssessments,
    }
}

export default useBootcampAssessments
