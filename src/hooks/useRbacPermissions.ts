'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface PermissionsResponse {
    status?: string
    message?: string
    code?: number
    data?: Array<{ id: number; name: string }>
}

export function useRbacPermissions(resourceId?: number) {
    const [permissions, setPermissions] = useState<
        Array<{ id: number; name: string }>
    >([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<unknown>(null)

    const getPermissions = useCallback(
        async (rid?: number) => {
            const id = typeof rid === 'number' ? rid : resourceId
            if (typeof id !== 'number') {
                setPermissions([])
                return
            }

            try {
                setLoading(true)
                setError(null)
                const response = await api.get<[null, PermissionsResponse]>(
                    `permissions/1/permissions/${id}`
                )
                const [, apiResponse] = response.data
                const list = apiResponse.data ?? []
                setPermissions(Array.isArray(list) ? list : [])
            } catch (err) {
                setError(err)
                setPermissions([])
                console.error(
                    'Error fetching permissions for resource:',
                    id,
                    err
                )
            } finally {
                setLoading(false)
            }
        },
        [resourceId]
    )

    useEffect(() => {
        if (typeof resourceId === 'number') getPermissions(resourceId)
    }, [resourceId, getPermissions])

    return {
        permissions,
        loading,
        error,
        refetchPermissions: getPermissions,
    }
}

export default useRbacPermissions
