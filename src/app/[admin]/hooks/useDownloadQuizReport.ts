import { useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'
import { useGetQuizReport } from './useGetQuizReport'
import { useGetQuizStudentStatus } from './useGetQuizStudentStatus'

const columns = [
  { header: 'Student Name', value: (student: any) => student.name },
  { header: 'Student ID', value: (student: any) => student.studentId ?? student.userId ?? 'NA' },
  { header: 'Email', value: (student: any) => student.email },
  { header: 'Batch', value: (student: any) => student.batchName },
  { header: 'Submission Status', value: (student: any) => student.submissionStatus },
  { header: 'Submitted At', value: (student: any) => student.submittedAt },
  { header: 'Total Quiz Marks', value: (student: any) => student.quiz?.totalMarks },
  { header: 'Quiz Marks Obtained', value: (student: any) => student.quiz?.marksObtained },
]

const csvEscape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
const readableText = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

type DownloadFilters = {
  bootcampId?: string | number
  moduleId?: string | number
  batchId?: string
  search?: string
}

export const useDownloadQuizReport = () => {
  const { getQuizReport } = useGetQuizReport()
  const { getQuizStudentStatus } = useGetQuizStudentStatus()

  const downloadQuizReport = useCallback(async (chapterId: string | number, chapterTitle?: string, filters: DownloadFilters = {}) => {
    try {
      const reportParams = new URLSearchParams({
        chapter_id: String(chapterId),
        page: '1',
        page_size: '100',
      })
      if (filters.bootcampId) reportParams.set('bootcamp_id', String(filters.bootcampId))
      if (filters.moduleId) reportParams.set('module_id', String(filters.moduleId))
      if (filters.batchId && filters.batchId !== 'all') reportParams.set('batch_id', filters.batchId)

      let students: any[] = []
      if (filters.search?.trim() && filters.bootcampId && filters.moduleId) {
        // The report endpoint supports batch filtering but not name/email search.
        // Resolve matching students through the status endpoint, then fetch their reports.
        const matchedStudents: any[] = []
        let offset = 0
        let expectedCount: number | undefined
        let previousPageSignature = ''
        do {
          const statusParams = new URLSearchParams({
            chapterId: String(chapterId),
            searchStudent: filters.search.trim(),
            limit: '100',
            offset: String(offset),
          })
          if (filters.batchId && filters.batchId !== 'all') statusParams.set('batchId', filters.batchId)
          const statusResponse = await getQuizStudentStatus(filters.bootcampId, filters.moduleId, statusParams)
          const statusData = statusResponse.data?.data ?? statusResponse.data
          const pageStudents = statusData?.students ?? []
          matchedStudents.push(...pageStudents)
          expectedCount = Number(statusData?.filteredCount ?? statusData?.totalStudents ?? pageStudents.length)
          if (!pageStudents.length) break
          const pageSignature = pageStudents.map((student: any) => student.userId).join(',')
          if (pageSignature === previousPageSignature) break
          previousPageSignature = pageSignature
          offset += pageStudents.length
        } while (matchedStudents.length < (expectedCount ?? 0))

        const uniqueStudents = Array.from(new Map(matchedStudents.map((student) => [student.userId, student])).values())
        const reportParamsForStudent = (student: any) => {
          const params = new URLSearchParams(reportParams.toString())
          params.set('user_id', String(student.userId))
          return getQuizReport(params).then((response) => {
            const reportStudent = (response.data?.data ?? response.data)?.students?.[0]
            return reportStudent ?? { ...student, submissionStatus: student.status, quiz: null }
          }).catch(() => ({
            ...student,
            submissionStatus: student.status,
            quiz: null,
          }))
        }
        // Fetch in small groups to avoid firing an unbounded number of requests.
        for (let index = 0; index < uniqueStudents.length; index += 5) {
          const reports = await Promise.all(uniqueStudents.slice(index, index + 5).map(reportParamsForStudent))
          students.push(...reports)
        }
      } else {
        const firstResponse = await getQuizReport(reportParams)
        const firstData = firstResponse.data?.data ?? firstResponse.data
        students = firstData?.students ?? []
        const totalPages = Number(firstData?.totalPages ?? 1)
        for (let page = 2; page <= totalPages; page += 1) {
          reportParams.set('page', String(page))
          const response = await getQuizReport(reportParams)
          students.push(...((response.data?.data ?? response.data)?.students ?? []))
        }
      }

      if (!Array.isArray(students) || students.length === 0) {
        toast({ title: 'No report data', description: 'There are no quiz report rows to download.' })
        return
      }

      const maxQuestions = Math.max(0, ...students.map((student: any) => student.quiz?.questions?.length ?? 0))
      const questionHeaders = Array.from({ length: maxQuestions }, (_, index) => {
        const number = index + 1
        return [
          `Question ${number}`,
          `Question ${number} Student Answer`,
          `Question ${number} Correct Answer`,
          `Question ${number} Result`,
        ]
      }).flat()
      const headers = [...columns.map(({ header }) => header), ...questionHeaders]
      const rows = students.map((student: any) => {
        const studentColumns = columns.map(({ value }) => value(student))
        const questions = student.quiz?.questions ?? []
        const questionValues = questions.flatMap((question: any) => [
          readableText(question.question),
          (question.chosenOptions ?? []).map((option: any) => option.optionText).join(', '),
          (question.correctOptions ?? []).map((option: any) => option.optionText).join(', '),
          question.status,
        ])
        const emptyQuestionColumns = Array((maxQuestions - questions.length) * 4).fill('')
        return [...studentColumns, ...questionValues, ...emptyQuestionColumns]
      })

      const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n')
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${(chapterTitle || 'quiz').replace(/[\\/:*?"<>|]/g, '-')}-report.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Quiz report download failed:', error)
      toast({ title: 'Error', description: 'Could not download the quiz report.', variant: 'destructive' })
    }
  }, [getQuizReport, getQuizStudentStatus])

  return { downloadQuizReport }
}

export default useDownloadQuizReport
