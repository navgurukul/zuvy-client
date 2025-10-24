'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

export interface AssignPermissionsPayload {
    resourceId: number
    roleId: number
    permissions: Record<string | number, boolean>
}

export interface AssignPermissionsResponse<T = any> {
    status?: string
    message?: string
    code?: number
    data?: T
}

export function useAssignPermissions() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)
    const [success, setSuccess] = useState<boolean>(false)

    const assignPermissions = useCallback(
        async (payload: AssignPermissionsPayload) => {
            try {
                setLoading(true)
                setError(null)
                setSuccess(false)

                const res = await api.post<AssignPermissionsResponse>(
                    '/rbac/assign/permissionsToRole',
                    payload
                )
                setSuccess(true)
                toast.success({
                    title: res.data.status,
                    description: res.data.message,
                })
                return res.data
            } catch (err) {
                setError(err)
                setSuccess(false)
                throw err
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return { assignPermissions, loading, error, success }
}

export default useAssignPermissions

