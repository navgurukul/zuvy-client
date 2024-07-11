import React from 'react'
import IndividualStudent from './IndividualStudent'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { color } from 'framer-motion'

type Props = {}

const IndividualStudentAssesment = ({ data, type }: any) => {
    const color = getAssesmentBackgroundColorClass(25, 5)
    const renderQuestion = () => {
        if (type === 'openEndedSubmission') {
            return (
                data.submissionData.OpenEndedQuestion?.question ||
                'Question not available'
            )
        } else if (type === 'quizSubmission') {
            return (
                data.submissionData.Quiz?.question || 'Question not available'
            )
        } else if (type === 'codingSubmission') {
            return data.questionDetail?.title || 'Question not available'
        }
        return 'Question not available'
    }
    return (
        <div className="lg:flex h-[200px] my-3 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md ">
            <div className="flex flex-col w-full justify-between   ">
                <div className="flex items-start flex-col p-4 gap-y-7 justify-betweenrounded-md">
                    <h1 className="text-[20px] capitalize text-start font-semibold text-gray-600  dark:text-white ">
                        {renderQuestion()}
                    </h1>
                    <div className="flex flex-start gap-x-4 ">
                        <div className="flex gap-x-2 ">
                            <h1 className="text-start ">TIme Taken</h1>
                            <p className="text-gray-500 text-start">10 mins</p>
                        </div>
                        <div className="flex gap-x-2 ">
                            <h1 className="text-start ">Tab Change </h1>
                            <p className="text-gray-500 text-start">5 times</p>
                        </div>
                        <div className="flex gap-x-2 ">
                            <h1 className="text-start ">Copy Paste</h1>
                            <p className="text-gray-500">none</p>
                        </div>
                    </div>
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
                        href={`/admin/courses/${9}/submissionAssesments/${56756}/IndividualReport/${567567}/Report/${456}/ViewSolution/${12}`}
                    >
                        View Solution <ChevronRight size={20} />
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export default IndividualStudentAssesment
