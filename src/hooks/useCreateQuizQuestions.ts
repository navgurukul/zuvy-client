import { useState, useCallback } from 'react'
import { api } from '@/utils/axios.config'

export default function useCreateQuizQuestions(orgId: number) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>(null)

    const createQuizQuestions = useCallback(
        async (payload: any) => {
            setLoading(true)
            setError(null)
            try {
                const res = await api.post(`/content/${orgId}/quiz`, payload)
                setLoading(false)
                return res
            } catch (err) {
                setError(err)
                setLoading(false)
                throw err
            }
        },
        [orgId]
    )

    return {
        createQuizQuestions,
        loading,
        error,
    }
}
