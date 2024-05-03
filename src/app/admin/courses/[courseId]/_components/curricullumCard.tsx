import { isPlural } from '@/lib/utils'
import {
    BookOpenText,
    Clock1,
    SquareCode,
    FileQuestion,
    GripVertical,
    PencilLine,
} from 'lucide-react'
import React from 'react'

type Props = {
    index: number
    name: string
    order: number
    description: string
    quizCount: number
    assignmentCount: number
    timeAlloted: number
    codingProblemsCount: number
    articlesCount: number
}

const CurricullumCard = ({
    index,
    name,
    order,
    description,
    quizCount,
    assignmentCount,
    timeAlloted,
    codingProblemsCount,
    articlesCount,
}: Props) => {
    const timeAllotedInWeeks = Math.round(timeAlloted / 604800)
    const timeAllotedInDays = Math.round(timeAlloted / 86400)

    return (
        <div className="w-full flex items-center justify-between gap-y-2  ">
            <div className="w-full p-2">
                <div className="flex mb-2 w-full justify-between">
                    <p className="text-md font-semibold capitalize text-black text-start">
                        {`Module ${order}`} : {name}
                    </p>
                    <GripVertical />
                </div>
                <p className="text-start mb-2">{description}</p>
                <div className="flex flex-wrap justify-start  gap-x-4">
                    <div className="flex  items-center justify-start gap-x-2 ">
                        <Clock1 size={15} />
                        <p className="text-md font-semibold capitalize text-gray-600">
                            {timeAllotedInWeeks < 1
                                ? `${timeAllotedInDays} ${
                                      timeAllotedInDays === 1 ? 'day' : 'days'
                                  }`
                                : `${
                                      timeAllotedInWeeks == 1
                                          ? '1 week'
                                          : `${timeAllotedInWeeks} weeks`
                                  }`}
                        </p>
                    </div>
                    {articlesCount > 0 ? (
                        <div className="flex  items-center justify-start gap-x-2 ">
                            <BookOpenText size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {articlesCount}{' '}
                                {isPlural(articlesCount)
                                    ? 'Articles'
                                    : 'Article'}
                            </p>
                        </div>
                    ) : null}
                    {assignmentCount > 0 ? (
                        <div className="flex  items-center justify-start gap-x-2 ">
                            <PencilLine size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {assignmentCount}{' '}
                                {isPlural(assignmentCount)
                                    ? 'Assignments'
                                    : 'Assignment'}
                            </p>
                        </div>
                    ) : null}
                    {quizCount > 0 ? (
                        <div className="flex  items-center justify-start gap-x-2 ">
                            <FileQuestion size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {quizCount}{' '}
                                {isPlural(quizCount) ? 'Quizzes' : 'Quiz'}
                            </p>
                        </div>
                    ) : null}
                    {codingProblemsCount > 0 ? (
                        <div className="flex  items-center justify-start gap-x-2 ">
                            <SquareCode size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {codingProblemsCount}{' '}
                                {isPlural(codingProblemsCount)
                                    ? 'Coding Problems'
                                    : 'Coding Problem'}
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
            {/* <div className="">
                <CircularLoader />
              </div> */}
        </div>
    )
}

export default CurricullumCard
