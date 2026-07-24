'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import { Mentor, MentorsApiResponse, MentorsPaginatedResponse, ParsedMentorsResponse, GetMentorsParams } from './hookTypes'

const parseMentorsResponse = (response: MentorsApiResponse): ParsedMentorsResponse => {
    if (Array.isArray(response)) {
        return {
            data: response,
            limit: response.length,
            offset: 0,
            total: response.length,
            hasMore: false,
        }
    }

    if (response && Array.isArray(response.data)) {
        const typedResponse = response as Partial<MentorsPaginatedResponse>

        return {
            data: response.data,
            limit: typedResponse.limit ?? response.data.length,
            offset: typedResponse.offset ?? 0,
            total: typedResponse.total ?? response.data.length,
            hasMore: typedResponse.hasMore ?? false,
        }
    }

    return {
        data: [],
        limit: 0,
        offset: 0,
        total: 0,
        hasMore: false,
    }
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch mentors'
}

export function useMentors(search?: string, initialFetch = true, limit = 10, offset = 0, organizationId?: string | number) {
    const [mentors, setMentors] = useState<Mentor[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState<number>(0)
    const [hasMore, setHasMore] = useState<boolean>(false)

    const getMentors = useCallback(async (params: GetMentorsParams = {}) => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams()
            const searchValue = params.searchTerm?.trim()

            if (searchValue) {
                queryParams.append('search', searchValue)
            }

            if (typeof params.limit === 'number') {
                queryParams.append('limit', String(params.limit))
            }

            if (typeof params.offset === 'number') {
                queryParams.append('offset', String(params.offset))
            }

            if (params.organizationId) {
                queryParams.append('organizationId', String(params.organizationId))
            }

            const url = `/student/mentors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
            const response = await api.get<MentorsApiResponse>(url)
            const parsedResponse = parseMentorsResponse(response.data)

            setMentors(parsedResponse.data)
            setTotal(parsedResponse.total)
            setHasMore(parsedResponse.hasMore)
        } catch (error) {
            console.error('Error fetching mentors:', error)
            setMentors([])
            setTotal(0)
            setHasMore(false)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) {
            getMentors({ searchTerm: search, limit, offset, organizationId })
        }
    }, [initialFetch, getMentors, limit, offset, organizationId, search])

    return {
        mentors,
        loading,
        error,
        total,
        hasMore,
        refetchMentors: getMentors,
    }
}
