import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type UpdateProjectPayload = {
    title: string
    instruction: {
        description: string
    }
    isLock?: boolean
    deadline?: string | Date | null
}

export function useUpdateProject() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>(null)

    const updateProject = useCallback(
        async (projectID: string | string[], payload: UpdateProjectPayload) => {
            setLoading(true)
            setError(null)

            try {
                const response = await api.patch(
                    `/Content/updateProjects/${projectID}`,
                    payload
                )
                return response
            } catch (err) {
                setError(err)
                throw err
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return { updateProject, loading, error }
}

export default useUpdateProject
