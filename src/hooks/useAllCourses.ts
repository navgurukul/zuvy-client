'use client'
import { useCallback, useEffect, useState, useRef } from 'react'
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
    const orgId = Number(organizationId) || user?.orgId;
    const [allCourses, setAllCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    // track last completed request to avoid loop on error
    const lastKeyRef = useRef<string>('')
    const inFlightKeyRef = useRef<string>('')

    const getAllCourses = useCallback(async () => {
        const key = `${orgId}`;
        if (key === inFlightKeyRef.current || key === lastKeyRef.current) {
            return
        }

        try {
            inFlightKeyRef.current = key
            setLoading(true)
            if (!orgId || isNaN(orgId)) {
                setAllCourses([])
                return
            }
            const res = await api.get<CoursesResponse>(
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
            lastKeyRef.current = key
        } catch (err) {
            setError(err)
            // Block loop on error by marking as fetched for this orgId
            lastKeyRef.current = key
        } finally {
            inFlightKeyRef.current = ''
            setLoading(false)
        }
    }, [orgId])

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
