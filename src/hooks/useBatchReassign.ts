import { useCallback } from 'react'
import { api } from '@/utils/axios.config'

export interface BatchReassignParams {
    userId?: string | number
    selectedValue?: string | number
    bootcampId?: string | number
}

export function useBatchReassign() {
    const reassignBatch = useCallback(async ({ userId, selectedValue, bootcampId }: BatchReassignParams) => {
        const response = await api.patch(
            `/batch/reassign/student_id=${userId}/new_batch_id=${selectedValue}?bootcamp_id=${bootcampId}`
        )
        return response
    }, [])

    return { reassignBatch }
}

export default useBatchReassign
