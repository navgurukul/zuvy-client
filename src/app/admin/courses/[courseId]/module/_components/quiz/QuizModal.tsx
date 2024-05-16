import { Button } from '@/components/ui/button'
import { difficultyColor } from '@/lib/utils'
import { X } from 'lucide-react'
import React from 'react'

type Props = {}

const QuizModal = ({ data, removeQuestionById }: any) => {
    const handleClick = () => {
        removeQuestionById(data.id)
    }
    return (
        <div className="flex justify-between p-3 bg-gray-100 border-2 rounded-lg border-gray-400">
            <div className="flex flex-col gap-2  ">
                <div className="flex gap-2">
                    <h1 className="font-semibold">{data.question}</h1>
                    <p className="font-semibold">Difficulty -</p>
                    <h2
                        className={`${difficultyColor(
                            data.difficulty
                        )} font-semibold `}
                    >
                        {data.difficulty}
                    </h2>
                </div>
                <Button
                    className="flex w-1/3 text-secondary font-semibold text-md justify-start mr-10"
                    variant={'ghost'}
                >
                    Edit Question
                </Button>
            </div>
            <X size={20} onClick={handleClick} className="cursor-pointer" />
        </div>
    )
}

export default QuizModal
