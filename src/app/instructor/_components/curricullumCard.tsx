import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { isPlural } from '@/lib/utils'

import {
    BookOpenText,
    Clock1,
    SquareCode,
    FileQuestion,
    PencilLine,
} from 'lucide-react'

type Props = {
    course: any
}

const CurricullumCard = ({ course }: Props) => {
    const router = useRouter()
    const timeAllotedInWeeks = Math.ceil(course.timeAlloted / 604800)

    const handleModuleRoute = () => {
        router.push(`/instructor/courses/${117}/module/${course.id}`)
    }

    return (
        // <Link href={''}>
        // </Link>
        <div className="w-full flex items-center justify-between gap-y-2 cursor-pointer">
            <div className="w-full p-2" onClick={handleModuleRoute}>
                <div className="flex mb-2 w-full justify-between">
                    <p className="text-md font-semibold capitalize text-black text-start">
                        {`Module ${course.order}`} : {course.name}
                    </p>
                </div>
                <div className="flex flex-wrap justify-start gap-x-4">
                    <div className="flex items-center justify-start gap-x-2">
                        <Clock1 size={15} />
                        <p className="text-md font-semibold capitalize text-gray-600">
                            {timeAllotedInWeeks > 1
                                ? `${timeAllotedInWeeks} weeks`
                                : `${timeAllotedInWeeks} week`}
                        </p>
                    </div>
                    {course.articlesCount > 0 ? (
                        <div className="flex items-center justify-start gap-x-2">
                            <BookOpenText size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {course.articlesCount}{' '}
                                {isPlural(course.articlesCount)
                                    ? 'Articles'
                                    : 'Article'}
                            </p>
                        </div>
                    ) : null}
                    {course.assignmentCount > 0 ? (
                        <div className="flex items-center justify-start gap-x-2">
                            <PencilLine size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {course.assignmentCount}{' '}
                                {isPlural(course.assignmentCount)
                                    ? 'Assignments'
                                    : 'Assignment'}
                            </p>
                        </div>
                    ) : null}
                    {course.quizCount > 0 ? (
                        <div className="flex items-center justify-start gap-x-2">
                            <FileQuestion size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {course.quizCount}{' '}
                                {isPlural(course.quizCount)
                                    ? 'Quizzes'
                                    : 'Quiz'}
                            </p>
                        </div>
                    ) : null}
                    {course.codingProblemsCount > 0 ? (
                        <div className="flex items-center justify-start gap-x-2">
                            <SquareCode size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {course.codingProblemsCount}{' '}
                                {isPlural(course.codingProblemsCount)
                                    ? 'Coding Problems'
                                    : 'Coding Problem'}
                            </p>
                        </div>
                    ) : null}
                </div>
                <p className="text-start mt-2">{course.description}</p>
            </div>
        </div>
    )
}

export default CurricullumCard
