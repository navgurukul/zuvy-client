'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import { getUser } from '@/store/store'
import { useParams } from 'next/navigation'
import { Role, RolesResponse } from './hookType'

// These live for the lifetime of the client bundle. All mounted consumers of
// useRoles for the same organization therefore share both the loaded value and
// an in-progress request.
const rolesCache = new Map<number, Role[]>()
const pendingRoleRequests = new Map<number, Promise<Role[]>>()

const fetchRolesForOrganization = (orgId: number, force = false): Promise<Role[]> => {
    if (!force) {
        const cachedRoles = rolesCache.get(orgId)
        if (cachedRoles) return Promise.resolve(cachedRoles)

        const pendingRequest = pendingRoleRequests.get(orgId)
        if (pendingRequest) return pendingRequest
    }

    const request = api
        .get<RolesResponse>(`/users/get/all/roles/${orgId}`)
        .then((res) => {
            const roles = res.data.data || []
            rolesCache.set(orgId, roles)
            return roles
        })
        .finally(() => {
            pendingRoleRequests.delete(orgId)
        })

    pendingRoleRequests.set(orgId, request)
    return request
}

export function useRoles(initialFetch = true) {
    const { organizationId } = useParams()
    const { user } = getUser()
    const orgId = Number(organizationId) || user?.orgId; 
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const getRoles = useCallback(async (force = false) => {
        if (orgId === undefined) {
            setLoading(false)
            return []
        }

        try {
            setLoading(true)
            const fetchedRoles = await fetchRolesForOrganization(orgId, force)
            setRoles(fetchedRoles)
            setError(null)
            return fetchedRoles
        } catch (err) {
            setError(err)
            console.error('Error fetching roles:', err)
            return []
        } finally {
            setLoading(false)
        }
    }, [orgId])

    useEffect(() => {
        if (initialFetch) getRoles()
    }, [initialFetch, getRoles])

    return {
        roles,
        loading,
        error,
        refetchRoles: () => getRoles(true),
    }
}
