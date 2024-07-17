import React from 'react'
import IndividualStudent from './IndividualStudent'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { color } from 'framer-motion'

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
                    link: `/admin/courses/${courseId}/submissionAssesments/${StudentAssesmentData}/IndividualReport/${IndividualReport}/Report/${report}/ViewSolutionCodingQuestion/${codingOutsourseId}`,
                }
            default:
                return {
                    title: 'Question not available',
                    link: '/not-available',
                }
        }
    }
    const questionInfo = renderQuestion()

    return (
        <div className="lg:flex h-[200px] my-3 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md ">
            <div className="flex flex-col w-full justify-between   ">
                <div className="flex items-start flex-col p-4 gap-y-7 justify-betweenrounded-md">
                    <h1 className="text-[20px] capitalize text-start font-semibold text-gray-600  dark:text-white ">
                        {questionInfo.title}
                    </h1>
                    <div className="flex items-center gap-x-2">
                        <div
                            className={`w-2 h-2 rounded-full flex items-center justify-center cursor-pointer ${color}`}
                        ></div>
                        <h1>Score: 2/25</h1>
                    </div>
                </div>
            </div>
            <div className="flex justify-end items-end">
                <Button variant={'ghost'}>
                    <Link
                        className="text-secondary text-md flex items-center "
                        href={questionInfo.link}
                    >
                        View Solution <ChevronRight size={20} />
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export default IndividualStudentAssesment
