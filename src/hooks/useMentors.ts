'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface Mentor {
    userId: string
    name: string
    email: string
    role: string | null
    bio: string | null
    expertise: string[] | null
    title: string | null
}

interface MentorsPaginatedResponse {
    limit: number
    offset: number
    total: number
    hasMore: boolean
    data: Mentor[]
}

type MentorsApiResponse = Mentor[] | { data?: Mentor[] } | MentorsPaginatedResponse

interface ParsedMentorsResponse {
    data: Mentor[]
    limit: number
    offset: number
    total: number
    hasMore: boolean
}

interface GetMentorsParams {
    searchTerm?: string
    limit?: number
    offset?: number
}

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

export function useMentors(search?: string, initialFetch = true, limit = 10, offset = 0) {
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

            const url = `/mentors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
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
            getMentors({ searchTerm: search, limit, offset })
        }
    }, [initialFetch, getMentors, limit, offset, search])

    return {
        mentors,
        loading,
        error,
        total,
        hasMore,
        refetchMentors: getMentors,
    }
}