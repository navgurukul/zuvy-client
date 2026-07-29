'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

type QuizVariantPayload = {
    question: string
    options: Record<number, string>
    correctOption: number
}

type AddQuizVariantsPayload = {
    quizId: number
    variantMCQs: QuizVariantPayload[]
}

export default function useAddQuizVariants(orgId: number) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const addQuizVariants = useCallback(
        async (payload: AddQuizVariantsPayload) => {
            setLoading(true)
            setError(null)

            try {
                return await api.post(`/Content/${orgId}/quiz/add/variants`, payload)
            } catch (err) {
                setError(err)
                throw err
            } finally {
                setLoading(false)
            }
        },
        [orgId]
    )

    return { addQuizVariants, loading, error }
}
