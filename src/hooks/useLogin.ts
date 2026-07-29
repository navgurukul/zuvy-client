'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { AuthResponse } from '@/app/auth/login/_components/componentLogin'
import type { AxiosResponse } from 'axios'

export interface LoginPayload {
    email: string
    googleIdToken: string
}

export function useLogin() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<unknown>(null)

    const login = useCallback(async (payload: LoginPayload): Promise<AxiosResponse<AuthResponse>> => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.post<AuthResponse>('/auth/login', payload)
            return response
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        login,
        loading,
        error,
    }
}

export default useLogin
