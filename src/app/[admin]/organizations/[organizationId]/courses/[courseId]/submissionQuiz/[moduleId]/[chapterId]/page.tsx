'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/app/_components/datatable/data-table'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { SearchBox } from '@/utils/searchBox'
import { toast } from '@/components/ui/use-toast'
import { getUser } from '@/store/store'
import { useBatchList } from '@/app/[admin]/hooks/useBatchList'
import useDownloadQuizReport from '@/app/[admin]/hooks/useDownloadQuizReport'
import { useGetQuizStudentStatus } from '@/app/[admin]/hooks/useGetQuizStudentStatus'
import { createColumns, QuizStudentStatus } from './columns'
import { POSITION } from '@/utils/constant'

const Page = () => {
  const params = useParams<{ organizationId: string; courseId: string; moduleId: string; chapterId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = getUser()
  const role = user?.rolesList?.[0]?.toLowerCase() || ''
  const orgId = Number(params.organizationId) || user?.orgId
  const { batchData: batches } = useBatchList(params.courseId)
  const { downloadQuizReport } = useDownloadQuizReport()
  const { getQuizStudentStatus } = useGetQuizStudentStatus()
  const [data, setData] = useState<QuizStudentStatus[]>([])
  const [statusSummary, setStatusSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState('all')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const pageSize = Number(searchParams.get('limit') || POSITION)
  const currentTab = searchParams.get('tab') || 'quiz'

  const resetPagination = useCallback(() => {
    const query = new URLSearchParams(searchParams.toString())
    query.set('page', '1')
    query.set('limit', String(pageSize))
    router.replace(`${pathname}?${query.toString()}`, { scroll: false })
  }, [pageSize, pathname, router, searchParams])

  const fetchStatus = useCallback(async (query: string, offset: number, limit: number) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({ chapterId: params.chapterId, limit: String(limit), offset: String(offset) })
      if (selectedBatch !== 'all') queryParams.set('batchId', selectedBatch)
      if (query.trim()) queryParams.set('searchStudent', query.trim())

      const response = await getQuizStudentStatus(params.courseId, params.moduleId, queryParams)
      const result = response.data?.data ?? response.data
      const students = result?.students ?? []
      setStatusSummary(result)
      setData(students.map((student: any) => ({ ...student, totalQuestions: result.totalQuestions })))
    } catch (error) {
      setData([])
      toast({ title: 'Error', description: 'Error fetching quiz student status', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [getQuizStudentStatus, params.chapterId, params.courseId, params.moduleId, selectedBatch])

  const fetchStudentData = useCallback((offset: number) => {
    const limit = Number(searchParams.get('limit') || POSITION)
    return fetchStatus(search, offset, limit)
  }, [fetchStatus, search, searchParams])

  const fetchSuggestions = useCallback(async (query: string) => {
    const queryParams = new URLSearchParams({ chapterId: params.chapterId, searchStudent: query, limit: '10', offset: '0' })
    if (selectedBatch !== 'all') queryParams.set('batchId', selectedBatch)
    const response = await getQuizStudentStatus(params.courseId, params.moduleId, queryParams)
    const students = response.data?.data?.students ?? []
    return students.map((student: any) => ({ id: student.userId, ...student }))
  }, [getQuizStudentStatus, params.chapterId, params.courseId, params.moduleId, selectedBatch])

  const applySearch = useCallback(async (query: string) => {
    setSearch(query)
    resetPagination()
  }, [resetPagination])

  const clearSearch = useCallback(async () => {
    setSearch('')
    resetPagination()
  }, [resetPagination])

  const handleDownload = () => downloadQuizReport(params.chapterId, statusSummary?.chapterTitle, {
    bootcampId: params.courseId,
    moduleId: params.moduleId,
    batchId: selectedBatch,
    search,
  })

  const totalStudents = Number(statusSummary?.filteredCount ?? statusSummary?.totalStudents ?? 0)
  const totalPages = Number(statusSummary?.totalPages ?? Math.max(1, Math.ceil(totalStudents / pageSize)))

  return (
    <>
      <div className="flex items-center gap-4 mb-8 mt-6">
        <Link href={`/${role}/organizations/${orgId}/courses/${params.courseId}/submissions?tab=${currentTab}`}>
          <Button variant="ghost" className="hover:bg-transparent hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course Submissions
          </Button>
        </Link>
      </div>

      <Card className="mb-8 border border-border shadow-sm bg-card">
        <CardHeader><CardTitle className="text-2xl text-foreground text-left">{statusSummary?.chapterTitle || 'Quiz submissions'}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-left text-sm md:grid-cols-4">
            <div className="text-left"><div className="font-medium text-muted-foreground">Total Submissions</div><div className="text-left text-lg font-semibold">{statusSummary?.submittedCount ?? 0}</div></div>
            <div className="text-left"><div className="font-medium text-muted-foreground">Submission Type</div><div className="text-left text-lg font-semibold">Quiz</div></div>
            <div className="text-left"><div className="font-medium text-muted-foreground">Course ID</div><div className="text-left text-lg font-semibold">{params.courseId}</div></div>
            <div className="text-left"><div className="mb-1 font-medium text-muted-foreground">Batch Filter</div>
              <Select value={selectedBatch} onValueChange={(value) => { setSelectedBatch(value); resetPagination() }}>
                <SelectTrigger><SelectValue placeholder="All Batches" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Batches</SelectItem>{batches.map((batch) => <SelectItem key={batch.id} value={String(batch.id)}>{batch.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-xl text-foreground">Student Submissions</CardTitle>
          <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2" disabled={!data.length}><Download className="h-4 w-4" />Download Report</Button>
        </div></CardHeader>
        <div className="relative w-full p-4 md:w-1/3">
          <SearchBox placeholder="Search by name or email" fetchSuggestionsApi={fetchSuggestions} fetchSearchResultsApi={applySearch} defaultFetchApi={clearSearch}
            getSuggestionLabel={(student: any) => <div><div className="font-medium">{student.name}</div><div className="text-sm text-gray-500">{student.email}</div></div>} inputWidth="" />
        </div>
        <CardContent className="p-0">
          {loading ? <div className="p-8 text-center text-muted-foreground">Loading quiz submissions...</div> : (
            <DataTable
              data={data}
              columns={createColumns({
                courseId: params.courseId,
                moduleId: params.moduleId,
                chapterId: params.chapterId,
                organizationId: params.organizationId,
                role,
              })}
            />
          )}
        </CardContent>
        <div className="border-t p-6">
          <DataTablePagination
            key={`${selectedBatch}-${search}`}
            totalStudents={totalStudents}
            pages={totalPages}
            lastPage={totalPages}
            fetchStudentData={fetchStudentData}
          />
        </div>
      </Card>
    </>
  )
}

export default Page
