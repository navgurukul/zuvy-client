'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export type TopicOption = {
    id?: number
    name: string
    description?: string
}

type TopicsApiResponse =
    | TopicOption[]
    | {
          data?: TopicOption[]
          topics?: TopicOption[]
          topic?: TopicOption[]
          [key: string]: unknown
      }

const normalizeTopics = (response: TopicsApiResponse): TopicOption[] => {
    if (Array.isArray(response)) {
        return response
    }

    const list =
        (response.data as TopicOption[] | undefined) ||
        (response.topics as TopicOption[] | undefined) ||
        (response.topic as TopicOption[] | undefined) ||
        []

    return Array.isArray(list) ? list : []
}

export function useTopics(
    moduleId: number,
    bootcampId: number,
    enabled = true
) {
    const [topics, setTopics] = useState<TopicOption[]>([])
    const [loading, setLoading] = useState<boolean>(enabled)
    const [error, setError] = useState<string | null>(null)

    const fetchTopics = useCallback(async () => {
        if (
            !bootcampId ||
            Number.isNaN(bootcampId) ||
            !moduleId ||
            Number.isNaN(moduleId)
        ) {
            setTopics([])
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await api.get<TopicsApiResponse>(
                `${process.env.NEXT_PUBLIC_EVAL_URL}/topic/by-module/${moduleId}?bootcampId=${bootcampId}`
            )

            setTopics(normalizeTopics(response.data))
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to fetch topics'
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [bootcampId, moduleId])

    useEffect(() => {
        if (enabled) {
            fetchTopics()
        }
    }, [enabled, fetchTopics])

    return {
        topics,
        loading,
        error,
        refetch: fetchTopics,
    }
}
