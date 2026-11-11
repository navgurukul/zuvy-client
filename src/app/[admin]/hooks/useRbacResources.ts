'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/utils/axios.config'
import { RawRbacResource, RbacResource, RbacResourcesResponse } from './hookType'

function normalizeResource(
    raw: RawRbacResource,
    index: number,
    parentGroupId: number | null = null,
    parentId: number | null = null,
    depth = 0,
): RbacResource {
    const id = typeof raw.resourceId === 'number'
        ? raw.resourceId
        : typeof raw.id === 'number'
            ? raw.id
            : index + 1
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
    const isParent = raw.isParent ?? (raw.parentResourceId !== undefined && raw.parentResourceId === null)
    return {
        id,
        title,
        description,
        permissions,
        parentResourceId: isParent ? null : raw.parentResourceId ?? parentGroupId,
        parentId: isParent ? null : parentId,
        parentGroupId: isParent ? raw.id ?? null : parentGroupId,
        isParent,
        depth,
    }
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
            let nextIndex = raw.length
            const normalized: RbacResource[] = []
            const visit = (
                resource: RawRbacResource,
                index: number,
                parentGroupId: number | null = null,
                parentId: number | null = null,
                depth = 0,
            ) => {
                const normalizedResource = normalizeResource(
                    resource,
                    index,
                    parentGroupId,
                    parentId,
                    depth,
                )
                normalized.push(normalizedResource)

                const childGroupId = normalizedResource.isParent
                    ? resource.id ?? null
                    : parentGroupId
                ;(resource.children ?? []).forEach((child) => {
                    visit(child, nextIndex++, childGroupId, normalizedResource.id, depth + 1)
                })
            }

            raw.forEach((resource, index) => visit(resource, index))
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

