'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'
import useDebounce from '@/app/[admin]/hooks/useDebounce'
import { getOrganizations, type Organization, type OrganizationApiResponse } from '@/utils/organizations'

export type { Organization, OrganizationApiResponse } from '@/utils/organizations'

interface UseOrganizationsParams {
    search?: string
    limit?: number
    page?: number
    auto?: boolean
    all?: boolean
}

export const useOrganizations = (params: UseOrganizationsParams = {}) => {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)

    const debouncedSearch = useDebounce(params.search, 500)

    const fetchOrganizations = useCallback(async (searchTerm?: string, page?: number, limit?: number, filterType?: string) => {
        // console.trace("fetchOrganizations called");
        console.count("fetchOrganizations");
        
        try {
            setLoading(true)
            setError(null)

            const response = await getOrganizations({
                search: searchTerm,
                page,
                limit: limit ?? params.limit,
                filterType,
                all: params.all,
            })

            if (response.status === 'success') {
                setOrganizations(response.data)
                setTotalCount(response.meta?.total ?? response.data.length)
                setTotalPages(response.meta?.totalPages ?? 1)
                setCurrentPage(response.meta?.page ?? 1)
            } else {
                throw new Error(response.message || 'Failed to fetch organizations')
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
    }, [params.all, params.limit])

    const refetchOrganizations = useCallback((searchTerm?: string, page?: number, limit?: number, filterType?: string) => {
        fetchOrganizations(searchTerm, page, limit, filterType)
    }, [fetchOrganizations])

    useEffect(() => {
        if (params.auto !== false) {
            fetchOrganizations(debouncedSearch, params.page, params.limit)
        }
    }, [debouncedSearch, fetchOrganizations, params.auto, params.page, params.limit])

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