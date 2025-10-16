'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface User {
    id: number
    name: string
    email: string
    roleId: number
    roleName: string
    roleDescription: string
    createdAt: string
    updatedAt: string
}


export function useUser(userId: number | null) {
    const [user, setUser] = useState<User>()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<unknown>(null)

    const getUser = useCallback(async (userId: number) => {
        try {
            if (!userId) return

            setLoading(true)
            setError(null)
            const res = await api.get<User>(`/users/getUser/${userId}`)
            
            // Get the user data from the response
            const userData = res?.data
            setUser(userData)
        } catch (err) {
            setError(err)
            console.error('Error fetching user:', err)
            setUser(undefined)
        } finally {
            setLoading(false)
        }
    }, []) 

    useEffect(() => {
        if (userId) {
            getUser(userId)
        } else {
            setUser(undefined)
            setLoading(false)
        }
    }, [userId, getUser])

    return {
        user,
        loading,
        error,
    }
}