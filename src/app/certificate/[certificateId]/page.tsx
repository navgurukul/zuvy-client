import { Award, CheckCircle2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Public certificate view page — no login required.
 * Accessible via /certificate/[certificateId]
 *
 * This is the page friends see when a student shares their certificate link.
 * Currently displays a static placeholder; wire up a real API fetch when available.
 */
export default function PublicCertificatePage({
  params,
}: {
  params: { certificateId: string }
}) {
  const { certificateId } = params

  // TODO: fetch real certificate data by certificateId from an unauthenticated endpoint
  // const certificate = await fetchPublicCertificate(certificateId)

  // Placeholder data — replace with real API data
  const issuedDate = '28 October 2026'
  const studentName = 'Student'
  const courseName = 'AWS Data Center Tour: Uncovering Cloud Computing'
  const partnerName = 'Zuvy'

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center py-10 px-4">
      {/* Zuvy logo */}
      <div className="mb-4">
        <Image
          src="/logo.PNG"
          alt="Zuvy"
          width={80}
          height={40}
          className="object-contain"
          onError={() => {}}
        />
      </div>

      {/* Verified badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 mb-8 text-sm font-medium text-primary">
        <CheckCircle2 className="h-4 w-4" />
        Verified certificate · issued by Zuvy on {issuedDate}
      </div>

      {/* Certificate card */}
      <div className="rounded-2xl border-4 border-[#7ee8e8]/60 bg-white shadow-lg p-8 w-full max-w-2xl mb-8">
        {/* Top row */}
        <div className="flex items-start justify-between mb-6">
          <span className="text-sm font-bold text-foreground">{partnerName}</span>
          <div className="text-muted-foreground">
            <Award className="h-6 w-6 opacity-30" />
          </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Award className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-foreground leading-tight">
            Certificate of
          </h2>
          <h2 className="text-3xl font-black text-primary leading-tight">
            {'< Completion />'}
          </h2>
        </div>

        {/* Body */}
        <div className="text-center space-y-1 mb-8">
          <p className="text-sm text-muted-foreground">{partnerName} hereby acknowledges that</p>
          <p className="text-2xl font-bold text-foreground border-b border-foreground/20 pb-2 max-w-xs mx-auto">
            {studentName}
          </p>
          <p className="text-sm text-muted-foreground pt-2">has successfully completed the</p>
          <p className="text-sm font-semibold text-foreground">{courseName}!</p>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between pt-4 border-t border-border/40">
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">Prateek Agarwal</p>
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

      {/* Metadata row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mb-8 text-left">
        <div>
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1">Awarded to</p>
          <p className="text-sm font-medium text-foreground">{studentName}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1">Course</p>
          <p className="text-sm font-medium text-foreground">{courseName}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1">Issued on</p>
          <p className="text-sm font-medium text-foreground">{issuedDate}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1">Certificate ID</p>
          <p className="text-sm font-medium text-foreground">{certificateId}</p>
        </div>
      </div>

      {/* Download button */}
      <Button className="bg-primary text-primary-foreground hover:bg-primary-dark font-semibold gap-2 mb-8">
        <Download className="h-4 w-4" />
        Download PDF
      </Button>

      {/* CTA for non-students */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">Want to earn one too?</p>
        <Link href="/" className="text-sm font-semibold text-primary hover:underline">
          Start learning on Zuvy
        </Link>
      </div>
    </div>
  )
}
