'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type CreateChapterPayload = {
    moduleId: number
    bootcampId: number
    topicId: number
}

export function useChapterActions() {
    const [creating, setCreating] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<any>(null)

    const createChapter = useCallback(async (payload: CreateChapterPayload) => {
        setCreating(true)
        setError(null)

        try {
            const response = await api.post('Content/chapter', payload)
            return response
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setCreating(false)
        }
    }, [])

    const deleteChapter = useCallback(
        async (moduleId: string | number, chapterId: string | number) => {
            setDeleting(true)
            setError(null)

            try {
                const response = await api.delete(
                    `/content/deleteChapter/${moduleId}?chapterId=${chapterId}`
                )
                return response
            } catch (err) {
                setError(err)
                throw err
            } finally {
                setDeleting(false)
            }
        },
        []
    )

    return { createChapter, deleteChapter, creating, deleting, error }
}

export const useDeleteChapter = useChapterActions

export default useChapterActions
