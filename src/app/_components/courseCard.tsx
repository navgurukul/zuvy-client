import { isPlural } from '@/lib/utils'
import { CircularProgress } from '@nextui-org/react'
import {
    File,
    Lock,
    Clock3,
    ShieldQuestion,
    BookOpenText,
    PencilLine,
    FileQuestion,
    SquareCode,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function CourseCard({
    param,
    name,
    description,
    id,
    isLock,
    progress,
    timeAlloted,
    articlesCount,
    assignmentCount,
    codingProblemsCount,
    quizCount,
}: {
    param: string
    name: string
    description: string
    id: number
    isLock: boolean
    progress: number
    timeAlloted: number
    articlesCount: number
    assignmentCount: number
    codingProblemsCount: number
    quizCount: number
}) {
    const timeAllotedInWeeks = Math.round(timeAlloted / 604800)
    const timeAllotedInDays = Math.round(timeAlloted / 86400)

    return (
        <Link
            key={id}
            href={`/student/courses/${param}/modules/${id}`}
            style={{ width: '800px' }}
            className={
                !isLock
                    ? 'bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl'
                    : 'bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl pointer-events-none opacity-50'
            }
        >
            <div className="flex  justify-between ">
                <div
                    className="flex text-start flex-col p-5"
                    style={{ width: '750px' }}
                >
                    <div className="flex justify-between text-xl font-bold capitalize ">
                        {name}
                        <div>
                            {!isLock ? (
                                <>
                                    <div key={id} className="flex items-center">
                                        <CircularProgress
                                            classNames={{
                                                svg: 'w-11 h-11',
                                                indicator: 'text-secondary',
                                                track: 'stroke-white',
                                                value: 'text-sm font-bold',
                                            }}
                                            value={progress}
                                            strokeWidth={4}
                                            showValueLabel={true}
                                        />
                                        {/* <div
                                            className={`ml-2 ${
                                                progress > 9 && progress < 100
                                                    ? 'mr-1'
                                                    : ''
                                            } ${progress < 10 ? 'mr-2' : ''}`}
                                        >
                                            {progress}%
                                        </div> */}
                                    </div>
                                </>
                            ) : (
                                <Lock opacity={50} size={30} />
                            )}
                        </div>
                    </div>
                    <p className="mt-2">{description}</p>

                    <div className="flex justify-start mt-4 gap-2">
                        <Clock3
                            size={15}
                            className="inline mr-1 mt-1"
                            color="#4A4A4A"
                        />{' '}
                        {timeAllotedInWeeks < 1
                            ? `${timeAllotedInDays} ${
                                  timeAllotedInDays === 1 ? 'day' : 'days'
                              }`
                            : `${
                                  timeAllotedInWeeks == 1
                                      ? '1 week'
                                      : `${timeAllotedInWeeks} weeks`
                              }`}
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
            </div>
        </Link>
    )
}

export default CourseCard
