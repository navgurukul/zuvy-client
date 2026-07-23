'use client'

import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export default function useDeleteQuizVariant(orgId: number) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const deleteQuizVariant = useCallback(
        async (variantId: number) => {
            setLoading(true)
            setError(null)

            try {
                return await api({
                    method: 'delete',
                    url: `/Content/${orgId}/deleteMainQuizOrVariant`,
                    data: {
                        questionIds: [{ id: variantId, type: 'variant' }],
                    },
                })
            } catch (err) {
                setError(err)
                throw err
            } finally {
                setLoading(false)
            }
        },
        [orgId]
    )

    return { deleteQuizVariant, loading, error }
}
