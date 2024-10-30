import React, { useState } from 'react'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { X } from 'lucide-react'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import QuestionDescriptionModal from '@/app/admin/courses/[courseId]/module/_components/Assessment/QuestionDescriptionModal'

const SelectCodingQuestions = ({
    setSelectedQuestions,
    selectedQuestions,
    tags,
    type,
}: {
    setSelectedQuestions: React.Dispatch<React.SetStateAction<any[]>>
    selectedQuestions: any[]
    tags: any
    type: string
}) => {
    return (
        <>
            <div className="w-full">
                {selectedQuestions.map((question: any) => {
                    // Find the tag name corresponding to the question's tagId
                    const tag = tags?.find(
                        (tag: any) => tag.id === question.tagId
                    )

                    return (
                        <div key={question.id}>
                            <div className="p-5 rounded-sm border-b border-gray-200 mb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-bold truncate">
                                                {ellipsis(question.title, 30)}
                                            </h2>
                                            {tag && (
                                                <span className="text-sm text-[#518672] bg-[#DCE7E3] rounded-[100px] px-[8px]">
                                                    {tag.tagName}
                                                </span>
                                            )}
                                            <span
                                                className={cn(
                                                    `text-sm rounded-[100px] px-[8px]`,
                                                    difficultyColor(
                                                        question.difficulty
                                                    ), // Text color
                                                    difficultyBgColor(
                                                        question.difficulty
                                                    ) // Background color
                                                )}
                                            >
                                                {question.difficulty}
                                            </span>
                                        </div>
                                        <div className="w-full">
                                            <p className="text-gray-600 mt-1 text-left">
                                                {ellipsis(
                                                    question.description,
                                                    60
                                                )}
                                            </p>
                                        </div>
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
                                    <div className="flex items-center">
                                        <X
                                            onClick={() =>
                                                setSelectedQuestions(
                                                    selectedQuestions.filter(
                                                        (q: any) =>
                                                            q.id !== question.id
                                                    )
                                                )
                                            }
                                            className="text-[#A3A3A3] cursor-pointer ml-4"
                                            size={20}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default SelectCodingQuestions
