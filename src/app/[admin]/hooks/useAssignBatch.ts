import { useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { AssignBatchParams } from './hookType'

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
