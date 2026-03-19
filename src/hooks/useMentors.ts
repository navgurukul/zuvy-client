'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface Mentor {
    userId: string
    name: string
    email: string
    role: string
    bio: string
    expertise: string[]
    title: string
}

type MentorsApiResponse = Mentor[] | { data: Mentor[] }

const parseMentorsResponse = (response: MentorsApiResponse): Mentor[] => {
    if (Array.isArray(response)) {
        return response
    }

    if (response && Array.isArray(response.data)) {
        return response.data
    }

    return []
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch mentors'
}

export function useMentors(search?: string, initialFetch = true) {
    const [mentors, setMentors] = useState<Mentor[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getMentors = useCallback(async (searchTerm?: string) => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams()
            if (searchTerm?.trim()) {
                queryParams.append('search', searchTerm.trim())
            }

            const url = `/mentors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
            const response = await api.get<MentorsApiResponse>(url)
            setMentors(parseMentorsResponse(response.data))
        } catch (error) {
            console.error('Error fetching mentors:', error)
            setMentors([])
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) getMentors(search)
    }, [initialFetch, getMentors, search])

    return {
        mentors,
        loading,
        error,
        refetchMentors: getMentors,
    }
}