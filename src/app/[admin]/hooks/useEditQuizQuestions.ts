import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { EditQuizPayload } from './hookType'

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
