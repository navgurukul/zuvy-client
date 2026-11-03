'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { IndividualStudentData } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/submissionProjects/[StudentsProjects]/IndividualReport/IndividualReportPageType'

type FetchIndividualProjectReportParams = {
    userId: string | number
    projectId: string | number
    bootcampId: string | number
}

export function useIndividualProjectReport() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const fetchIndividualProjectReport = useCallback(
        async ({
            userId,
            projectId,
            bootcampId,
        }: FetchIndividualProjectReportParams): Promise<IndividualStudentData> => {
            try {
                setLoading(true)
                setError(null)

                const res = await api.get<IndividualStudentData>(
                    `/submission/projectDetail/${userId}?projectId=${projectId}&bootcampId=${bootcampId}`
                )

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
        fetchIndividualProjectReport,
        loading,
        error,
    }
}

export default useIndividualProjectReport
