import React from 'react'
import SelectCodingQuestions from '@/app/[admin]/[organizationId]/courses/[courseId]/module/_components/Assessment/SelectCodingQuestions'
import SelectOpenEndedQuestions from '@/app/[admin]/[organizationId]/courses/[courseId]/module/_components/Assessment/SelectOpenEndedQuestions'
import SelectQuizQuestions from '@/app/[admin]/[organizationId]/courses/[courseId]/module/_components/Assessment/SelectQuizQuestions'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { QuestionComponentProps } from '@/app/[admin]/[organizationId]/courses/[courseId]/module/_components/Assessment/ComponentAssessmentType'
const selectedQuestions = ({
    selectedCodingQuestions,
    selectedQuizQuestions,
    selectedOpenEndedQuestions,
    setSelectedCodingQuestions,
    setSelectedQuizQuestions,
    setSelectedOpenEndedQuestions,
    questionType,
    tags,
    setIsNewQuestionAdded,
}: QuestionComponentProps) => {
    return (
        <div className="">
            {/* <ScrollBar orientation="vertical" className='text-red-500' /> */}
            {questionType === 'coding' && (
                <SelectCodingQuestions
                    selectedQuestions={selectedCodingQuestions}
                    setSelectedQuestions={setSelectedCodingQuestions}
                    tags={tags}
                    type={'coding'}
                    setIsNewQuestionAdded={setIsNewQuestionAdded}
                />
            )}
            {questionType === 'mcq' && (
                <SelectQuizQuestions
                    selectedQuestions={selectedQuizQuestions}
                    setSelectedQuestions={setSelectedQuizQuestions}
                    tags={tags}
                    type={'mcq'}
                    setIsNewQuestionAdded={setIsNewQuestionAdded}
                />
            )}
            {questionType === 'open-ended' && (
                <SelectOpenEndedQuestions
                    selectedQuestions={selectedOpenEndedQuestions}
                    setSelectedQuestions={setSelectedOpenEndedQuestions}
                    tags={tags}
                    type={'open-ended'}
                />
            )}
        </div>
    )
}

export default selectedQuestions
