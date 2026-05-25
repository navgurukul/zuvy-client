'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface PermissionsResponse {
    status?: string
    message?: string
    code?: number
    data?: Array<{ id: number; name: string }>
}

export function useRbacPermissions(resourceId?: number, roleId?: number) {
    const [permissions, setPermissions] = useState<
        Array<{ id: number; name: string }>
    >([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<unknown>(null)

    const getPermissions = useCallback(
        async (rid?: number, roleId?: number) => {
            const id = typeof rid === 'number' ? rid : resourceId
            if (typeof id !== 'number') {
                setPermissions([])
                return []
            }

            try {
                setLoading(true)
                setError(null)
                const response = await api.get(
                    `permissions/${roleId}/permissions/${id}`
                )
                setPermissions(response.data)
                return response.data || []
            } catch (err) {
                setError(err)
                console.error(
                    'Error fetching permissions for resource:',
                    id,
                    err
                )
                return []
            } finally {
                setLoading(false)
            }
        },
        [resourceId]
    )

    // Helper function to fetch permissions for all resources
    const fetchAllPermissions = useCallback(
        async (resourceIds: number[], roleId: number) => {
            const permissionsData: Record<number, Array<{ id: number; name: string; granted?: boolean }>> = {}
            
            try {
                const promises = resourceIds.map(async (resourceId) => {
                    try {
                        const response = await api.get(
                            `permissions/${roleId}/permissions/${resourceId}`
                        )
                        return { resourceId, permissions: response.data || [] }
                    } catch (err) {
                        console.error(`Error fetching permissions for resource ${resourceId}:`, err)
                        return { resourceId, permissions: [] }
                    }
                })

                const results = await Promise.all(promises)
                results.forEach(({ resourceId, permissions }) => {
                    permissionsData[resourceId] = permissions
                })
            } catch (err) {
                console.error('Error fetching all permissions:', err)
            }

            return permissionsData
        },
        []
    )
    useEffect(() => {
        if (typeof resourceId === 'number') getPermissions(resourceId, roleId)
    }, [resourceId, getPermissions, roleId])


    return {
        permissions,
        loading,
        error,
        refetchPermissions: getPermissions,
        fetchAllPermissions,
    }
}

export default useRbacPermissions
