import React from 'react'
import { Button } from '@/components/ui/button'
import { difficultyColor, ellipsis } from '@/lib/utils'
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

    console.log(data)

    return (
        <div className="flex justify-between py-3 items-center">
            <div className="flex flex-col gap-2  ">
                <div className="flex gap-2">
                    <h1 className="font-semibold">
                        {/* {ellipsis(data?.quizVariants[0]?.question, 40)} */}
                    </h1>
                    <h2
                        className={`${difficultyColor(
                            data.difficulty
                        )} font-semibold `}
                    >
                        {data.difficulty}
                    </h2>
                </div>
                {/* <Button
                    className="flex w-1/3 text-secondary font-semibold text-md justify-start mr-10"
                    variant={'ghost'}
                >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Edit size={15} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit Quiz question</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Button> */}
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
