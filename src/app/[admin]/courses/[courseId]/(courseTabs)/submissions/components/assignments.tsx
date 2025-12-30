'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, ArrowDownToLine, FileText,Eye } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
import { error } from 'console'
import { nullable } from 'zod'
import {
    AssignmentProps,
    AssignmentModuleData,
    AssignmentApiResponse,
} from '@/app/[admin]/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType'
import { Badge } from '@/components/ui/badge'
import {AssignmentSubmissionSkeleton} from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'
import useDownloadCsv from '@/hooks/useDownloadCsv'


const Assignments = ({ courseId, debouncedSearch }: AssignmentProps) => {
    const { downloadCsv } = useDownloadCsv()
    const [assignmentData, setAssignmentData] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAssignmentDataHandler = async () => {
            try {
                const url = debouncedSearch
                    ? `/submission/submissionsOfAssignment/${courseId}?searchAssignment=${debouncedSearch}`
                    : `/submission/submissionsOfAssignment/${courseId}`
                const res = await api.get<AssignmentApiResponse>(url)
                setAssignmentData(res.data.data.trackingData)
                setTotalStudents(res.data.data.totalStudents)
            setLoading(false)
            } catch (error) {
                toast.error({
                    title: 'Error',
                    description: 'Error while fetching assignment data',
                })
            }
        }

        fetchAssignmentDataHandler()
    }, [courseId, debouncedSearch])

    const handleDownloadCsv = (id: number) => {
        downloadCsv({
          endpoint: `/submission/assignmentStatus?chapterId=${id}&limit=5&offset=0`,
          fileName: 'Assignment_Status',
          columns: [
            { header: 'Name', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Status', key: 'status' },
          ],
          mapData: (assessment) => ({
            name: assessment.name || 'N/A',
            email: assessment.emailId || 'N/A',
            status: assessment.status || 'N/A',
          }),
        })
    }

    if (loading) {
    return <AssignmentSubmissionSkeleton/>
    }
    return (
        <div className="">
            {assignmentData?.length > 0 ? (
                assignmentData?.every(
                    (data) => data.moduleChapterData.length === 0
                ) ? (
                    <div className="w-screen flex flex-col justify-center items-center h-4/5">
                        <p className="text-center text-muted-foreground max-w-md">
                            No Assignment found.
                        </p>
                        <Image
                            src="/emptyStates/empty-submissions.png"
                            alt="No Assessment Found"
                            width={120}
                            height={120}
                            className="mb-6"
                        />
                    </div>
                ) : (
                    assignmentData?.map((data) => {
                        const moduleDataLength = data.moduleChapterData.length

                        if (moduleDataLength > 0)
                            return (
                                <div className="my-3" key={data.id}>
                                    <div className="w-full flex flex-col gap-y-5">
                                        <h1 className="w-full text-[20px] text-left font-semibold">
                                            Module: {data.name}
                                        </h1>
                                    </div>

                                    <div className="grid grid-cols-1 gap-8 mt-2 md:mt-4 md:grid-cols-2 lg:grid-cols-4">
                                        {data.moduleChapterData.map(
                                            (
                                                moduleData: AssignmentModuleData
                                            ) => {
                                                const isDisabled =
                                                    moduleData.submitStudents ===
                                                    0
                                                const chapterId = moduleData.id

                                                const submissionPercentage =
                                                    moduleData.submitStudents >
                                                    0
                                                        ? totalStudents /
                                                          moduleData.submitStudents
                                                        : 0
                                                return (
                                                    <div
                                                        className="relative bg-card border border-gray-200 rounded-md p-4 hover:shadow-lg transition-shadow w-full"
                                                        key={moduleData.id}
                                                    >
                                                   
                                                   <div className="flex items-center gap-3">
                                                        <div className="absolute top-5 pr-3 right-10">
                                                            {isDisabled ? (
                                                            <div className="relative group inline-flex">
                                                                <button
                                                                    disabled
                                                                    className="ml-2 cursor-not-allowed text-gray-400"
                                                                    aria-label="Download full report"
                                                                >
                                                                    <ArrowDownToLine size={20} />
                                                                </button>
                                                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">
                                                                    No submissions available   
                                                                </div>
                                                            </div>
                                                            ) : (
                                                            <button
                                                                className="ml-2 cursor-pointer text-gray-500 hover:text-gray-700"
                                                                onClick={() => handleDownloadCsv(Number(chapterId))}
                                                                aria-label="Download full report"
                                                            >
                                                                <ArrowDownToLine size={20} />
                                                            </button>
                                                            )}
                                                        </div>

                                                        {/* EYE ICON */}
                                                        <div className="absolute top-5 pr-3 right-2">
                                                            {isDisabled ? (
                                                            <div className="relative group inline-flex">
                                                                <span className="cursor-not-allowed">
                                                                <Eye size={20} className="text-gray-400 mb-1" />
                                                                </span>
                                                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">
                                                                    No submissions to view
                                                                </div>
                                                            </div>
                                                            ) : (
                                                            <Link
                                                                href={`/admin/courses/${courseId}/submissionAssignments/${moduleData.id}`}
                                                            >
                                                                <Eye size={20} className="text-gray-500 hover:text-gray-700 mb-1" />
                                                            </Link>
                                                            )}
                                                        </div>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="font-semibold pl-3 flex w-full flex-col justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-gray-100 rounded-md">
                                                                    <FileText className="w-4 h-4 text-gray-600" />
                                                                </div>
                                                                <h3 className="font-medium text-base text-gray-900">
                                                                    {
                                                                        moduleData.title
                                                                    }
                                                                </h3>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-4 text-sm">
                                                                <div className="flex items-center gap-1">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                                                                    >
                                                                        {
                                                                            moduleData.submitStudents
                                                                        }{' '}
                                                                        submissions
                                                                    </Badge>
                                                                </div>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                                                >
                                                                    {totalStudents -
                                                                        moduleData.submitStudents}{' '}
                                                                    pending
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        )}
                                    </div>
                                </div>
                            )
                    })
                )
            ) : (
                <div className="flex flex-col justify-center items-center">
                    <p className="text-center text-muted-foreground max-w-md">
                        No Assignment submissions available from the students
                        yet. Please wait until the first submission
                    </p>
                    <Image
                      src="/emptyStates/empty-submissions.png"
                      alt="No Assessment Found"
                      width={120}
                      height={120}
                      className="mb-6"
                    />
                </div>
            )}
        </div>
    )
}

export default Assignments
