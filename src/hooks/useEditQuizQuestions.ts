import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type EditQuizPayload = {
    id: number
    title: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    tagId: number
    content: string
    isRandomOptions: boolean
    variantMCQs: Array<{
        variantNumber: number
        question: string
        options: Record<number, string>
        correctOption: number
    }>
}

export default function useEditQuizQuestions(orgId: number) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>(null)

    const editQuizQuestions = useCallback(
        async (payload: EditQuizPayload) => {
            setLoading(true)
            setError(null)

            try {
                return await api.post(`/Content/${orgId}/editquiz`, payload)
            } catch (err) {
                setError(err)
                throw err
            } finally {
                setLoading(false)
            }
        },
        [orgId]
    )

    return { editQuizQuestions, loading, error }
}
