'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface RbacResource {
    id: number
    title: string
    description: string
    permissions: string[]
}

export interface RawRbacResource {
    id?: number
    name?: string
    title?: string
    description?: string
    permissions?: string[]
    actions?: string[]
    resource?: string
}

export interface RbacResourcesResponse {
    status?: string
    message?: string
    code?: number
    data?: RawRbacResource[]
}

function normalizeResource(raw: RawRbacResource, index: number): RbacResource {
    const id = typeof raw.id === 'number' ? raw.id : index + 1
    const title = (
        raw.title ||
        raw.name ||
        raw.resource ||
        'Unnamed Resource'
    ).toString()
    const description = (raw.description || '').toString()
    const permissions = Array.isArray(raw.permissions)
        ? raw.permissions
        : Array.isArray(raw.actions)
        ? raw.actions
        : []
    return { id, title, description, permissions }
}

export function useRbacResources(initialFetch = true) {
    const [resources, setResources] = useState<RbacResource[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const getResources = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await api.get<RbacResourcesResponse>('/rbac/resources')
            const raw = (res.data?.data ?? []) as RawRbacResource[]
            const normalized = raw.map(normalizeResource)
            setResources(normalized)
        } catch (err) {
            setError(err)
            console.error('Error fetching RBAC resources:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) getResources()
    }, [initialFetch, getResources])

    const hasData = useMemo(() => resources.length > 0, [resources])

    return {
        resources,
        loading,
        error,
        hasData,
        refetchResources: getResources,
    }
}

export default useRbacResources

