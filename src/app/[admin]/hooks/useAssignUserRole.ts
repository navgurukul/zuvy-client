'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { AssignUserRolePayload, AssignUserRoleResponse } from './hookType'

export function useAssignUserRole() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const assignUserRole = useCallback(
        async (payload: AssignUserRolePayload): Promise<AssignUserRoleResponse> => {
            try {
                setLoading(true)
                setError(null)

                const res = await api.post<AssignUserRoleResponse>(
                    '/users/users/assign-role',
                    payload
                )

                return res.data
            } catch (err: any) {
                setError(err)
                throw err
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return { assignUserRole, loading, error }
}

export default useAssignUserRole