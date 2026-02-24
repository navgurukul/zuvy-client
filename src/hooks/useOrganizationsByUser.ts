'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import useDebounce from '@/hooks/useDebounce'

export interface Organization {
    // id: number
    // title: string
    // code: string
    // logoUrl: string | null
    // isVerified: boolean
    // joinedAt: string
    id: number
    title: string
    code: string
    isManagedByZuvy: boolean
    logoUrl: string
    pocName: string
    pocEmail: string
    zuvyPocName: string
    zuvyPocEmail: string
    isVerified: boolean
    createdAt: string
    updatedAt: string
    version: string | null
}

export interface OrganizationsResponse {
    status: string
    message: string
    statusCode: number
    data: Organization[]
}

export function useOrganizationsByUser(userId: number | null, search?: string) {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<unknown>(null)
    const debouncedSearch = useDebounce(search, 500)

    const fetchOrganizations = useCallback(async (userId: number, searchTerm?: string) => {
        try {
            if (!userId) return

            setLoading(true)
            setError(null)
            const queryParams = new URLSearchParams()
            if (searchTerm) queryParams.append('search', searchTerm)
            const url = `/org/getOrgByUserId/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
            const res = await api.get<OrganizationsResponse>(url)

            // Get the organizations data from the response
            const organizationsData = res?.data?.data || []
            setOrganizations(organizationsData)
        } catch (err) {
            setError(err)
            console.error('Error fetching organizations:', err)
            setOrganizations([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (userId) {
            fetchOrganizations(userId, debouncedSearch)
        } else {
            setOrganizations([])
            setLoading(false)
        }
    }, [userId, fetchOrganizations, debouncedSearch])

    return {
        organizations,
        loading,
        error,
    }
}
