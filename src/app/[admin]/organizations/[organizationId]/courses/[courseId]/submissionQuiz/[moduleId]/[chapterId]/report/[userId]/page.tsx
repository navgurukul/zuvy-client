'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { AlertCircle, ArrowLeft, Check, CheckSquare, Trophy, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'
import { toast } from '@/components/ui/use-toast'
import { useGetQuizReport } from '@/app/[admin]/hooks/useGetQuizReport'

const QuizStudentReportPage = () => {
  const params = useParams<{ organizationId: string; courseId: string; moduleId: string; chapterId: string; userId: string }>()
  const pathname = usePathname()
  const [student, setStudent] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { getQuizReport } = useGetQuizReport()

  useEffect(() => {
    let active = true
    const fetchReport = async () => {
      setLoading(true)
      setError(false)
      try {
        const query = new URLSearchParams({ chapter_id: params.chapterId, user_id: params.userId })
        const response = await getQuizReport(query)
        const data = response.data?.data ?? response.data
        if (active) {
          setReport(data)
          setStudent(data?.students?.[0] ?? null)
        }
      } catch (err) {
        if (active) {
          setError(true)
          toast({ title: 'Error', description: 'Could not load the quiz report.', variant: 'destructive' })
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchReport()
    return () => { active = false }
  }, [getQuizReport, params.chapterId, params.userId])

  const questions = student?.quiz?.questions ?? []
  const role = pathname?.split('/')[1] || 'admin'
  const backHref = `/${role}/organizations/${params.organizationId}/courses/${params.courseId}/submissionQuiz/${params.moduleId}/${params.chapterId}`
  const correctAnswers = questions.filter((question: any) => question.status?.toLowerCase() === 'correct').length
  const totalMarks = Number(student?.quiz?.totalMarks ?? 0)
  const marksObtained = Number(student?.quiz?.marksObtained ?? 0)
  const score = totalMarks > 0 ? Math.floor((marksObtained / totalMarks) * 100) : 0
  const submittedDate = student?.submittedAt
    ? new Date(student.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Loading quiz report...</div>
  if (error || !student) return (
    <div className="p-6 text-center">
      <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
      <h1 className="mb-2 text-lg font-semibold">Quiz report unavailable</h1>
      <p className="mb-4 text-sm text-muted-foreground">We couldn’t load this student’s quiz report.</p>
      <Link href={backHref}><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to submissions</Button></Link>
    </div>
  )

  return (
    <main className="container mx-auto max-w-7xl px-2 pb-4 pt-2 text-left">
      <div className="mb-8 mt-8">
        <Link href={backHref}>
          <Button variant="ghost" className="hover:bg-transparent hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Course Submissions
          </Button>
        </Link>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={student.profilePicture || 'https://github.com/shadcn.png'} alt={student.name || 'Student'} />
          <AvatarFallback>{student.name?.slice(0, 2)?.toUpperCase() || 'ST'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{student.name}</h2>
          <p className="text-sm text-muted-foreground">{student.email}</p>
          <p className="text-sm text-muted-foreground">Submitted on {submittedDate}</p>
        </div>
      </div>

        {student.quiz ? <>
          <section className="mb-8">
            <h3 className="mb-4 text-left text-lg font-semibold">Score Overview</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-3 p-4 text-left">
                  <Trophy className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Total Score</p>
                    <p className="text-2xl font-bold text-primary">{score}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4 text-left">
                  <CheckSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Questions</p>
                    <p className="text-xl font-bold">{correctAnswers}/{questions.length} correct</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-8">
            {questions.map((question: any, index: number) => {
              const status = question.status ?? 'Not Attempted'
              const isCorrect = status.toLowerCase() === 'correct'
              const isIncorrect = status.toLowerCase() === 'incorrect'
              const chosenIds = new Set((question.chosenOptions ?? []).map((option: any) => String(option.optionId)))
              const correctIds = new Set((question.correctOptions ?? []).map((option: any) => String(option.optionId)))

              return (
                <article key={question.questionId ?? index}>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="pt-1 text-sm font-semibold text-foreground">{index + 1}.</span>
                      {question.question ? <div className="min-w-0 flex-1 text-left"><RemirrorForm description={question.question} preview bigScreen /></div> : <p className="pt-1 text-muted-foreground">Question text unavailable.</p>}
                    </div>
                    <Badge variant="outline" className={isCorrect ? 'shrink-0 border-success/30 bg-success/10 text-success' : isIncorrect ? 'shrink-0 border-destructive/30 bg-destructive/10 text-destructive' : 'shrink-0'}>{status}</Badge>
                  </div>
                  {question.options?.length ? <div className="space-y-3 pl-1 sm:pl-7">
                      {question.options.map((option: any) => {
                        const optionId = String(option.optionId)
                        const isChosen = chosenIds.has(optionId)
                        const isAnswer = correctIds.has(optionId)
                        const style = isAnswer
                          ? 'text-success'
                          : isChosen
                            ? 'text-destructive'
                            : 'text-foreground'
                        return (
                          <div key={optionId} className={`flex items-center gap-3 py-1 ${style}`}>
                            {isAnswer ? <Check className="h-4 w-4 shrink-0" /> : isChosen ? <X className="h-4 w-4 shrink-0" /> : <span className="h-3 w-3 shrink-0 rounded-full border border-muted-foreground/60" />}
                            <span className="text-sm">{option.optionText}</span>
                            {isChosen && !isAnswer && <span className="text-xs font-semibold">Your Choice</span>}
                            {isAnswer && <span className="text-xs font-semibold">Correct Answer</span>}
                          </div>
                        )
                      })}
                    </div> : <p className="pl-7 text-sm text-muted-foreground">No answer options available.</p>}
                </article>
              )
            })}
          </section>
        </> : (
          <div className="border-t border-border py-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h2 className="mb-2 text-lg font-semibold">Quiz not submitted</h2>
            <p className="text-sm text-muted-foreground">There are no quiz answers to review for this student.</p>
          </div>
        )}
    </main>
  )
}

export default QuizStudentReportPage
