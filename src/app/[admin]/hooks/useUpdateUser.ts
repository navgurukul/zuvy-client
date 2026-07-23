'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type UpdateUserPayload = {
    name: string
    email: string
    roleId: number | null
    orgId?: number | string
}

export type UpdateUserResponse = {
    message?: string
    [key: string]: unknown
}

export function useUpdateUser() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const updateUser = useCallback(async (userId: number | string, payload: UpdateUserPayload) => {
        try {
            setLoading(true)
            setError(null)

            return await api.put<UpdateUserResponse>(`/users/updateUser/${userId}`, payload)
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return { updateUser, loading, error }
}
