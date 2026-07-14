'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export type BatchListItem = {
    id: number | string
    name: string
}

export type BatchPermissions = {
    createBatch: boolean
    deleteBatch: boolean
    editBatch: boolean
    viewBatch: boolean
}

type UseBatchListReturn = {
    batchData: BatchListItem[]
    permissions: BatchPermissions | null
    loading: boolean
    error: unknown
    refetch: () => void
}

/**
 * Fetches the flat batch list for a given courseId.
 * Single responsibility: only the batch list, no CRUD, no pagination, no form logic.
 * Also returns permissions from the same response — zero extra API calls.
 * Used anywhere a simple batch dropdown/select is needed.
 */
export function useBatchList(
    courseId: string | number | undefined,
    { enabled = true }: { enabled?: boolean } = {}
): UseBatchListReturn {
    const [batchData, setBatchData] = useState<BatchListItem[]>([])
    const [permissions, setPermissions] = useState<BatchPermissions | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const fetchBatches = useCallback(async () => {
        if (!courseId || !enabled) return

        setLoading(true)
        setError(null)
        try {
            const res = await api.get(`/bootcamp/batches/${courseId}`)
            setBatchData(res.data?.data || [])
            setPermissions(res.data?.permissions || null)
        } catch (err) {
            console.error('useBatchList: Error fetching batches', err)
            setError(err)
            setBatchData([])
            setPermissions(null)
        } finally {
            setLoading(false)
        }
    }, [courseId, enabled])

    useEffect(() => {
        fetchBatches()
    }, [fetchBatches])

    return { batchData, permissions, loading, error, refetch: fetchBatches }
}
