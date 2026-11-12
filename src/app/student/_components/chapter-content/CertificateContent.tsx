'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Award, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent } from '@/components/ui/dialog'
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
  const router = useRouter()
  const courseId = params?.courseId?.toString() || ''
  const orgId = params?.orgId?.toString() || ''
  const moduleId = params?.moduleId?.toString() || ''
  const chapterIdentifier = chapterDetails?.id?.toString() || params?.chapterId?.toString() || ''

  const [isDownloaded, setIsDownloaded] = useState(false)
  const [completionTriggered, setCompletionTriggered] = useState(false)
  const [showCertificateDialog, setShowCertificateDialog] = useState(false)

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

    // Show certificate earned dialog when student first reaches this chapter
    setShowCertificateDialog(true)
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

  const handleViewCertificate = () => {
    setShowCertificateDialog(false)
    router.push(`/student/certificate/${courseId}?orgId=${orgId}`)
  }

  const courseName = chapterDetails?.bootcampName || chapterDetails?.courseName || ''

  return (
    <>
      {/* "You earned a certificate!" dialog */}
      <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl p-8 text-center">
          {/* Award icon in a soft green circle */}
          <div className="flex justify-center mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Award className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-heading font-bold mb-3 text-foreground">
            You earned a certificate!
          </h2>

          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Amazing work finishing{' '}
            {courseName && (
              <span className="text-primary font-medium">{courseName}</span>
            )}
            . Your certificate is ready to download and share.
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              className="flex-1 font-semibold"
              onClick={() => setShowCertificateDialog(false)}
            >
              Later
            </Button>
            <Button
              className="flex-1 font-semibold bg-primary text-primary-foreground hover:bg-primary-dark gap-2"
              onClick={handleViewCertificate}
            >
              <Award className="h-4 w-4" />
              View certificate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              <div className="mt-8 flex justify-center gap-4 flex-wrap">
                <Button
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-[0_10px_18px_rgba(15,125,90,0.18)] hover:bg-primary-dark"
                  onClick={handleDownload}
                  disabled={hookLoading}
                >
                  <Download className="h-4 w-4" />
                  {isDownloaded ? 'Downloaded' : 'Download Certificate'}
                </Button>
                <Button
                  variant="outline"
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-6 text-base font-semibold border-primary text-primary hover:bg-primary/5"
                  onClick={handleViewCertificate}
                >
                  <Award className="h-4 w-4" />
                  View Certificate
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </>
  )
}

export default CertificateContent
