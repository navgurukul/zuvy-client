'use client'
import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { CourseData } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/submissionVideo/submissionVideoIdPageType'
import { getUser } from '@/store/store'
import { useParams } from 'next/navigation'

type CreateResponse = {
    status: string
    message: string
    bootcamp: { id: number }
}

export function useCreateBootcamp() {
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';
    const orgId = isSuperAdmin ? organizationId : user?.orgId
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const createBootcamp = useCallback(async (courseData: CourseData) => {
        setCreating(true)
        setError(null)
        try {
            const res = await api.post<CreateResponse>(`/bootcamp?organization_id=${orgId}`, courseData)
            return res.data
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setCreating(false)
        }
    }, [orgId])

    return { createBootcamp, creating, error }
}
