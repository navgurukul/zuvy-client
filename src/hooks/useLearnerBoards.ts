'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface LearnerBoard {
    id?: number | string
    name: string
    [key: string]: any
}

interface LearnerBoardsResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        boards?: LearnerBoard[]
    } | LearnerBoard[] | string[]
}

const normalizeBoardDetails = (data: LearnerBoard[] | string[] | undefined): LearnerBoard[] => {
    if (!Array.isArray(data)) return []

    return data
        .map((item, index) => {
            if (typeof item === 'string') {
                return {
                    id: index,
                    name: item,
                }
            }

            return {
                ...item,
                id: item.id ?? index,
                name: item.name || item.board || item.title || '',
            }
        })
        .filter((item) => item.name)
}

export function useLearnerBoards(initialFetch = true) {
    const [boards, setBoards] = useState<LearnerBoard[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const fetchLearnerBoards = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<LearnerBoardsResponse>('/besic/learner-boards')
            // Access boards array from nested data structure
            let boardsData: LearnerBoard[] | string[] | undefined
            
            if (res.data?.data && typeof res.data.data === 'object' && 'boards' in res.data.data) {
                boardsData = res.data.data.boards
            } else {
                boardsData = res.data?.data as LearnerBoard[] | string[] | undefined
            }
            
            setBoards(normalizeBoardDetails(boardsData))
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setBoards([])
            console.error('Error fetching learner boards:', err)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) fetchLearnerBoards()
    }, [initialFetch, fetchLearnerBoards])

    return {
        boards,
        loading,
        error,
        refetchLearnerBoards: fetchLearnerBoards,
    }
}

export default useLearnerBoards