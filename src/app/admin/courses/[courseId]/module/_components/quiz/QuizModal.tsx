import React from 'react'
import { Button } from '@/components/ui/button'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { Edit, XCircle } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
import PreviewMCQ from '@/app/admin/resource/_components/PreviewMcq'
import { isCodeQuestion, renderQuestionPreview } from '@/utils/quizHelpers'
import {Tag} from "@/app/admin/courses/[courseId]/module/_components/quiz/ModuleQuizType"
type Props = {}

const QuizModal = ({
    data,
    removeQuestionById,
    tags,
    addQuestion,
    saveQuizQuestionHandler,
}: any) => {
    const handleClick = async () => {
        removeQuestionById(data.id)
        if (addQuestion.length == 1) {
            const requestBody = {
                quizQuestions: [],
            }
            await saveQuizQuestionHandler(requestBody)
        }
    }
    
    const filteredTag = tags?.filter((tag:Tag) => tag.id == data.tagId)
    const question = data?.quizVariants[0]?.question
    const hasCodeBlock = isCodeQuestion(question)

    return (
        <div className="flex w-full justify-between py-3 items-center border-b h-30 border-gray-200">
            <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-col gap-2 w-full">
                    <div className="font-semibold flex justify-between w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Question Text */}
                            <span className={`text-gray-600 text-[16px] ${hasCodeBlock ? 'font-mono text-sm' : ''}`}>
                                {renderQuestionPreview(question, {
                                    textLength: 40,
                                })}
                            </span>
                        </div>
                        {/* {ellipsis(data?.quizVariants[0]?.question, 40)} */}
                        <div className="mr-4 space-x-2 ">
                            <span className="text-sm text-[#518672] bg-[#DCE7E3] p-1 rounded-[100px] px-[8px]">
                                {filteredTag[0]?.tagName}
                            </span>
                            <span
                                className={cn(
                                    `text-[12px] rounded-[100px] py-1 px-1 `,
                                    difficultyColor(data.difficulty), // Text color
                                    difficultyBgColor(data.difficulty) // Background color
                                )}
                            >
                                {data.difficulty}
                            </span>
                        </div>
                    </div>            
                    <Dialog>
                        <DialogTrigger asChild>
                            <p className=" text-left font-bold text-sm  text-[#518672] cursor-pointer">
                                View Description
                            </p>
                        </DialogTrigger>
                        <DialogOverlay />
                        <DialogContent>
                            <PreviewMCQ
                                quizQuestionId={data.id}
                                tags={tags}
                                tagId={data.tagId}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            
            <XCircle
                size={20}
                onClick={handleClick}
                className="cursor-pointer text-red-600 mb-5 hover:text-red-800 transition-colors flex-shrink-0"
            />
        </div>
    )
}

export default QuizModal