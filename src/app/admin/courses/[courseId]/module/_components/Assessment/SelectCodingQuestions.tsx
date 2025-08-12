import React from 'react'
import { X } from 'lucide-react'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import QuestionDescriptionModal from '@/app/admin/courses/[courseId]/module/_components/Assessment/QuestionDescriptionModal'

import {setSelectedCodingQuestionsProps,SelectTag,SelectQuestion} from "@/app/admin/courses/[courseId]/module/_components/Assessment/ComponentAssessmentType"
const SelectCodingQuestions = ({
    setSelectedQuestions,
    selectedQuestions,
    tags,
    type,
    setIsNewQuestionAdded,
}:setSelectedCodingQuestionsProps) => {

    const handleQuestionRemoval = (
        question: { id: number; [key: string]: any }, // Assuming 'id' is a number, other properties can be anything
        selectedQuestions: { id: number; [key: string]: any }[],
        setSelectedQuestions: React.Dispatch<React.SetStateAction<{ id: number; [key: string]: any }[]>>,
        setIsNewQuestionAdded: React.Dispatch<React.SetStateAction<boolean>>
      ) => {
        setSelectedQuestions(selectedQuestions.filter((q) => q.id !== question.id));
        setIsNewQuestionAdded(true);
      };

    return (
        <div className="w-full">
            {selectedQuestions.map((question: SelectQuestion) => {
                const tag = tags?.find((tag:SelectTag) => tag.id === question.tagId)

                return (
                    <div key={question.id} className="p-5 rounded-sm border-b border-gray-200 mb-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center justify-between w-full">
                                    <h2 className="font-bold truncate text-[15px] text-gray-600">
                                        {ellipsis(question.title, 25)}
                                    </h2>
                                    <div className="flex gap-2 ml-auto">
                                        {tag && (
                                            <span className="text-sm text-[#518672] bg-[#DCE7E3] rounded-full px-2">
                                                {tag.tagName}
                                            </span>
                                        )}
                                        <span
                                            className={cn(
                                                `text-sm rounded-full px-2`,
                                                difficultyColor(question.difficulty),
                                                difficultyBgColor(question.difficulty)
                                            )}
                                        >
                                            {question.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-1 text-[1rem] text-left">
                                    {ellipsis(question.description, 45)}
                                </p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <p className="font-bold text-sm mt-2 text-[#518672] cursor-pointer text-left">
                                            View Full Description
                                        </p>
                                    </DialogTrigger>
                                    <DialogOverlay />
                                    <QuestionDescriptionModal
                                        question={question}
                                        type="coding"
                                        tagName={tag?.tagName}
                                    />
                                </Dialog>
                            </div>
                            <X
                              onClick={() => {
                                handleQuestionRemoval(
                                  question,
                                  selectedQuestions,
                                  setSelectedQuestions,
                                  setIsNewQuestionAdded
                                );
                              }}
                                className="text-[#A3A3A3] cursor-pointer ml-4"
                                size={20}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default SelectCodingQuestions
