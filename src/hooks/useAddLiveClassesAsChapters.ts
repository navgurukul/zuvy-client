import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type AddLiveClassesAsChaptersData = {
    sessionIds: number[]
    moduleId: number
}

export function useAddLiveClassesAsChapters() {
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const addLiveClassesAsChapters = useCallback(
        async (data: AddLiveClassesAsChaptersData) => {
            setAdding(true)
            setError(null)
            try {
                const res = await api.post('/classes/addliveClassesAsChapters', data)
                return res.data
            } catch (err) {
                setError(err)
                throw err
            } finally {
                setAdding(false)
            }
        },
        []
    )

    return { addLiveClassesAsChapters, adding, error }
}
