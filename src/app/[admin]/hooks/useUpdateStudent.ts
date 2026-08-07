'use client'

import { useState, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { UpdateStudentOptions, UpdateStudentPayload } from './hookType'

export function useUpdateStudent() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const updateStudent = useCallback(
        async (
            userId: number,
            payload: UpdateStudentPayload,
            options?: UpdateStudentOptions
        ) => {
            if (isSubmitting) return

            setIsSubmitting(true)
            try {
                const response = await api.patch(
                    `/bootcamp/updateUserDetails/${userId}`,
                    payload
                )
                toast.success({
                    title: 'Success',
                    description: 'Student updated successfully',
                })
                if (options?.onSuccess) {
                    options.onSuccess(response.data)
                }
            } catch (error: any) {
                toast.error({
                    title: 'Failed',
                    description:
                        error.response?.data?.message || 'An error occurred.',
                })
                if (options?.onError) {
                    options.onError(error)
                }
            } finally {
                setIsSubmitting(false)
            }
        },
        [isSubmitting]
    )

    return {
        updateStudent,
        isSubmitting,
    }
}
