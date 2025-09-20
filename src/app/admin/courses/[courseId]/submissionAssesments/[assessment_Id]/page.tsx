'use client'

// External imports
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

// Internal imports
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { getIsReattemptApproved, getOffset } from '@/store/store'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { fetchStudentAssessments } from '@/utils/admin'
import { POSITION } from '@/utils/constant'
import { SearchBox } from '@/utils/searchBox'

type Props = {}

interface PageParams {
    courseId: string
    assessment_Id: string
}

interface Suggestion {
    id: string;
    name: string;
    email: string;
}

const Page = ({ params }: any) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [assesmentData, setAssessmentData] = useState<any>()
    const [dataTableAssesment, setDataTableAssessments] = useState<any>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [passPercentage, setPassPercentage] = useState<number>(0)

    const { isReattemptApproved } = getIsReattemptApproved()
    const position = useMemo(
        () => searchParams.get('limit') || POSITION,
        [searchParams]
    )
    const { offset, setOffset } = getOffset()
    const [totalPages, setTotalPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalStudents, setTotalStudents] = useState(0)

    // API functions for the hook
    const fetchSuggestionsApi = useCallback(async (query: string): Promise<Suggestion[]> => {
        // if (!query.trim() || query.length < 2) {
        //     return []
        // }
            const { assessments } = await fetchStudentAssessments(
                params?.assessment_Id,
                params?.courseId,
                0, // Start from first page for suggestions
                5, // Limit to 5 results for suggestions
                query, // Use the search query
                () => {}, // Empty function for setTotalPages
                () => {}  // Empty function for setLastPage
            )

            return assessments
                .map((student: any) => ({
                    id: student.id || student.studentId || student.student?.id || Math.random().toString(),
                    name: student.name || student.studentName || student.student?.name || '',
                    email: student.email || student.studentEmail || student.student?.email || ''
                }))
                .filter((suggestion: Suggestion) => suggestion.name && suggestion.email)
    }, [params.assessment_Id, params.courseId])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        const { assessments, moduleAssessment, passPercentage } = await fetchStudentAssessments(
            params?.assessment_Id,
            params?.courseId,
            offset,
            position,
            query,
            setTotalPages,
            setLastPage
        )
        setDataTableAssessments(assessments)
        setAssessmentData(moduleAssessment)
        setPassPercentage(passPercentage)
        setTotalStudents(moduleAssessment?.totalStudents)
        return assessments
    }, [params.assessment_Id, params.courseId, offset, position])

    const defaultFetchApi = useCallback(async () => {
        const { assessments, moduleAssessment, passPercentage } = await fetchStudentAssessments(
            params?.assessment_Id,
            params?.courseId,
            offset,
            position,
            '', // Empty search query
            setTotalPages,
            setLastPage
        )
        setDataTableAssessments(assessments)
        setAssessmentData(moduleAssessment)
        setPassPercentage(passPercentage)
        setTotalStudents(moduleAssessment?.totalStudents)
        return assessments
    }, [params.assessment_Id, params.courseId, offset, position])

    const crumbs = [
        {
            crumb: 'My Courses',
            href: `/admin/courses`,
            isLast: false,
        },
        {
            crumb: bootcampData?.name,
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: 'Submission - Assesments',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: assesmentData?.title,
            isLast: false,
        },
    ]

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    const getStudentAssesmentDataHandler = useCallback(
        async (offset: number) => {
            if (offset >= 0) {
                const currentSearchQuery = searchParams.get('search') || ''
                const { assessments, moduleAssessment, passPercentage } = await fetchStudentAssessments(
                    params?.assessment_Id,
                    params?.courseId,
                    offset,
                    position,
                    currentSearchQuery,
                    setTotalPages,
                    setLastPage
                )
                setDataTableAssessments(assessments)
                setAssessmentData(moduleAssessment)
                setPassPercentage(passPercentage)
                setTotalStudents(moduleAssessment?.totalStudents)
            }
        },
        [params.assessment_Id, params.courseId, position, searchParams]
    )

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    getBootcampHandler(),
                ])
            } catch (error) {
                console.error('Error in fetching data:', error)
            }
        }

        fetchData()
    }, [isReattemptApproved, getBootcampHandler])

    useEffect(() => {
        getStudentAssesmentDataHandler(offset)
    }, [
        offset,
        getStudentAssesmentDataHandler,
        position,
        setLastPage,
        setTotalPages,
        searchParams.get('search')])

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <MaxWidthWrapper className="p-4 ">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-gray-700">
                        {assesmentData?.title}
                    </h1>

                    {
                        <div className="text-start flex gap-x-3">
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {assesmentData?.totalStudents}
                                </h1>
                                <p className="text-gray-500 ">Total Students</p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {assesmentData?.totalSubmitedStudents}
                                </h1>
                                <p className="text-gray-500 ">
                                    Submissions Received
                                </p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {(
                                        assesmentData?.totalStudents -
                                        assesmentData?.totalSubmitedStudents
                                    ).toString()}
                                </h1>
                                <p className="text-gray-500 ">
                                    Not Yet Submitted
                                </p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {passPercentage}%
                                </h1>
                                <p className="text-gray-500 ">
                                    Pass Percentage
                                </p>
                            </div>
                            <div className="p-4 rounded-lg shadow-md ">
                                <h1 className="text-gray-600 font-semibold text-xl">
                                    {assesmentData?.totalQualifiedStudents}
                                </h1>
                                <p className="text-gray-500 ">
                                    Total Qualified Students
                                </p>
                            </div>
                        </div>
                    }
                    <div className="relative w-1/3">
                        <SearchBox
                            placeholder="Search by name or email"
                            fetchSuggestionsApi={fetchSuggestionsApi}
                            fetchSearchResultsApi={fetchSearchResultsApi}
                            defaultFetchApi={defaultFetchApi}
                            getSuggestionLabel={(s) => (
                                <div>
                                    <div className="font-medium">{s.name}</div>
                                    <div className="text-sm text-gray-500">{s.email}</div>
                                </div>
                            )}                            
                            inputWidth=""
                        />
                    </div>
                    <DataTable data={dataTableAssesment} columns={columns} />
                    <DataTablePagination
                        totalStudents={totalStudents}
                        pages={totalPages}
                        lastPage={lastPage}
                        fetchStudentData={getStudentAssesmentDataHandler}
                    />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page