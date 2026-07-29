import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export function useUploadPdf() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>(null)

    const uploadPdf = useCallback(
        async (moduleId: string | number, chapterId: string | number, formData: FormData, options?: { onSuccess?: (res:any)=>void; onError?: (err:any)=>void }) => {
            setLoading(true)
            setError(null)
            try {
                const res = await api.post(
                    `/Content/curriculum/upload-pdf?moduleId=${moduleId}&chapterId=${chapterId}`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
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

    return { uploadPdf, loading, error }
}

export default useUploadPdf