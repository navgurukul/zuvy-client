'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface LearnerRole {
    id?: number | string
    name: string
    [key: string]: any
}

interface LearnerRolesResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        roles?: LearnerRole[]
    } | LearnerRole[] | string[]
}

const normalizeRoleDetails = (data: LearnerRole[] | string[] | undefined): LearnerRole[] => {
    if (!Array.isArray(data)) return []

    return data
        .map((item, index) => {
            if (typeof item === 'string') {
                return {
                    id: index,
                    name: item,
                }
            }

            return {
                ...item,
                id: item.id ?? index,
                name: item.name || item.role || item.title || '',
            }
        })
        .filter((item) => item.name)
}

export function useLearnerRoles(initialFetch = true) {
    const [roles, setRoles] = useState<LearnerRole[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const fetchLearnerRoles = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<LearnerRolesResponse>('/besic/learner-roles')
            // Access roles array from nested data structure
            let rolesData: LearnerRole[] | string[] | undefined
            
            if (res.data?.data && typeof res.data.data === 'object' && 'roles' in res.data.data) {
                rolesData = res.data.data.roles
            } else {
                rolesData = res.data?.data as LearnerRole[] | string[] | undefined
            }
            
            setRoles(normalizeRoleDetails(rolesData))
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setRoles([])
            console.error('Error fetching learner roles:', err)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) fetchLearnerRoles()
    }, [initialFetch, fetchLearnerRoles])

    return {
        roles,
        loading,
        error,
        refetchLearnerRoles: fetchLearnerRoles,
    }
}

export default useLearnerRoles