import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

export const useDownloadCertificate = (moduleId?: string) => {
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('Certificate')
  const [loading, setLoading] = useState(false)

  const fetchCertificate = useCallback(async (): Promise<string | null> => {
    if (!moduleId) return null

    try {
      setLoading(true)
      const response = await api.get(`/content/curriculum/download-certificate/${moduleId}`)
      const certificateData = response?.data?.data ?? response?.data ?? {}
      const url =
        certificateData.certificateUrl ||
        certificateData.url ||
        certificateData.downloadUrl ||
        certificateData.fileUrl ||
        null
      const fileName = certificateData.fileName || 'certificate.pdf'

      if (url) {
        setCertificateUrl(url)
      }

      if (fileName) {
        setTitle(fileName.replace(/\.[^/.]+$/, '') || 'Certificate')
      }

      return url
    } catch (error: any) {
      console.error('Error fetching certificate:', error)
      toast({
        title: 'Certificate unavailable',
        description: error?.response?.data?.message || 'The certificate is not available yet.',
        variant: 'destructive',
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  return {
    certificateUrl,
    setCertificateUrl,
    title,
    setTitle,
    loading,
    fetchCertificate,
  }
}

export default useDownloadCertificate
