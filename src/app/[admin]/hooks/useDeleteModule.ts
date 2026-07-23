import { useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { DeleteModuleParams } from './hookType'

export function useDeleteModule() {
    const deleteModule = useCallback(async ({ courseId, moduleId }: DeleteModuleParams) => {
        const response = await api.delete(`Content/deleteModule/${courseId}?moduleId=${moduleId}`)
        return response
    }, [])

    return { deleteModule }
}

export default useDeleteModule
