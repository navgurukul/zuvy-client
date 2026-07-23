'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export function useDeleteSession() {
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<any>(null)

    const deleteSession = useCallback(
        async (
            sessionId: string | number,
            options?: { deleteChapter?: boolean }
        ) => {
            setDeleting(true)
            setError(null)

            try {
                const query = options?.deleteChapter ? '?deleteChapter=true' : ''
                const response = await api.delete(
                    `/classes/sessions/${sessionId}${query}`
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

    return { deleteSession, deleting, error }
}

export default useDeleteSession
