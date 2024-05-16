import { Separator } from '@/components/ui/separator'
import { PlusCircle } from 'lucide-react'
import { difficultyColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
        <>
            {questionData.map((question: any) => {
                const isSelected = addQuestion?.some(
                    (quest: any) => quest?.id === question.id
                )
                const handleClick = () => {
                    if (!isSelected) {
                        handleAddQuestion([...addQuestion, question])
                    }
                }
                return (
                    <div
                        className="flex flex-col justify-between"
                        key={question.id}
                    >
                        <div className="flex w-full justify-between gap-x-4 my-4">
                            <div className="flex justify-start items-center gap-x-5">
                                <h1 className="scroll-m-20 text-4xl  font-semibold tracking-tight lg:text-lg">
                                    {question.question}
                                </h1>
                                <span
                                    className={`font-semibold ${difficultyColor(
                                        question.difficulty
                                    )}`}
                                >
                                    {question.difficulty}
                                </span>
                            </div>
                            <Button className="" variant={'ghost'}>
                                <PlusCircle
                                    size={20}
                                    className="text-secondary cursor-pointer"
                                    onClick={handleClick}
                                />
                            </Button>
                        </div>
                        <Separator className="my-4" />
                    </div>
                )
            })}
        </>
    )
}

export default QuizList
