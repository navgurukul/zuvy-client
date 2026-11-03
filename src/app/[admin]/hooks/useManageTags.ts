import { useState, useCallback } from 'react'
import { api } from '@/utils/axios.config'

export default function useManageTags() {
    const [loading, setLoading] = useState(false)

    const createTags = useCallback(async (tagNames: string[]) => {
        setLoading(true)
        try {
            const response = await api.post('/Content/createTag', {
                tagNames,
            })
            setLoading(false)
            return response
        } catch (error) {
            setLoading(false)
            throw error
        }
    }, [])

    const deleteTag = useCallback(async (tagId: number) => {
        setLoading(true)
        try {
            const response = await api.delete(`/content/deletequestiontag/${tagId}`)
            setLoading(false)
            return response
        } catch (error) {
            setLoading(false)
            throw error
        }
    }, [])

    return {
        createTags,
        deleteTag,
        loading,
    }
}
