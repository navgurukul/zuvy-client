import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { handleSaveChapter } from '@/utils/admin'
import { getChapterUpdateStatus } from '@/store/store'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import QuestionDescriptionModal from '../Assessment/QuestionDescriptionModal'
import {
    CodingTopicsProps,
    CodingTopicsTag,
    CodingChallangesQuestion,
} from '@/app/[admin]/courses/[courseId]/module/_components/codingChallenge/ModuleCodingChallangeComponentType'

const SelectedProblems = ({
    selectedQuestions,
    setSelectedQuestions,
    content,
    moduleId,
    chapterTitle,
    tags,
}: CodingTopicsProps) => {
    const handleRemoveLastQuestion = () => {
        setSelectedQuestions([])
        handleSaveChapter(
            moduleId,
            content.id,
            chapterTitle
                ? {
                      title: chapterTitle,
                      codingQuestions: null,
                  }
                : {
                      codingQuestions: selectedQuestions[0]?.id,
                  }
        )
    }

    return (
        <div className="flex w-full">
            <Separator orientation="vertical" className="w-0.5 h-screen mx-2" />
            <div className="text-start w-full">
                <h2 className="font-bold mb-5 text-[15px] text-gray-600">
                    Selected Coding Problems
                </h2>
                {selectedQuestions?.length > 0 ? (
                    <div className="w-full">
                        {selectedQuestions?.map(
                            (
                                selectedQuestion: CodingChallangesQuestion,
                                index: number
                            ) => {
                                const selectedTagName = tags?.filter(
                                    (tag: CodingTopicsTag) =>
                                        tag.id == selectedQuestion?.tagId
                                )
                                return (
                                    <div
                                        key={selectedQuestion?.id}
                                        className="py-4 px-8 rounded-lg border border-gray-200 bg-white mb-4"
                                    >
                                        <div className="flex items-center gap-2 justify-between w-full">
                                            <h3 className="font-bold text-[16px] text-gray-600">
                                                {selectedQuestion.title}
                                            </h3>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-sm text-[#518672] bg-[#DCE7E3] py-1 rounded-2xl px-2">
                                                    {
                                                        selectedTagName[0]
                                                            ?.tagName
                                                    }
                                                </span>
                                                <span
                                                    className={cn(
                                                        `text-sm rounded-xl p-1 `,
                                                        difficultyColor(
                                                            selectedQuestion?.difficulty
                                                        ), // Text color
                                                        difficultyBgColor(
                                                            selectedQuestion?.difficulty
                                                        ) // Background color
                                                    )}
                                                >
                                                    {
                                                        selectedQuestion.difficulty
                                                    }
                                                </span>

                                                <XCircle
                                                    className="text-destructive cursor-pointer"
                                                    size={20}
                                                    onClick={
                                                        handleRemoveLastQuestion
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <p className=" text-gray-600 mt-1 mb-2 text-[15px]">
                                            {ellipsis(
                                                selectedQuestion.description,
                                                60
                                            )}
                                        </p>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <p className="font-bold text-sm mt-2 text-primary cursor-pointer">
                                                    View Full Description
                                                </p>
                                            </DialogTrigger>
                                            <DialogOverlay />
                                            <QuestionDescriptionModal
                                                question={selectedQuestion}
                                                type="coding"
                                            />
                                        </Dialog>
                                    </div>
                                )
                            }
                        )}
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-600 italic">
                            No problems selected
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SelectedProblems
