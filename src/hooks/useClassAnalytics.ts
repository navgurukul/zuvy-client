import { useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { DisplayAttendance } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminCourseCourseIdComponentType'

export interface ClassAnalyticsParams {
    classId: string | number
}

export function useClassAnalytics() {
    const getClassAnalytics = useCallback(async ({ classId }: ClassAnalyticsParams): Promise<DisplayAttendance> => {
        const response = await api.get(`/classes/analytics/${classId}`)
        return response.data
    }, [])

    return { getClassAnalytics }
}

export default useClassAnalytics
