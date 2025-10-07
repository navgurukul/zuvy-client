import React from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
import PreviewOpenEnded from '@/app/admin/resource/_components/PreviewOpenEnded'
import {selectedOpenEndedQuestionsProps,Tag,CodingQuestiones} from "@/app/admin/courses/[courseId]/module/_components/Assessment/ComponentAssessmentType"

const SelectOpenEndedQuestions = ({
    setSelectedQuestions,
    selectedQuestions,
    tags,
    type,
}:selectedOpenEndedQuestionsProps) => {
    return (
        <div className="w-full">
            {selectedQuestions.map((question:CodingQuestiones) => {
                const tag = tags?.find((tag:Tag ) => tag.id === question.tagId)

                return (
                    <div
                        key={question.id}
                        className="py-4 px-8 rounded-lg border border-gray-200 bg-white mt-4"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center justify-between w-full">
                                    <h2 className="font-bold text-[15px] truncate text-gray-600">
                                        {ellipsis(question.question, 30)}
                                    </h2>
                                    <div className="flex gap-2 ml-auto">
                                        {tag && (
                                            <span className="text-sm text-[#518672] bg-[#DCE7E3] rounded-full px-2">
                                                {tag?.tagName}
                                            </span>
                                        )}
                                        <span
                                            className={cn(
                                                `text-[12px] rounded-full px-2`,
                                                difficultyColor(
                                                    question.difficulty
                                                ),
                                                difficultyBgColor(
                                                    question.difficulty
                                                )
                                            )}
                                        >
                                            {question.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-1 text-[1rem] text-left">
                                    {ellipsis(question.question, 60)}
                                </p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <p className="font-bold text-sm mt-2 text-primary cursor-pointer text-left">
                                            View Full Description
                                        </p>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <PreviewOpenEnded
                                            question={question}
                                            tag={tag}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <X
                                onClick={() =>
                                    setSelectedQuestions(
                                        selectedQuestions.filter(
                                            (q: CodingQuestiones) => q.id !== question.id
                                        )
                                    )
                                }
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

export default SelectOpenEndedQuestions
