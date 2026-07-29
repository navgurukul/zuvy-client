import { useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import {
    UpdateOpenEndedQuestionData,
    UseUpdateOpenEndedQuestionReturn,
} from './hookType'

export const useUpdateOpenEndedQuestion =
    (): UseUpdateOpenEndedQuestionReturn => {
        const { organizationId } = useParams()
        const orgId = Number(organizationId)
        const [loading, setLoading] = useState(false)
        const [error, setError] = useState<string | null>(null)

        const updateOpenEndedQuestion = async (
            questionId: number,
            data: UpdateOpenEndedQuestionData
        ): Promise<boolean> => {
            try {
                setLoading(true)
                setError(null)

                const response = await api.patch(
                    `/Content/${orgId}/updateOpenEndedQuestion/${questionId}`,
                    data
                )

                toast.success({
                    title: 'Success',
                    description:
                        response.data.message ||
                        'Open-Ended Question Updated Successfully',
                })

                return true
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message || 'An error occurred'
                setError(errorMessage)

                toast.error({
                    title: 'Error',
                    description: errorMessage,
                })

                return false
            } finally {
                setLoading(false)
            }
        }

        return {
            updateOpenEndedQuestion,
            loading,
            error,
        }
    }

export default useUpdateOpenEndedQuestion
