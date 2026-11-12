'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Award, Download, Image as ImageIcon, Link as LinkIcon, Share2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'
import useDownloadCertificate from '@/app/student/hooks/useDownloadCertificate'
import { useBootcampProgress } from '@/app/student/hooks/useBootcampProgress'
import { useAllModulesForStudents } from '@/app/student/hooks/useAllModulesForStudents'

export default function StudentCertificatePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = params?.courseId?.toString() || ''
  const orgId = searchParams.get('orgId') || ''

  const { progressData } = useBootcampProgress(courseId)
  const { modules } = useAllModulesForStudents(courseId)

  // Find the certificate module (typeId 10 chapter → moduleId)
  const certificateModuleId = modules
    ?.flatMap((m: any) => m.chapters || [])
    .find((ch: any) => ch.topicId === 10)
    ?.moduleId?.toString() || ''

  const {
    certificateUrl,
    title,
    loading,
    fetchCertificate,
  } = useDownloadCertificate(certificateModuleId)

  const courseName = progressData?.data?.bootcampTracking?.name || ''
  const batchName = progressData?.batchInfo?.batchName || ''
  const instructorName = progressData?.instructorDetails?.instructorName || ''

  // Format issued date — use today as placeholder since the backend doesn't return it yet
  const issuedDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const certificateId = `ZUVY-${courseId.padStart(4, '0')}`

  const handleDownloadPDF = async () => {
    const url = certificateUrl || (await fetchCertificate())
    if (!url) return

    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.download = `${(title || 'certificate').replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    toast.success({ title: 'Downloading PDF…' })
  }

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/certificate/${certificateId}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success({ title: 'Link copied!', description: 'Share the certificate link with anyone.' })
    })
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/certificate/${certificateId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Certificate – ${courseName}`,
          text: `I just completed ${courseName} on Zuvy!`,
          url: shareUrl,
        })
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href={`/student/course/${courseId}/org/${orgId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </Link>

        {/* Page heading */}
        <h1 className="text-2xl font-heading font-bold mb-1 text-left">
          Congratulations{progressData?.instructorDetails?.instructorName ? '' : ''}!
        </h1>
        <p className="text-sm text-muted-foreground mb-6 text-left">
          You earned this certificate for completing{' '}
          <span className="font-medium text-foreground">{courseName}</span>. Share it with your friends and family.
        </p>

        {/* Certificate card */}
        <div className="rounded-2xl border-4 border-[#7ee8e8]/60 bg-white shadow-lg p-8 mb-6">
          {/* Top row: partner name + logo */}
          <div className="flex items-start justify-between mb-6">
            <span className="text-sm font-bold text-foreground">
              {progressData?.data?.bootcampTracking?.bootcampTopic || batchName || 'Zuvy'}
            </span>
            {/* Placeholder for partner logo — swap with real Image when available */}
            <div className="text-muted-foreground">
              <Award className="h-6 w-6 opacity-30" />
            </div>
          </div>

          {/* Badge / logo area */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Award className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-black text-foreground leading-tight">
              Certificate of
            </h2>
            <h2 className="text-3xl font-heading font-black text-primary leading-tight">
              {'< Completion />'}
            </h2>
          </div>

          {/* Body text */}
          <div className="text-center space-y-1 mb-8">
            <p className="text-sm text-muted-foreground">Zuvy hereby acknowledges that</p>
            <p className="text-2xl font-heading font-bold text-foreground border-b border-foreground/20 pb-2 max-w-xs mx-auto">
              {/* Student name from auth */}
              {typeof window !== 'undefined'
                ? (() => {
                    try { return JSON.parse(localStorage.getItem('AUTH') || '{}')?.name || 'Student' }
                    catch { return 'Student' }
                  })()
                : 'Student'}
            </p>
            <p className="text-sm text-muted-foreground pt-2">has successfully completed the</p>
            <p className="text-sm font-semibold text-foreground">{courseName}!</p>
          </div>

          {/* Footer row */}
          <div className="flex items-end justify-between pt-4 border-t border-border/40">
            <div className="text-left">
              <p className="text-sm font-bold text-foreground">{instructorName || 'Prateek Agarwal'}</p>
              <p className="text-xs text-muted-foreground">Lead, IN Education</p>
              <p className="text-xs text-muted-foreground">Amazon Community Impact</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Date:</p>
              <p className="text-sm font-semibold text-primary">{issuedDate}</p>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-muted-foreground">
              Certificate ID: {certificateId} · Verify at zuvy.org/certificate/{certificateId}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button
            variant="default"
            className="bg-primary text-primary-foreground hover:bg-primary-dark font-semibold gap-2"
            onClick={handleDownloadPDF}
            disabled={loading}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            className="font-semibold gap-2"
            onClick={handleCopyLink}
          >
            <LinkIcon className="h-4 w-4" />
            Copy link
          </Button>
          <Button
            variant="default"
            className="bg-primary text-primary-foreground hover:bg-primary-dark font-semibold gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
