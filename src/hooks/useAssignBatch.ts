import { useCallback } from 'react'
import { api } from '@/utils/axios.config'

export interface AssignBatchParams {
    bootcampId?: string | number
    batchId?: string | number
    students?: { name: string; email: string }[]
}

export function useAssignBatch() {
    const assignBatch = useCallback(async ({ bootcampId, batchId, students }: AssignBatchParams) => {
        const response = await api.post(`/bootcamp/students/${bootcampId}?batch_id=${batchId}`, {
            students,
        })
        return response
    }, [])

    return { assignBatch }
}

export default useAssignBatch
