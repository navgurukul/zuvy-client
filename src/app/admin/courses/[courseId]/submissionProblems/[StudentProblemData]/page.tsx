'use client'
import React, { useCallback, useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import { columns } from './columns'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBox } from '@/utils/searchBox' 

const PracticeProblems = ({ params }: any) => {
    const [matchingData, setMatchingData] = useState<any>(null)
    const [bootcampData, setBootcampData] = useState<any>({})
    const [studentStatus, setStudentStatus] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [loading, setLoading] = useState(false)

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
            crumb: (matchingData?.moduleChapterData[0]?.codingQuestionDetails
                ?.title) + ' - Submissions',
            href: '',
            isLast: true,
        },
    ]
    const fetchSuggestionsApi = useCallback(async (query: string) => {
        if (!query.trim()) return []

        const res = await api.get(
            `/submission/practiseProblemStatus/${matchingData.id}?chapterId=${matchingData.moduleChapterData[0].id}&questionId=${matchingData.moduleChapterData[0].codingQuestionDetails.id}&searchStudent=${encodeURIComponent(query)}`
        )

        return res.data.data.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.emailId,
            ...student,
        })) || []
    }, [matchingData])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        setLoading(true)

        const res = await api.get(
            `/submission/practiseProblemStatus/${matchingData.id}?chapterId=${matchingData.moduleChapterData[0].id}&questionId=${matchingData.moduleChapterData[0].codingQuestionDetails.id}&searchStudent=${encodeURIComponent(query)}`
        )

        const students = res.data.data.map((student: any) => ({
            ...student,
            email: student.emailId,
            bootcampId: params.courseId,
            questionId: matchingData.moduleChapterData[0].codingQuestionDetails.id,
            moduleId: params.StudentProblemData,
        })) || []

        setStudentStatus(students)
        setLoading(false)
    }, [matchingData, params.courseId, params.StudentProblemData])

    const defaultFetchApi = useCallback(async () => {
        setLoading(true)

        const res = await api.get(
            `/submission/practiseProblemStatus/${matchingData.id}?chapterId=${matchingData.moduleChapterData[0].id}&questionId=${matchingData.moduleChapterData[0].codingQuestionDetails.id}`
        )

        const students = res.data.data.map((student: any) => ({
            ...student,
            email: student.emailId,
            bootcampId: params.courseId,
            questionId: matchingData.moduleChapterData[0].codingQuestionDetails.id,
            moduleId: params.StudentProblemData,
        })) || []

        setStudentStatus(students)
        setLoading(false)
    }, [matchingData, params.courseId, params.StudentProblemData])

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    // Store breadcrumb data in localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(
            'crumbData',
            JSON.stringify([
                bootcampData?.name,
                `${matchingData?.moduleChapterData[0]?.codingQuestionDetails
                    ?.title} - Submissions`,
            ])
        )
    }

    // Initial data fetch - exactly like projects code
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [submissionRes, bootcampRes] = await Promise.all([
                    api.get(
                        `/submission/submissionsOfPractiseProblems/${params.courseId}`
                    ),
                    api.get(`/bootcamp/${params.courseId}`),
                ])

                const submissions = submissionRes.data.trackingData
                setTotalStudents(submissionRes.data.totalStudents)
                setBootcampData(bootcampRes.data.bootcamp)

                if (submissions.length > 0 && params.StudentProblemData) {
                    const matchingModule = submissions.find(
                        (module: any) =>
                            module.id === +params.StudentProblemData
                    )
                    setMatchingData(matchingModule || null)
                } else {
                    setMatchingData(null)
                    setStudentStatus([])
                }
            } catch (error) {
                console.error('Error fetching initial data', error)
            }
        }

        fetchInitialData()
    }, [params.courseId, params.StudentProblemData])

    useEffect(() => {
        if (matchingData) {
            defaultFetchApi()
        }
    }, [matchingData])

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <MaxWidthWrapper className="p-4">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-primary">
                        {
                            matchingData?.moduleChapterData[0]
                                ?.codingQuestionDetails?.title
                        }
                    </h1>

                    <div className="text-start flex gap-x-3">
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {totalStudents}
                            </h1>
                            <p className="text-gray-500 ">Total Students</p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {matchingData?.moduleChapterData[0]?.submitStudents}
                            </h1>
                            <p className="text-gray-500 ">
                                Submissions Received
                            </p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {matchingData?.moduleChapterData[0]?.submitStudents ?
                                    (totalStudents - matchingData.moduleChapterData[0].submitStudents).toString() :
                                    totalStudents.toString()
                                }
                            </h1>
                            <p className="text-gray-500 ">Not Yet Submitted</p>
                        </div>
                    </div>

                    {/* Search Input with Suggestions using Custom Hook */}
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

                    <DataTable data={studentStatus} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default PracticeProblems