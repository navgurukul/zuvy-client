'use client'
import React, { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, ArrowDownToLine, FileText,Eye } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
import {
    AssignmentProps,
    AssignmentModuleData,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType'
import { Badge } from '@/components/ui/badge'
import {AssignmentSubmissionSkeleton} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'
import useDownloadCsv from '@/app/[admin]/hooks/useDownloadCsv'
import { useParams } from 'next/navigation'
import { getUser } from '@/store/store'
import { useAssignmentSubmissions } from '@/app/[admin]/hooks/useAssignmentSubmissions'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'


const Assignments = ({ courseId, debouncedSearch }: AssignmentProps) => {
    const { downloadCsv } = useDownloadCsv()
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = Number(organizationId) || user?.orgId; 

    const { assignmentData, totalStudents, loading, error } = useAssignmentSubmissions(courseId, {
        searchAssignment: debouncedSearch,
    })

    useEffect(() => {
        if (error) {
            toast.error({
                title: 'Error',
                description: 'Error while fetching assignment data',
            })
        }
    }, [error])

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
                                <div className="mb-6" key={data.id}>
                                    <h2 className="text-lg text-start font-bold text-foreground mb-3">
                                        Module - {data.name}
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                                                        className="relative bg-card border border-border rounded-md p-4 hover:shadow-lg transition-shadow w-full"
                                                        key={moduleData.id}
                                                    >
                                                   
                                                   {/* Action icons */}
                                                   <TooltipProvider>
                                                        <div className="absolute top-5 right-10">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        disabled={isDisabled}
                                                                        className={isDisabled ? 'cursor-not-allowed text-gray-400 dark:text-gray-500' : 'cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}
                                                                        onClick={!isDisabled ? () => handleDownloadCsv(Number(chapterId)) : undefined}
                                                                        aria-label="Download full report"
                                                                    >
                                                                        <ArrowDownToLine size={20} />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {isDisabled ? 'No submissions available' : 'Download report'}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>

                                                        {/* EYE ICON */}
                                                        <div className="absolute top-5 right-2">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    {isDisabled ? (
                                                                        <span className="cursor-not-allowed">
                                                                            <Eye size={20} className="text-gray-400 dark:text-gray-500" />
                                                                        </span>
                                                                    ) : (
                                                                        <Link
                                                                            href={`/${userRole}/organizations/${orgId}/courses/${courseId}/submissionAssignments/${moduleData.id}`}
                                                                        >
                                                                            <Eye size={20} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" />
                                                                        </Link>
                                                                    )}
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {isDisabled ? 'No submissions to view' : 'View submissions'}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                   </TooltipProvider>

                                                        {/* Content */}
                                                        <div className="font-semibold pl-3 flex w-full flex-col justify-between">
                                                            <div className="flex items-center gap-3 min-w-0 pr-16">
                                                                <div className="p-2 flex-shrink-0">
                                                                    <FileText className="w-4 h-4 text-foreground" />
                                                                </div>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <h3 className="font-medium text-base text-foreground truncate min-w-0">
                                                                                {moduleData.title}
                                                                            </h3>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            {moduleData.title}
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
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
