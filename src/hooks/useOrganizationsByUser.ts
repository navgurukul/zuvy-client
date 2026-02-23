'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

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

export function useOrganizationsByUser(userId: number | null) {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<unknown>(null)

    const fetchOrganizations = useCallback(async (userId: number) => {
        try {
            if (!userId) return

            setLoading(true)
            setError(null)
            const res = await api.get<OrganizationsResponse>(`/org/getOrgByUserId/${userId}`)
            
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
            fetchOrganizations(userId)
        } else {
            setOrganizations([])
            setLoading(false)
        }
    }, [userId, fetchOrganizations])

    return {
        organizations,
        loading,
        error,
    }
}
