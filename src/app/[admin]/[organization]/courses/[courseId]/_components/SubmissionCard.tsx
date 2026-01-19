import { ChevronRight, Clock3 } from 'lucide-react'
import Moment from 'react-moment'
import Link from 'next/link'

import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import StartAssignmentButton from './StartAssignmentButton'
import { ClassDatas } from '@/app/[admin]/[organization]/courses/[courseId]/_components/adminCourseCourseIdComponentType'

function SubmissionCard({
    classData,
    status,
    view,
}: {
    classData: ClassDatas
    status: string
    view: string
}) {
    return (
        <Card
            className={`w-full mb-6 border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F] ${
                status === 'lateAssignmet' && 'bg-red-50'
            }`}
            key={classData.id}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="font-bold text-lg flex flex-col border rounded-md py-2 px-4 text-muted-foreground border-muted-foreground">
                        <Moment format="DD">{classData.chapterDeadline}</Moment>{' '}
                        <Moment format="MMM">
                            {classData.chapterDeadline}
                        </Moment>
                    </div>
                    {/* <Separator
                        orientation="vertical"
                        className="bg-foreground h-[90px]"
                    /> */}
                    <div className="text-start">
                        {/* {status === 'lateAssignmet' ? (
                            <Badge variant="yellow" className="mb-3 bg-red-100">
                                Late Assignmet
                            </Badge>
                        ) : null} */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <h3 className="font-semibold">
                                        {classData.chapterTitle}
                                    </h3>
                                </TooltipTrigger>
                                <TooltipContent className="font-semibold">
                                    {classData.chapterTitle}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Upcoming assignment for desktop */}
                        {status !== 'lateAssignmet' && view === 'course' && (
                            <div className="hidden lg:flex flex-row gap-4">
                                {/* <p className="text-md text-start mt-3 mb-2 ">
                                    {classData?.bootcampName}
                                </p>
                                <span className="w-[5px] h-[5px] bg-gray-500 rounded-full self-center"></span> */}
                                <p className="text-md text-start mt-3 mb-2 ">
                                    {classData?.moduleName}
                                </p>
                            </div>
                        )}

                        {/* Upcoming assignment for desktop */}
                        {status !== 'lateAssignmet' && view === 'dashboard' && (
                            <div className="hidden lg:flex flex-row gap-4">
                                <p className="text-md text-start mt-3 mb-2 ">
                                    {classData?.bootcampName}
                                </p>
                                <span className="w-[5px] h-[5px] bg-gray-500 rounded-full self-center"></span>
                                <p className="text-md text-start mt-3 mb-2 ">
                                    {classData?.moduleName}
                                </p>
                            </div>
                        )}

                        {/* Late assignment for desktop in course */}
                        {status === 'lateAssignmet' && view === 'course' && (
                            <div className="hidden lg:flex flex-row gap-4">
                                <p className="text-md text-start mt-3 mb-2">
                                    {classData.moduleName}
                                </p>
                            </div>
                        )}
                        {/* Late assignment for desktop in dashboard*/}
                        {status === 'lateAssignmet' && view !== 'course' && (
                            <div className="hidden lg:flex flex-row gap-4">
                                <p className="text-md text-start mt-3 mb-2">
                                    {classData.bootcampName}
                                    &nbsp;-&nbsp;
                                    {classData.moduleName}
                                </p>
                            </div>
                        )}

                        {/* Submission in Dashboard for mobile*/}
                        {view === 'dashboard' && (
                            <div className="lg:hidden flex flex-row">
                                <p className="text-md text-start mt-3 mb-2">
                                    {classData.bootcampName}
                                    &nbsp;-&nbsp;
                                    {classData.moduleName}
                                </p>
                            </div>
                        )}
                        {/* Submission in Course for mobile*/}
                        {view === 'course' && (
                            <div className="lg:hidden flex flex-row">
                                <p className="text-md text-start mt-3 mb-2">
                                    {classData.moduleName}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Upcoming submission in dashboard */}
                {status === 'upcomingAssignment' && (
                    <div className="hidden lg:flex text-end">
                        <Button variant={'ghost'} className="text-lg font-bold">
                            <Link
                                href={`/student/courses/${classData.bootcampId}/modules/${classData.moduleId}/chapters/${classData.chapterId}`}
                                className="gap-3 flex  items-center text-secondary"
                            >
                                <p>Start Assignment</p>
                                <ChevronRight size={15} />
                            </Link>
                        </Button>
                    </div>
                )}
                {/* Late assignment in dashboard */}
                {status === 'lateAssignmet' && view !== 'course' && (
                    <div className="hidden lg:flex text-end">
                        <Button
                            variant="destructive"
                            className="bg-transparent border-none text-red-500 hover:bg-red-50 text-lg font-bold"
                        >
                            <Link
                                href={`/student/courses/${classData.bootcampId}/modules/${classData.moduleId}/chapters/${classData.chapterId}`}
                                className="gap-3 flex items-center text-red-500"
                            >
                                <p>Start Assignment</p>
                                <ChevronRight size={15} />
                            </Link>
                        </Button>
                        {/* <StartAssignmentButton
                            classData={classData}
                            // status={status}
                            // view={view}
                            buttonClass="bg-transparent border-none text-red-500 hover:bg-red-50 text-lg font-bold"
                            variant="destructive"
                        /> */}
                    </div>
                )}
            </div>
            {/* For late submission on the course */}
            {status === 'lateAssignmet' && view === 'course' && (
                <div className="hidden lg:flex w-full justify-end lg:justify-end lg:w-autotext-end">
                    <Button
                        variant="destructive"
                        className="bg-transparent border-none text-red-500 hover:bg-red-50 text-lg font-bold"
                    >
                        <Link
                            href={`/student/courses/${classData.bootcampId}/modules/${classData.moduleId}/chapters/${classData.chapterId}`}
                            className="gap-3 flex items-center text-red-500"
                        >
                            <p>Start Assignment</p>
                            <ChevronRight size={15} />
                        </Link>
                    </Button>
                </div>
            )}
            {/* For late submission on the phone */}
            {status === 'lateAssignmet' && (
                <div className="block lg:hidden text-end">
                    <Button
                        variant="destructive"
                        className="bg-transparent border-none text-red-500 hover:bg-red-50 text-lg font-bold"
                    >
                        <Link
                            href={`/student/courses/${classData.bootcampId}/modules/${classData.moduleId}/chapters/${classData.chapterId}`}
                            className="gap-3 flex items-center text-red-500"
                        >
                            <p>Start Assignment</p>
                            <ChevronRight size={15} />
                        </Link>
                    </Button>
                </div>
            )}

            {/* For upcoming submission on the phone */}
            {status !== 'lateAssignmet' && (
                <div className="block lg:hidden text-end">
                    <Button variant={'ghost'} className="text-lg font-bold">
                        <Link
                            href={`/student/courses/${classData.bootcampId}/modules/${classData.moduleId}/chapters/${classData.chapterId}`}
                            className="gap-3 flex  items-center text-secondary"
                        >
                            <p>Start Assignment</p>
                            <ChevronRight size={15} />
                        </Link>
                    </Button>
                </div>
            )}
        </Card>
    )
}

export default SubmissionCard
