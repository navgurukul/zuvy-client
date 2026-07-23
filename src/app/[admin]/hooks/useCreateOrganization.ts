'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { CreateOrganizationPayload, CreateOrganizationResponse } from './hookType'

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
