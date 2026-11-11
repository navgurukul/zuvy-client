'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { toast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { ArrowDownToLine, ClipboardCheck, Eye } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getUser } from '@/store/store'
import useDownloadQuizReport from '@/app/[admin]/hooks/useDownloadQuizReport'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AssessmentSubmissionSkeleton } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'
import useDebounce from '@/app/[admin]/hooks/useDebounce'
import useGetQuizSubmissions from '@/app/[admin]/hooks/useGetQuizSubmissions'

type Props = { courseId: string | number; searchTerm?: string }

const QuizSubmission = ({ courseId, searchTerm = '' }: Props) => {
  const { user } = getUser()
  const role = user?.rolesList?.[0]?.toLowerCase() || ''
  const { organizationId } = useParams()
  const orgId = Number(organizationId) || user?.orgId
  const { downloadQuizReport } = useDownloadQuizReport()
  const debouncedSearch = useDebounce(searchTerm, 300)
  const { getQuizSubmissions, loading } = useGetQuizSubmissions()
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    let current = true
    if (!courseId) return

    getQuizSubmissions(courseId, debouncedSearch)
      .then((response) => {
        if (current) setSummary(response.data?.data ?? response.data)
      })
      .catch(() => {
        if (current) {
          setSummary(null)
          toast({ title: 'Error', description: 'Error fetching quiz submissions', variant: 'destructive' })
        }
      })

    return () => { current = false }
  }, [courseId, debouncedSearch, getQuizSubmissions])

  const groups = useMemo(() => {
    if (!Array.isArray(summary?.modules)) return []
    return [...summary.modules]
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
      .map((module: any) => ({
        id: module.moduleId,
        name: module.moduleName,
        quizzes: [...(module.quizChapters ?? [])].sort((left: any, right: any) => (left.order ?? 0) - (right.order ?? 0)),
      }))
      .filter((module) => module.quizzes.length > 0)
  }, [summary])

  if (loading) return <AssessmentSubmissionSkeleton />

  const hasQuizzes = groups.length > 0

  return (
    <div className="grid relative gap-8 mt-4 md:mt-8">
      {hasQuizzes ? groups.map((module) => (
        <section key={module.id} className="mb-6">
          <h2 className="text-lg text-start font-bold text-foreground mb-3">
            Module - {module.name}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {module.quizzes.map((quiz: any) => {
              const title = quiz.chapterTitle ?? `Quiz ${quiz.chapterId}`
              const submitted = Number(quiz.submittedStudents ?? 0)
              const pending = Number(quiz.pendingStudents ?? 0)
              return (
                <div className="bg-card border border-border rounded-md p-4 hover:shadow-lg transition-shadow w-full" key={quiz.chapterId}>
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="p-2 rounded-md flex-shrink-0"><ClipboardCheck className="h-4 w-4" /></div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild><h3 className="font-medium text-base truncate">{title}</h3></TooltipTrigger>
                          <TooltipContent>{title}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Download ${title} submissions`}
                        title={submitted === 0 ? 'No submissions available' : 'Download report'}
                        disabled={submitted === 0}
                        onClick={() => downloadQuizReport(quiz.chapterId, title, { bootcampId: courseId, moduleId: module.id })}
                        className={submitted === 0
                          ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}
                      >
                        <ArrowDownToLine size={20} />
                      </button>
                      {submitted === 0 ? (
                        <button type="button" aria-label={`No ${title} submissions to view`} title="No submissions to view" disabled className="cursor-not-allowed text-gray-400 dark:text-gray-500">
                          <Eye size={20} />
                        </button>
                      ) : (
                        <Link
                          aria-label={`View ${title} submissions`}
                          href={`/${role}/organizations/${orgId}/courses/${courseId}/submissionQuiz/${module.id}/${quiz.chapterId}`}
                          title="View submissions"
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <Eye size={20} />
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm gap-2">
                    <Badge variant="outline" className="text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600">
                      {submitted} submissions
                    </Badge>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      {pending} pending
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )) : (
        <div className="flex flex-col justify-center items-center">
          <p className="text-center text-muted-foreground max-w-md">
            {debouncedSearch ? `No Quizzes Found for "${debouncedSearch}"` : 'No Quiz submissions available from the students yet. Please wait until the first submission.'}
          </p>
          <Image src="/emptyStates/empty-submissions.png" alt="No Quiz submissions found" width={120} height={120} className="mb-6" />
        </div>
      )}
    </div>
  )
}

export default QuizSubmission
