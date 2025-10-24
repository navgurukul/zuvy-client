'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface Role {
    id: number
    name: string
    description: string
}

export interface RolesResponse {
    status: string
    message: string
    code: number
    data: Role[]
}

export function useRoles(initialFetch = true) {
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const getRoles = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<RolesResponse>('/users/get/roles')
            setRoles(res.data.data || [])
            setError(null)
        } catch (err) {
            setError(err)
            console.error('Error fetching roles:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) getRoles()
    }, [initialFetch, getRoles])

    return {
        roles,
        loading,
        error,
        refetchRoles: getRoles,
    }
}
