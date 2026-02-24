import { useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { UseBootcampDeleteReturn } from './hookType'
import { getUser } from '@/store/store'

const useBootcampDelete = (): UseBootcampDeleteReturn => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''

    const deleteBootcamp = useCallback(async (bootcampId: string): Promise<void> => {
        if (!bootcampId) {
            throw new Error('Bootcamp ID is required')
        }

        setIsDeleting(true)
        setError(null)

        try {
            const response = await api.delete(`/bootcamp/${bootcampId}`)

            toast.success({
                title: response.data.status || 'Success',
                description: response.data.message || 'Course deleted successfully',
            })

            // Navigate to courses page after successful deletion
            router.push(`/${userRole}/organizations/${organizationId}/courses`)

        } catch (error: any) {
            const errorMessage = error.response?.data?.message ||
                error.data?.message ||
                'Failed to delete course'

            setError(errorMessage)

            toast.error({
                title: error.response?.data?.status || 'Error',
                description: errorMessage,
            })

            throw error // Re-throw to allow component to handle if needed
        } finally {
            setIsDeleting(false)
        }
    }, [organizationId, router, userRole])

    return {
        deleteBootcamp,
        isDeleting,
        error
    }
}

export default useBootcampDelete