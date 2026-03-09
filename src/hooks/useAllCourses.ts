'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import type {
    Course,
    CoursesResponse,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/submissionVideo/submissionVideoIdPageType'
import { coursePermissions } from './hookType'
import { db } from '@/lib/indexDb'
import { getUser } from '@/store/store'
import { useParams } from 'next/navigation'

export function useAllCourses(initialFetch = true) {
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';
    const orgId = isSuperAdmin ? organizationId : user?.orgId 
    const [allCourses, setAllCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const getAllCourses = useCallback(async () => {
        try {
            setLoading(true)
            if(orgId === undefined) return []
            const res = await api.get<CoursesResponse>(
                // '/bootcamp?limit=10&offset=0'
                 `/bootcamp/all/${orgId}`
            )
            setAllCourses(res.data.data)
            
            // Save permissions to IndexedDB
            const newPermissions = res.data.permissions;
            const existing = await db.permissions.toArray()
            // Only save if local DB is empty OR if there is a mismatch
            if (
                existing.length === 0 ||
                JSON.stringify(existing) !== JSON.stringify(newPermissions)
            ) {
                await db.permissions.clear()
                const entries = Object.entries(newPermissions).map(
                    ([key, value]) => ({ key, value })
                )
                await db.permissions.bulkPut(entries)
            }
            
            setError(null)
        } catch (err) {
            setError(err)
            // keep previous allCourses on error
            // console.error('Error fetching all courses:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) getAllCourses()
    }, [initialFetch, getAllCourses])

    return {
        allCourses,
        loading,
        error,
        refetchAllCourses: getAllCourses
    }
}
