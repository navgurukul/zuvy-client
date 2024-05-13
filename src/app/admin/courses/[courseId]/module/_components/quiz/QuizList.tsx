import { Separator } from '@/components/ui/separator'
import { Plus, PlusCircle, XCircle } from 'lucide-react'
import React from 'react'

function QuizList({ questionData }: any) {
    function getColorByDifficulty(difficulty: string): string {
        switch (difficulty) {
            case 'Hard':
                return 'text-red-600'
            case 'Medium':
                return 'text-yellow-600'
            case 'Easy':
                return 'text-secondary'
            default:
                return ''
        }
    }

    return (
        <>
            {questionData.map((question: any) => (
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
                                className={`font-semibold ${getColorByDifficulty(
                                    question.difficulty
                                )}`}
                            >
                                {question.difficulty}
                            </span>
                        </div>
                        <PlusCircle
                            size={20}
                            className="text-secondary cursor-pointer "
                        />
                    </div>
                    <Separator className="my-4" />
                </div>
            ))}
        </>
    )
}

export default QuizList
