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
    copyPaste,
    tabchanges,
    codingScore,
    totalCodingScore,
    mcqScore,
    totalMcqScore,
    openEndedScore,
    totalOpenEndedScore,
}: any) => {
    const { courseId, assessment_Id, IndividualReport, report } = params
    const color = getAssesmentBackgroundColorClass(25, 5)
    const renderQuestion = () => {
        switch (type) {
            case 'openEndedSubmission':
                return {
                    title: 'Open Ended Question',
                    link: `/admin/courses/${courseId}/submissionAssesments/${assessment_Id}/IndividualReport/${IndividualReport}/Report/${report}/ViewSolutionOpenEnded`,
                }
            case 'quizSubmission':
                return {
                    title: 'Quiz assessment',
                    link: `/admin/courses/${courseId}/submissionAssesments/${assessment_Id}/IndividualReport/${IndividualReport}/Report/${report}/ViewSolutionQuizQuestion`,
                }
            case 'codingSubmission':
                return {
                    title: 'Coding Questions',
                    link: `/admin/courses/${courseId}/submissionAssesments/${assessment_Id}/IndividualReport/${IndividualReport}/Report/${report}/ViewSolutionCodingQuestion/${codingOutsourseId}?id=${data?.questionId}`,
                }
            default:
                return {
                    title: 'Question not available',
                    link: '/not-available',
                }
        }
    }
    const questionInfo = renderQuestion()
    const scoreHandler = () => {
        let score, totalScore

        if (type === 'codingSubmission') {
            score = +codingScore
            totalScore = +totalCodingScore
        } else if (type === 'quizSubmission') {
            score = +mcqScore
            totalScore = +totalMcqScore
        } else {
            score = +openEndedScore
            totalScore = +totalOpenEndedScore
        }

        const percentage = (score / totalScore) * 100

        let bgColorClass
        if (percentage < 50) {
            bgColorClass = 'bg-red-500'
        } else if (percentage >= 50 && percentage < 70) {
            bgColorClass = 'bg-yellow-300'
        } else if (percentage >= 70 && percentage <= 80) {
            bgColorClass = 'bg-green-200'
        } else {
            bgColorClass = 'bg-green-300'
        }

        return {
            score: Math.trunc(+score) + '/' + Math.trunc(+totalScore),
            className: bgColorClass,
        }
    }

    return (
        <div
            className={`flex flex-col h-[160px] lg:h-[150px] p-6 shadow-lg  transition-transform transform hover:shadow-xl rounded-md overflow-hidden mt-3 w-5/6 relative`}
        >
            <div className="flex flex-col w-full h-full justify-between">
                <div>
                    <h1 className="capitalize text-start text-[14px] font-semibold mb-2 text-gray-600 dark:text-white truncate w-full">
                        {type === 'codingSubmission'
                            ? data.questionDetail.title
                            : questionInfo.title}
                    </h1>

                    {/* <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-12 ">
                        {type !== 'quizSubmission' && (
                            <h1>
                                Copy Paste:{' '}
                                {copyPaste == 0 ? 'None' : copyPaste}
                            </h1>
                        )}
                        <h1>
                            Tab Change: {tabchanges == 0 ? 'None' : tabchanges}
                        </h1>
                    </div> */}
                    <div className="flex items-center gap-x-2 my-4">
                        <span
                            className={`h-2 w-2 rounded-full ${
                                type !== 'codingSubmission'
                                    ? scoreHandler().className
                                    : data.status == 'Accepted'
                                        ? 'bg-green-300'
                                        : 'bg-red-500'
                                }`}
                        />
                        <span className="text-[15px] text-gray-600">
                            {type !== 'codingSubmission' ? (
                                <>Score: {scoreHandler().score}</>
                            ) : (
                                <>Status: {data.status}</>
                            )}
                        </span>
                    </div>
                </div>

                {/* Button positioned at the bottom-right */}
                <div className="absolute bottom-3 right-3">
                    <Button variant={'ghost'} className="w-full lg:w-auto">
                        <Link
                            className="text-[rgb(81,134,114)] font-semibold text-md flex items-center w-full truncate"
                            href={questionInfo.link}
                        >
                            View Answers
                            <ChevronRight size={20} className="ml-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default IndividualStudentAssesment
