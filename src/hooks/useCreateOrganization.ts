'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface CreateOrganizationPayload {
    title: string
    displayName: string
    logoUrl: string
    pocName: string
    pocEmail: string
    isManagedByZuvy: boolean
    zuvyPocName: string | null
    zuvyPocEmail: string | null
}

export interface CreateOrganizationResponse {
    status: string
    message: string
    [key: string]: any
}

export function useCreateOrganization() {
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const createOrganization = useCallback(async (payload: CreateOrganizationPayload) => {
        setCreating(true)
        setError(null)

        try {
            const response = await api.post<CreateOrganizationResponse>('/org/create', payload)
            return response.data
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setCreating(false)
        }
    }, [])

    return { createOrganization, creating, error }
}
