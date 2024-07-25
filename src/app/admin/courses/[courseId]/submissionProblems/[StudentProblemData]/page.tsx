'use client'
import React, { useCallback, useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import { columns } from './columns'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'

interface CodingQuestionDetails {
    id: number
    title: string
}

interface ModuleChapterData {
    id: number
    codingQuestionDetails: CodingQuestionDetails
    submitStudents: number
}

interface Module {
    id: number
    typeId: number
    isLock: boolean
    bootcampId: number
    name: string
    description: string
    projectId: number | null
    order: number
    timeAlloted: number
    moduleChapterData: ModuleChapterData[]
}
const PraticeProblems = ({ params }: any) => {
    const [submissionData, setSubmissionData] = useState<any[]>([])
    const [matchingData, setMatchingData] = useState<any>(null)
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [studentDetails, setStudentDetails] = useState<any[]>([])
    const [bootcampData, setBootcampData] = useState<any>({})

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
            crumb: 'Submission - Practice Problems',
            href: '',
            isLast: false,
        },
        {
            crumb: matchingData?.moduleChapterData[0]?.codingQuestionDetails
                ?.title,
            href: '',
            isLast: false,
        },
    ]

    const getSubmissionDataHandler = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/submissionsOfPractiseProblems/${params.courseId}`
            )
            setSubmissionData(res.data.trackingData)
            setTotalStudents(res.data.totalStudents)
        } catch (error) {}
    }, [params.courseId])

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {}
    }, [params.courseId])

    const getStudentDetails = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/practiseProblemStatus/${matchingData?.id}?chapterId=${matchingData?.moduleChapterData[0].id}&questionId=${matchingData?.moduleChapterData[0].codingQuestionDetails.id}`
            )

            setStudentDetails(res.data.data)
        } catch (error) {}
    }, [matchingData?.id, matchingData?.moduleChapterData])

    useEffect(() => {
        getSubmissionDataHandler()
        getBootcampHandler()
    }, [getSubmissionDataHandler, getBootcampHandler])
    useEffect(() => {
        if (matchingData) {
            getStudentDetails()
        }
    }, [getStudentDetails, matchingData])

    useEffect(() => {
        if (submissionData.length > 0 && params.StudentProblemData) {
            const matchingModule = submissionData.find(
                (module) => module.id === +params.StudentProblemData
            )
            setMatchingData(matchingModule || null)
        } else {
            setMatchingData(null)
        }
    }, [submissionData, params.StudentProblemData])

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
                                {
                                    matchingData?.moduleChapterData[0]
                                        .submitStudents
                                }
                            </h1>
                            <p className="text-gray-500 ">
                                Submissions Received
                            </p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {totalStudents -
                                    matchingData?.moduleChapterData[0]
                                        .submitStudents}
                            </h1>
                            <p className="text-gray-500 ">Not Yet Submitted</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Input
                            placeholder="Search for Name, Email"
                            className="w-1/3 my-6 input-with-icon pl-8" // Add left padding for the icon
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                    </div>
                    <DataTable data={studentDetails} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default PraticeProblems
