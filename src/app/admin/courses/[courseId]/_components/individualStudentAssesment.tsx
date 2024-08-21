import React from 'react'
import IndividualStudent from './IndividualStudent'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import { color } from 'framer-motion'

type Props = {}

const IndividualStudentAssesment = (props: any) => {
    const color = getAssesmentBackgroundColorClass(25, 5)
    const renderQuestion = () => {
        if (props.data.submissionData) {
            if (props.data.submissionData.OpenEndedQuestion) {
                return props.data.submissionData.OpenEndedQuestion.question
            } else if (props.data.submissionData.QuizQuestion) {
                return props.data.submissionData.QuizQuestion.question
            } else if (props.data.submissionData.CodingQuestion) {
                return props.data.submissionData.CodingQuestion.question
            } else {
                return 'Question not available'
            }
        } else {
            return 'Submission data not available'
        }
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
                <Button
                    variant={'ghost'}
                    className="text-secondary text-md flex items-center "
                >
                    View Solution <ChevronRight size={20} />
                </Button>
            </div>
        </div>
    )
}

export default IndividualStudentAssesment
