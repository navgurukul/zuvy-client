'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Award, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/components/ui/use-toast'
import useChapterCompletion from '@/app/student/hooks/useChapterCompletion'
import useDownloadCertificate from '@/app/student/hooks/useDownloadCertificate'

interface CertificateContentProps {
  chapterDetails: any
  onChapterComplete?: () => void
}

const CertificateContent: React.FC<CertificateContentProps> = ({
  chapterDetails,
  onChapterComplete,
}) => {
  const params = useParams()
  const courseId = params?.courseId?.toString() || ''
  const moduleId = params?.moduleId?.toString() || ''
  const chapterIdentifier = chapterDetails?.id?.toString() || params?.chapterId?.toString() || ''

  const [isDownloaded, setIsDownloaded] = useState(false)
  const [completionTriggered, setCompletionTriggered] = useState(false)

  const {
    certificateUrl: hookCertificateUrl,
    title: hookTitle,
    loading: hookLoading,
    fetchCertificate,
  } = useDownloadCertificate(moduleId)

  const { completeChapter } = useChapterCompletion({
    courseId,
    moduleId,
    chapterId: chapterIdentifier,
    skipRewardManager: true,
    onSuccess: () => {
      setIsDownloaded(false)
      onChapterComplete?.()
    },
  })

  useEffect(() => {
    if (!chapterIdentifier || !courseId || !moduleId || completionTriggered) return

    const alreadyCompleted = chapterDetails?.status === 'Completed' || chapterDetails?.status === 'completed'

    if (alreadyCompleted) {
      setCompletionTriggered(true)
      return
    }

    setCompletionTriggered(true)
    completeChapter()
  }, [chapterIdentifier, courseId, moduleId, completionTriggered, chapterDetails?.status, completeChapter])

  const handleDownload = async () => {
    try {
      const availableCertificateUrl = hookCertificateUrl || (await fetchCertificate())

      if (!availableCertificateUrl) return

      const link = document.createElement('a')
      link.href = availableCertificateUrl
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.download = `${hookTitle.replace(/\s+/g, '_') || 'certificate'}.pdf`

      document.body.appendChild(link)
      link.click()
      link.remove()

      setIsDownloaded(true)
    } catch (error) {
      console.error('Download failed', error)
      toast({
        title: 'Download failed',
        description: 'Unable to download the certificate right now.',
        variant: 'destructive',
      })
    }
  }

  return (
    <ScrollArea className="h-[80vh]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="rounded-[22px] border border-border bg-[#f7f8f7] dark:bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf4ef] text-[#0f7d5a]">
              <Award className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground font-body">
              Achievement unlocked
            </span>
          </div>

          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold tracking-[-0.04em] text-foreground sm:text-[3rem]">
              Congratulations!
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-[1.1rem] font-body">
              You&apos;ve completed the module successfully and earned your certificate. This achievement is now ready to download and save for your records.
            </p>
          </div>

          {hookLoading ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#d2e3d9] bg-white/60 p-8 text-center text-sm text-[#526861]">
              Preparing your certificate...
            </div>
          ) : (
            <div className="mt-8 flex justify-center">
              <Button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-[0_10px_18px_rgba(15,125,90,0.18)] hover:bg-primary-dark"
                onClick={handleDownload}
                disabled={hookLoading}
              >
                <Download className="h-4 w-4" />
                {isDownloaded ? 'Downloaded' : 'Download Certificate'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}

export default CertificateContent
