'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import useDebounce from '@/hooks/useDebounce'

export interface Organization {
    id: number
    title: string
    displayName: string
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

interface ApiResponse {
    status: string
    message: string
    statusCode: number
    data: Organization[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

interface UseOrganizationsParams {
    search?: string
    limit?: number
    page?: number
    auto?: boolean
}

export const useOrganizations = (params: UseOrganizationsParams = {}) => {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)

    const debouncedSearch = useDebounce(params.search, 500)

    // Update fetchOrganizations to accept filter parameter
    const fetchOrganizations = useCallback(async (searchTerm?: string, page?: number, limit?: number, filterType?: string) => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams()
            if (searchTerm) queryParams.append('search', searchTerm)
            if (limit) queryParams.append('limit', limit.toString())
            if (page) queryParams.append('page', page.toString())
            if (filterType) queryParams.append('filterType', filterType) // Add filter parameter

            const url = `/org/getAllOrgs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
            
            const response = await api.get<ApiResponse>(url)
            
            if (response.data.status === 'success') {
                setOrganizations(response.data.data)
                setTotalCount(response.data.meta.total)
                setTotalPages(response.data.meta.totalPages)
                setCurrentPage(response.data.meta.page)
            } else {
                throw new Error(response.data.message || 'Failed to fetch organizations')
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch organizations'
            setError(errorMessage)
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }, []) // Empty dependency array

    const refetchOrganizations = useCallback((searchTerm?: string, page?: number, limit?: number, filterType?: string) => {
        fetchOrganizations(searchTerm, page, limit, filterType)
    }, [fetchOrganizations])

    // Only run auto fetch once with initial params
    useEffect(() => {
        if (params.auto !== false) {
            fetchOrganizations(debouncedSearch, params.page, params.limit)
        }
    }, [debouncedSearch])

    return {
        organizations,
        loading,
        error,
        totalCount,
        totalPages,
        currentPage,
        refetchOrganizations,
        fetchOrganizations
    }
}