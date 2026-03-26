'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

export interface AssignPermissionsPayload {
    resourceId: number
    roleId: number
    orgId: number
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
        async (payload: AssignPermissionsPayload | AssignPermissionsPayload[]) => {
            try {
                setLoading(true)
                setError(null)
                setSuccess(false)

                const payloadList = Array.isArray(payload) ? payload : [payload]
                if (payloadList.length === 0) {
                    return undefined
                }

                let lastResponse: AssignPermissionsResponse | undefined

                for (const item of payloadList) {
                    const res = await api.post<AssignPermissionsResponse>(
                        '/rbac/assign/permissionsToRole',
                        item
                    )
                    lastResponse = res.data
                }

                setSuccess(true)
                toast.success({
                    title: lastResponse?.status || 'Success',
                    description: lastResponse?.message || 'Permissions updated successfully',
                })
                return lastResponse
            } catch (err: any) {
                setError(err)
                setSuccess(false)
                const rawMessage = err?.response?.data?.message
                const parsedMessage = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage

                toast.error({
                    title: err?.response?.data?.error || 'Error',
                    description: parsedMessage || 'Failed to update permissions',
                })
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