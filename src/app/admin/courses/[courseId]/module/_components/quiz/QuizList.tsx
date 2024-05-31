import { Separator } from '@/components/ui/separator'
import { PlusCircle } from 'lucide-react'
import { difficultyColor, ellipsis } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

function QuizList({
    questionData,
    addQuestion = [],
    handleAddQuestion,
}: {
    questionData: any[]
    addQuestion: any[]
    handleAddQuestion: (questions: any[]) => void
}) {
    return (
        <ScrollArea className="h-[550px] w-full  ">
            {questionData.map((question: any) => {
                const isSelected = addQuestion?.some(
                    (quest: any) => quest?.id === question.id
                )
                const handleClick = () => {
                    if (!isSelected) {
                        handleAddQuestion([...addQuestion, question])
                    } else {
                    }
                }
                return (
                    <div
                        // className="flex flex-col justify-between"
                        key={question.id}
                    >
                        <div className="flex items-center justify-between gap-x-4 py-4">
                            <div className="flex justify-start items-center gap-x-5">
                                <h1 className="scroll-m-20 text-4xl  font-semibold tracking-tight lg:text-lg">
                                    {ellipsis(question.question, 40)}
                                </h1>
                                <span
                                    className={`font-semibold ${difficultyColor(
                                        question.difficulty
                                    )}`}
                                >
                                    {question.difficulty}
                                </span>
                            </div>
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
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                            ) : (
                                <PlusCircle
                                    size={20}
                                    className="text-secondary cursor-pointer "
                                    onClick={handleClick}
                                />
                            )}
                        </div>
                        {/* <Separator className="my-4" /> */}
                    </div>
                )
            })}
        </ScrollArea>
    )
}

export default QuizList
