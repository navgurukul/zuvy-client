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
    typeId,
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
    typeId: number
}) {
    const timeAllotedInWeeks = Math.ceil(timeAlloted / 604800)
    const timeAllotedInDays = Math.round(timeAlloted / 86400)

    return (
        <Link
            key={id}
            href={`/student/courses/${param}/modules/${id}`}
            className={`bg-gradient-to-bl my-3 p-3 rounded-xl flex flex-col md:flex-row ${
                typeId === 1
                    ? !isLock
                        ? 'from-blue-50 to-violet-50'
                        : 'from-blue-50 to-violet-50 pointer-events-none opacity-50'
                    : isLock
                    ? 'bg-yellow/30'
                    : 'bg-yellow/50'
            }`}
        >
            <div className="flex flex-col justify-between w-full p-5">
                <div className="flex-grow text-start">
                    <div className="flex justify-between items-center text-xl font-bold capitalize">
                        <div>{name}</div>
                        <div>
                            {!isLock ? (
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
                                </div>
                            ) : (
                                <Lock opacity={50} size={30} />
                            )}
                        </div>
                    </div>
                    <p className="mt-2">{description}</p>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 md:mt-0 justify-start">
                    <div className="flex items-center gap-x-2">
                        <Clock3
                            size={15}
                            className="inline mr-1 mt-1"
                            color="#4A4A4A"
                        />
                        <span>
                            {timeAllotedInWeeks < 1
                                ? `${timeAllotedInDays} ${
                                      timeAllotedInDays === 1 ? 'day' : 'days'
                                  }`
                                : `${timeAllotedInWeeks} ${
                                      timeAllotedInWeeks === 1
                                          ? 'week'
                                          : 'weeks'
                                  }`}
                        </span>
                    </div>
                    {articlesCount > 0 && (
                        <div className="flex items-center gap-x-2">
                            <BookOpenText size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {articlesCount}{' '}
                                {isPlural(articlesCount)
                                    ? 'Articles'
                                    : 'Article'}
                            </p>
                        </div>
                    )}
                    {assignmentCount > 0 && (
                        <div className="flex items-center gap-x-2">
                            <PencilLine size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {assignmentCount}{' '}
                                {isPlural(assignmentCount)
                                    ? 'Assignments'
                                    : 'Assignment'}
                            </p>
                        </div>
                    )}
                    {quizCount > 0 && (
                        <div className="flex items-center gap-x-2">
                            <FileQuestion size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {quizCount}{' '}
                                {isPlural(quizCount) ? 'Quizzes' : 'Quiz'}
                            </p>
                        </div>
                    )}
                    {codingProblemsCount > 0 && (
                        <div className="flex items-center gap-x-2">
                            <SquareCode size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {codingProblemsCount}{' '}
                                {isPlural(codingProblemsCount)
                                    ? 'Coding Problems'
                                    : 'Coding Problem'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default CourseCard
