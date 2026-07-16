import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export function useUploadImage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>(null)

    const uploadImage = useCallback(async (file: File): Promise<string> => {
        setLoading(true)
        setError(null)
        try {
            const formData = new FormData()
            formData.append('images', file, file.name)
            const response = await api.post(
                '/Content/curriculum/upload-images',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            const { urls } = response.data as { urls: string[] }
            return urls[0]
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return { uploadImage, loading, error }
}

export default useUploadImage
