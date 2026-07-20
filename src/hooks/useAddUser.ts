'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type AddUserPayload = {
    name: string
    email: string
    roleId: number | null
    orgId?: number | string
}

export type AddUserResponse = {
    message?: string
    [key: string]: unknown
}

export function useAddUser() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const addUser = useCallback(async (payload: AddUserPayload) => {
        try {
            setLoading(true)
            setError(null)

            return await api.post<AddUserResponse>('/users/addUsers', payload)
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return { addUser, loading, error }
}
