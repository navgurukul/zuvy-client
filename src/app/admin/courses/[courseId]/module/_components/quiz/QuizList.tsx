import { Separator } from '@/components/ui/separator'
import { PlusCircle } from 'lucide-react'
import { cn, difficultyBgColor, difficultyColor, ellipsis, stripHtmlTags } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
import PreviewMCQ from '@/app/admin/resource/_components/PreviewMcq'
import {QuizListQuestion,QuizListTag,Tag} from "@/app/admin/courses/[courseId]/module/_components/quiz/ModuleQuizType"
import { renderQuestionPreview } from '@/utils/quizHelpers'

function QuizList({
    questionData,
    addQuestion = [],
    handleAddQuestion,
    tags,
}: {
    questionData: any[]
    addQuestion: any[]
    handleAddQuestion: (questions: QuizListQuestion[]) => void
    tags: any
}) {
    return (
        <ScrollArea className="h-[calc(100vh-180px)] pb-40 pr-4">
            {questionData.map((question:QuizListQuestion) => {
                const isSelected = addQuestion?.some(
                    (quest: QuizListQuestion) => quest?.id === question.id
                )
                const handleClick = () => {
                    if (!isSelected) {
                        handleAddQuestion([...addQuestion, question])
                    } else {
                    }
                }
                const newTagName = tags?.filter(
                    (tag: QuizListTag) => tag.id == question.tagId
                )

                return (
                    <div
                        className="py-4 px-8 rounded-lg border border-gray-200 bg-white mt-4"
                        key={question.id}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="w-full space-y-2 ">
                                <div className="flex justify-between items-center gap-x-2">
                                    <h1 className="scroll-m-20 text-base text-gray-600 font-semibold tracking-tight lg:text-lg">
                                        {renderQuestionPreview(
                                            question.quizVariants[0]?.question,
                                            { textLength: 40 }
                                        )}
                                    </h1>
                                    <div className="flex mr-4">
                                        <div className="space-x-2 mr-4">
                                            <span className="text-sm text-[#518672] bg-[#DCE7E3] p-1 rounded-[100px] px-[8px]">
                                                {newTagName[0]?.tagName}
                                            </span>
                                            <span
                                                className={cn(
                                                    `text-sm rounded-xl px-2 py-1 mt-5 mr-3 `,
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
                                        <div className="flex mt-0.5">
                                            {isSelected ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="lucide lucide-circle-check"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                    />
                                                    <path d="m9 12 2 2 4-4" />
                                                </svg>
                                            ) : (
                                                <PlusCircle
                                                    size={20}
                                                    className="text-primary cursor-pointer "
                                                    onClick={handleClick}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <p className=" text-left font-bold text-sm  text-primary cursor-pointer">
                                            View Full Description
                                        </p>
                                    </DialogTrigger>
                                    <DialogOverlay />
                                    <DialogContent>
                                        <PreviewMCQ
                                            quizQuestionId={question.id}
                                            tags={tags}
                                            tagId={question.tagId}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        {/* <Separator className="my-4" /> */}
                    </div>
                )
            })}
        </ScrollArea>
    )
}

export default QuizList
