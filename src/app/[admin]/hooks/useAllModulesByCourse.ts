'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export type CourseModule = {
    id: number
    name: string
    description?: string
    typeId?: number
    order?: number
    projectId?: number | null
    timeAlloted?: number
    ChapterId?: number
    quizCount?: number
    assignmentCount?: number
    codingProblemsCount?: number
    articlesCount?: number
    formCount?: number
}

type AllModulesResponse = {
    modules?: CourseModule[]
    permissions?: Record<string, boolean>
}

export function useAllModulesByCourse(courseId: number, enabled = true) {
    const [modules, setModules] = useState<CourseModule[]>([])
    const [loading, setLoading] = useState<boolean>(enabled)
    const [error, setError] = useState<string | null>(null)
    const [permissions, setPermissions] = useState<Record<string, boolean>>({})

    const fetchModules = useCallback(async () => {
        if (!courseId || Number.isNaN(courseId)) {
            setModules([])
            setPermissions({})
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await api.get<AllModulesResponse>(
                `/content/allModules/${courseId}`
            )

            const modulesList = Array.isArray(response.data?.modules)
                ? response.data.modules
                : []

            setModules(modulesList)
            setPermissions(response.data?.permissions || {})
        } catch (err: any) {
            setModules([])
            setPermissions({})
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    'Failed to fetch modules'
            )
        } finally {
            setLoading(false)
        }
    }, [courseId])

    useEffect(() => {
        if (enabled) {
            fetchModules()
            return
        }

        setModules([])
        setPermissions({})
        setLoading(false)
    }, [enabled, fetchModules])

    return {
        modules,
        permissions,
        loading,
        error,
        refetch: fetchModules,
    }
}
