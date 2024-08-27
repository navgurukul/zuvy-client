import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    cn,
    difficultyColor,
    getAssesmentBackgroundColorClass,
} from '@/lib/utils'

type Props = {}

const IndividualStudentAssesment = ({
    data,
    type,
    params,
    codingOutsourseId,
}: any) => {
    const { courseId, StudentAssesmentData, IndividualReport, report } = params
    const color = getAssesmentBackgroundColorClass(25, 5)
    const renderQuestion = () => {
        switch (type) {
            case 'openEndedSubmission':
                return {
                    title: 'Open Ended Question',
                    link: `/admin/courses/${courseId}/submissionAssesments/${StudentAssesmentData}/IndividualReport/${IndividualReport}/Report/${report}/ViewSolutionOpenEnded`,
                }
            case 'quizSubmission':
                return {
                    title: 'Quiz assessment',
                    link: `/admin/courses/${courseId}/submissionAssesments/${StudentAssesmentData}/IndividualReport/${IndividualReport}/Report/${report}/ViewSolutionQuizQuestion`,
                }
            case 'codingSubmission':
                return {
                    title: 'Coding Questions',
                    link: `/admin/courses/${courseId}/submissionAssesments/${StudentAssesmentData}/IndividualReport/${IndividualReport}/Report/${report}/ViewSolutionCodingQuestion/${codingOutsourseId}?id=${data?.questionId}`,
                }
            default:
                return {
                    title: 'Question not available',
                    link: '/not-available',
                }
        }
    }
    const questionInfo = renderQuestion()
    console.log(data)

    return (
        <div
            className={`flex flex-col h-auto lg:h-[220px] p-3 shadow-lg backdrop-blur-lg transition-transform transform  hover:shadow-xl rounded-md overflow-hidden mt-3 ${
                type === 'quizSubmission' || type === 'openEndedSubmission'
                    ? 'w-3/5'
                    : 'w-full'
            }`}
        >
            <div className="flex flex-col w-full h-full justify-between relative">
                <div className="absolute top-3 right-3">
                    <Button variant={'ghost'} className="w-full lg:w-auto">
                        <Link
                            className="text-secondary text-md flex items-center w-full truncate"
                            href={questionInfo.link}
                        >
                            View Solution
                            <ChevronRight size={20} className="ml-1" />
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-col p-4 gap-y-4 lg:gap-y-7 overflow-hidden">
                    <h1 className="text-[18px] md:text-[20px] capitalize text-start font-semibold text-gray-600 dark:text-white truncate w-full">
                        Title :-{' '}
                        {type === 'codingSubmission'
                            ? data.questionDetail.title
                            : questionInfo.title}
                    </h1>
                    <div className="flex flex-col gap-3 md:gap-4 lg:gap-5 overflow-hidden">
                        {type === 'codingSubmission' && (
                            <div className="flex flex-col gap-3 md:gap-4 lg:gap-5 w-full">
                                <div className="flex font-semibold gap-2 flex-wrap overflow-hidden">
                                    <h1>Description:</h1>
                                    <h1 className="truncate">
                                        {data.questionDetail.description}
                                    </h1>
                                </div>
                                <div className="flex font-semibold gap-2 flex-wrap overflow-hidden">
                                    <h1>Difficulty:</h1>
                                    <h1
                                        className={cn(
                                            `font-semibold text-secondary`,
                                            difficultyColor(
                                                data.questionDetail.difficulty
                                            )
                                        )}
                                    >
                                        {data.questionDetail.difficulty}
                                    </h1>
                                </div>
                                <div className="flex font-semibold gap-2 flex-wrap overflow-hidden">
                                    <h1>Submission Status:</h1>
                                    <h1
                                        className={cn(
                                            `font-semibold ${
                                                data.status === 'Accepted'
                                                    ? 'text-secondary'
                                                    : 'text-destructive'
                                            }`
                                        )}
                                    >
                                        {data.status}
                                    </h1>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IndividualStudentAssesment
