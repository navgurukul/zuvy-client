import React from 'react'
import { Button } from '@/components/ui/button'
import { difficultyColor } from '@/lib/utils'
import { Edit, XCircle } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
type Props = {}

const QuizModal = ({ data, removeQuestionById }: any) => {
    const handleClick = () => {
        removeQuestionById(data.id)
    }
    return (
        <div className="flex justify-between p-3   rounded-lg border-gray-400">
            <div className="flex flex-col gap-2  ">
                <div className="flex gap-2">
                    <h1 className="font-semibold">{data.question}</h1>
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
                    <Edit size={15} />
                </Button>
            </div>
            <XCircle
                size={20}
                onClick={handleClick}
                className="cursor-pointer text-red-600"
            />
        </div>
    )
}

export default QuizModal
