'use client'

import { useCallback } from 'react'
import { api } from '@/utils/axios.config'

type FetchFormDetailsByIdArgs = {
    moduleId: number | string
    chapterId: number | string
    userId: number | string
}

export default function useFormDetailsById() {
    const fetchFormDetailsById = useCallback(
        async ({ moduleId, chapterId, userId }: FetchFormDetailsByIdArgs) => {
            const response = await api.get(
                `submission/getFormDetailsById/${moduleId}?chapterId=${chapterId}&userId=${userId}`
            )

            return response.data
        },
        []
    )

    return { fetchFormDetailsById }
}
