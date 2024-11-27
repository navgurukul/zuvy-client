import React from 'react'
import SelectCodingQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/SelectCodingQuestions'
import SelectOpenEndedQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/SelectOpenEndedQuestions'
import SelectQuizQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/SelectQuizQuestions'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'


const selectedQuestions = ({
    selectedCodingQuestions,
    selectedQuizQuestions,
    selectedOpenEndedQuestions,
    setSelectedCodingQuestions,
    setSelectedQuizQuestions,
    setSelectedOpenEndedQuestions,
    questionType,
    tags
}: {
    selectedCodingQuestions: any
    selectedQuizQuestions: any
    selectedOpenEndedQuestions: any
    setSelectedCodingQuestions: any
    setSelectedQuizQuestions: any
    setSelectedOpenEndedQuestions: any
    questionType: string
    tags: any
}) => {
    return (
        <>
            <ScrollArea className="h-dvh pr-4 overflow-auto">
                {/* <ScrollBar orientation="vertical" className='text-red-500' /> */}
                {questionType === 'coding' && (
                    <SelectCodingQuestions
                        selectedQuestions={selectedCodingQuestions}
                        setSelectedQuestions={setSelectedCodingQuestions}
                        tags={tags}
                        type={"coding"}
                    />
                )}
                {questionType === 'mcq' && (
                    <SelectQuizQuestions
                        selectedQuestions={selectedQuizQuestions}
                        setSelectedQuestions={setSelectedQuizQuestions}
                        tags={tags}
                        type={"mcq"}
                    />
                )}
                {questionType === 'open-ended' && (
                    <SelectOpenEndedQuestions
                        selectedQuestions={selectedOpenEndedQuestions}
                        setSelectedQuestions={setSelectedOpenEndedQuestions}
                        tags={tags}
                        type={"open-ended"}
                    />
                )}
            </ScrollArea>
        </>
    )
}

export default selectedQuestions
