'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { DeleteUserResponse } from './hookType'

export function useDeleteUser() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const deleteUser = useCallback(async (userId: number | string, orgId?: number | string) => {
        try {
            setLoading(true)
            setError(null)

            return await api.delete<DeleteUserResponse>(`/users/deleteUser/${userId}?orgId=${orgId}`)
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return { deleteUser, loading, error }
}
