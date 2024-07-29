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

function SubmissionCard({ classData }: { classData: any }) {
    return (
        <Card
            className="w-full mb-6 border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F]"
            key={classData.id}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="font-bold text-lg flex flex-col border rounded-md py-2 px-4 text-muted-foreground border-muted-foreground">
                        <Moment format="DD">{classData.startTime}</Moment>{' '}
                        <Moment format="MMM">{classData.startTime}</Moment>
                    </div>
                    {/* <Separator
                        orientation="vertical"
                        className="bg-foreground h-[90px]"
                    /> */}
                    <div className="text-start">
                        {/* {classType === 'ongoing' ? (
                            <Badge variant="yellow" className="mb-3">
                                Ongoing
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
                        {/* <div className="text-md flex w-[200px] capitalize items-center">
                            <Clock3 className="mr-2" width={20} height={20} />
                            <Moment format="hh:mm A">
                                {classData.startTime}
                            </Moment>
                            <p className="mx-2">-</p>
                            <Moment format="hh:mm A">
                                {classData.endTime}
                            </Moment>
                        </div> */}
                        <div className="hidden lg:flex flex-row gap-4">
                            <p className="text-md text-start mt-3 mb-2 ">
                                {classData?.bootcampName}
                            </p>
                            <span className="w-[5px] h-[5px] bg-gray-500 rounded-full self-center"></span>
                            <p className="text-md text-start mt-3 mb-2 ">
                                {classData?.moduleName}
                            </p>
                        </div>
                        <div className="lg:hidden flex flex-row">
                            <p className="text-md text-start mt-3 mb-2">
                                {classData?.bootcampName}
                                &nbsp;-&nbsp;
                                {classData?.moduleName}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:flex text-end">
                    <Button
                        variant={'ghost'}
                        className="text-lg font-bold"
                        // disabled={classType === 'ongoing' ? false : true}
                    >
                        <Link
                            // target="_blank"
                            href={`/student/courses/9/modules/${classData.moduleId}`}
                            className="gap-3 flex  items-center text-secondary"
                        >
                            <p>Start Assignment</p>
                            <ChevronRight size={15} />
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="block lg:hidden text-end">
                <Button
                    variant={'ghost'}
                    className="text-lg font-bold"
                    // disabled={classType === 'ongoing' ? false : true}
                >
                    <Link
                        // target="_blank"
                        href={`/student/courses/9/modules/${classData.moduleId}`}
                        className="gap-3 flex  items-center text-secondary"
                    >
                        <p>Start Assignment</p>
                        <ChevronRight size={15} />
                    </Link>
                </Button>
            </div>
        </Card>
    )
}

export default SubmissionCard
