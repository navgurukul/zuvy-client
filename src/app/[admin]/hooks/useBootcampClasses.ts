import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export function useBootcampClasses(courseId: string | string[] | undefined) {
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchClasses = useCallback(async () => {
        if (!courseId) return

        setLoading(true)
        setError(null)
        try {
            const res = await api.get(`/classes/bootcamp/${courseId}/classes`)
            setClasses(res.data.classes ?? [])
        } catch (err) {
            setError(err as Error)
            console.error('Failed to fetch classes', err)
        } finally {
            setLoading(false)
        }
    }, [courseId])

    useEffect(() => {
        fetchClasses()
    }, [fetchClasses])

    return { classes, loading, error, refetch: fetchClasses }
}
