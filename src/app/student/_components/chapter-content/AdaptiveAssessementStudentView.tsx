import React from 'react'
import { CalendarDays, Clock3, FileQuestion } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetStudentAiAssessments } from '@/hooks/useGetStudentAiAssessments'
import { AdaptiveAssessementStudentViewProps } from './componentChapterType'

const formatDateTime = (value: string | null) => {
  if (!value) return 'Not scheduled'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not scheduled'

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const AdaptiveAssessementStudentView = ({ chapterDetails, details, onChapterComplete }: AdaptiveAssessementStudentViewProps) => {
  const bootcampId = details?.courseId ?? null
  const chapterId = details?.chapterId ?? chapterDetails.id ?? null
  const domainId = details?.moduleId ?? chapterDetails.moduleId ?? null

  const {
    assessments,
    isFetchingAssessments,
    error,
  } = useGetStudentAiAssessments(bootcampId, chapterId, domainId)

  const hasRequiredIds = Boolean(bootcampId && chapterId && domainId)

  const handleChapterComplete = () => {
    if (typeof onChapterComplete === 'function') {
      onChapterComplete()
    }
  }

  const getStudentStatusLabel = (status: number) => {
    if (status === 1) return 'Completed'
    if (status === 0) return 'Not Started'
    return `Status ${status}`
  }

  const handleStartAssessment = (assessmentId: number) => {
    if (!bootcampId) return

    const assessmentRoute = `/student/course/${bootcampId}/aiAssessment/${assessmentId}`
    window.open(assessmentRoute, '_blank')?.focus()
  }

  return (
    <section className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-[#f8fbff] via-background to-[#f4f8ff] p-4 md:p-5">
      <div className="pointer-events-none absolute -left-16 -top-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10 mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold tracking-tight text-primary md:text-lg">Assessment Details</h2>
      </div>

      {!hasRequiredIds && (
        <Card className="border-dashed border-border/70 bg-background/80">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Missing required ids to fetch adaptive assessment.
          </CardContent>
        </Card>
      )}

      {hasRequiredIds && isFetchingAssessments && (
        <Card className="border-border/70 bg-background/80">
          <CardContent className="p-4 text-sm text-muted-foreground">Fetching adaptive assessments...</CardContent>
        </Card>
      )}

      {hasRequiredIds && !isFetchingAssessments && error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {hasRequiredIds && !isFetchingAssessments && !error && assessments.length === 0 && (
        <Card className="border-border/70 bg-background/80">
          <CardContent className="p-4 text-sm text-muted-foreground">
            No adaptive assessment is available for this chapter yet.
          </CardContent>
        </Card>
      )}

      {hasRequiredIds && !isFetchingAssessments && !error && assessments.length > 0 && (
        <div className="grid gap-4">
          {assessments.map((assessment) => (
            <Card
              key={assessment.id}
              className="group overflow-hidden border-border/50 bg-white/85 shadow-sm backdrop-blur-sm "
            >
              <CardHeader className="relative overflow-hidden space-y-3 border-b border-border/40 bg-gradient-to-br from-primary/90 via-primary to-primary/80 pb-4 text-primary-foreground">
                <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 18% 24%, rgba(255,255,255,0.28), transparent 34%), radial-gradient(circle at 86% 16%, rgba(255,255,255,0.2), transparent 30%)' }} />
                <div className="relative flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col space-y-1.5">
                    <Badge className="w-fit border border-white/35 bg-white/15 text-[10px] text-white hover:bg-white/25">
                      {getStudentStatusLabel(assessment.studentStatus)}
                    </Badge>
                    <CardTitle className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white md:text-xl">
                      <span>{assessment.title}</span>
                      <span className="text-xs font-semibold text-blue-100/90">
                        ({assessment.totalNumberOfQuestions} Questions)
                      </span>
                    </CardTitle>
                  </div>
                  <Badge className="border border-white/35 bg-white/15 text-[10px] text-white hover:bg-white/25">
                    {assessment.assessmentStatus}
                  </Badge>
                </div>
                <p className="relative max-w-3xl text-left text-[11px] leading-relaxed text-blue-100/95 md:text-xs">
                  {assessment.description}
                </p>
              </CardHeader>

              <CardContent className="p-4 md:p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                  <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background p-3">
                    <CalendarDays className="h-3.5 w-3.5 text-primary" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Start Datetime</p>
                      <p className="text-xs font-medium text-foreground">{formatDateTime(assessment.startDatetime)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background p-3">
                    <Clock3 className="h-3.5 w-3.5 text-primary" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">End Datetime</p>
                      <p className="text-xs font-medium text-foreground">{formatDateTime(assessment.endDatetime)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end md:justify-start">
                    <Button
                      type="button"
                      className="h-9 rounded-lg px-4 text-xs"
                      onClick={() => handleStartAssessment(assessment.id)}
                      disabled={!bootcampId}
                    >
                      Start Assessment
                    </Button>
                  </div>
                </div>

                {/* <Button
                  type="button"
                  variant="ghost"
                  className="mt-3 h-8 px-0 text-[11px] text-muted-foreground hover:bg-transparent"
                  onClick={handleChapterComplete}
                >
                  Mark Chapter Complete
                </Button> */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

export default AdaptiveAssessementStudentView