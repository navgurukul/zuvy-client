'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type AddUserPayload = {
    name: string
    email: string
    roleId: number | null
    orgId?: number | string | undefined
}

export type UpdateUserPayload = AddUserPayload

export type DeleteUserResponse = {
    message?: string
    [key: string]: unknown
}

export type AddUserResponse = {
    message?: string
    [key: string]: unknown
}

export type UpdateUserResponse = {
    message?: string
    [key: string]: unknown
}

export function useUsers() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const addUser = useCallback(async (payload: AddUserPayload) => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.post<AddUserResponse>('/users/addUsers', payload)
            return response
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const updateUser = useCallback(async (userId: number | string, payload: UpdateUserPayload) => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.put<UpdateUserResponse>(`/users/updateUser/${userId}`, payload)
            return response
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const deleteUser = useCallback(async (userId: number | string, orgId?: number | string) => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.delete<DeleteUserResponse>(
                `/users/deleteUser/${userId}?orgId=${orgId}`
            )
            return response
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        addUser,
        updateUser,
        deleteUser,
        loading,
        error,
    }
}

export default useUsers