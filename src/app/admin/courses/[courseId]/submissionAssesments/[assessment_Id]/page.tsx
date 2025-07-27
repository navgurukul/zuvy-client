'use client'

// External imports
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Search } from 'lucide-react'

// Internal imports
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import useDebounce from '@/hooks/useDebounce'
import { getIsReattemptApproved, getOffset } from '@/store/store'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { fetchStudentAssessments } from '@/utils/admin'
import { POSITION } from '@/utils/constant'

type Props = {}

interface PageParams {
    courseId: string
    assessment_Id: string
}

const Page = ({ params }: any) => {
    const searchParams = useSearchParams()
    const [assesmentData, setAssessmentData] = useState<any>()
    const [searchStudentAssessment, setSearchStudentAssessment] =
        useState<any>('')

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

    const debouncedSearch = useDebounce(searchStudentAssessment, 500)

    const [dataTableAssesment, setDataTableAssessments] = useState<any>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [passPercentage, setPassPercentage] = useState<number>(0)

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
            // href: '',
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
                const { assessments, moduleAssessment, passPercentage } =
                    await fetchStudentAssessments(
                        params?.assessment_Id,
                        params?.courseId,
                        offset,
                        position,
                        debouncedSearch,
                        setTotalPages,
                        setLastPage
                    )
                setDataTableAssessments(assessments)
                setAssessmentData(moduleAssessment)
                setPassPercentage(passPercentage)
                setTotalStudents(moduleAssessment?.totalStudents)
            }
        },
        [params.assessment_Id, position, debouncedSearch]
    )

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    // getStudentAssesmentDataHandler(offset),
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
        debouncedSearch,
    ])

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
                    <div className="relative">
                        <Input
                            placeholder="Search for Student"
                            className="w-1/3 my-6 input-with-icon pl-8"
                            value={searchStudentAssessment}
                            onChange={(e) =>
                                setSearchStudentAssessment(e.target.value)
                            }
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
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
