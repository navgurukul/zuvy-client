'use client'

import { useState, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

interface DeleteStudentOptions {
    onSuccess?: (resData: any) => void
    onError?: (err: any) => void
}

export function useDeleteStudent() {
    const [isDeleting, setIsDeleting] = useState(false)

    const deleteStudent = useCallback(
        async (userId: (string | number)[], bootcampId: string | number, options?: DeleteStudentOptions) => {
            if (isDeleting) return

            setIsDeleting(true)
            try {
                let url = `/student/{userId}/${bootcampId}?`
                url += 'userId=' + userId.join('&userId=')
                const res = await api.delete(url)
                toast.success({
                    title: 'User Deleted Successfully!',
                    description: res.data.message,
                })
                if (options?.onSuccess) {
                    options.onSuccess(res.data)
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
                setIsDeleting(false)
            }
        },
        [isDeleting]
    )

    return {
        deleteStudent,
        isDeleting,
    }
}
