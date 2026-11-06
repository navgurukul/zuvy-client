import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export function useUploadCertificate() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>(null)

    const uploadCertificate = useCallback(
        async (
            moduleId: string | number,
            chapterId: string | number,
            formData: FormData,
            title?: string,
            options?: {
                onSuccess?: (res: any) => void
                onError?: (err: any) => void
            }
        ) => {
            setLoading(true)
            setError(null)

            try {
                const safeTitle = title?.trim() || 'Certificate'
                if (!formData.has('title')) {
                    formData.append('title', safeTitle)
                }

                const res = await api.post(
                    `/Content/curriculum/upload-certificate?moduleId=${moduleId}&chapterId=${chapterId}&title=${encodeURIComponent(safeTitle)}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )

                options?.onSuccess?.(res)
                return res
            } catch (err) {
                setError(err)
                options?.onError?.(err)
                throw err
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return { uploadCertificate, loading, error }
}

export default useUploadCertificate
