import { useCallback } from 'react'
import { api } from '@/utils/axios.config'

export interface DeleteModuleParams {
    courseId: string | number
    moduleId: string | number
}

export function useDeleteModule() {
    const deleteModule = useCallback(async ({ courseId, moduleId }: DeleteModuleParams) => {
        const response = await api.delete(`Content/deleteModule/${courseId}?moduleId=${moduleId}`)
        return response
    }, [])

    return { deleteModule }
}

export default useDeleteModule
